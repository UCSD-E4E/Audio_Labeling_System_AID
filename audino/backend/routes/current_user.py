import sqlalchemy as sa
import uuid

from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse

from backend import app, db
from backend.models import Project, User, Data, Segmentation

from . import api


@api.route("/current_user/projects", methods=["GET"])
@jwt_required
def fetch_current_user_projects():
    identity = get_jwt_identity()

    try:
        request_user = User.query.filter_by(username=identity["username"]
                                            ).first()
        response = list(
            [
                {
                    "project_id": project.id,
                    "name": project.name,
                    "created_by": project.creator_user.username,
                    "created_on": project.created_at.strftime("%B %d, %Y"),
                }
                for project in request_user.projects
            ]
        )
    except Exception as e:
        message = "Error fetching all projects"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 500

    return jsonify(projects=response), 200


@api.route("/current_user/projects/<int:project_id>/data", methods=["GET"])
@jwt_required
def fetch_data_for_project(project_id):
    identity = get_jwt_identity()

    page = request.args.get("page", 1, type=int)
    active = request.args.get("active", "pending", type=str)

    try:
        request_user = User.query.filter_by(username=identity["username"]
                                            ).first()
        project = Project.query.get(project_id)

        if request_user not in project.users:
            return jsonify(message="Unauthorized access!"), 401

        segmentations = db.session.query(Segmentation.data_id
                                         ).distinct().subquery()

        data = {}
        data["pending"] = (
            db.session.query(Data)
            .filter(Data.project_id == project_id)
            .filter(Data.id.notin_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        data["completed"] = (
            db.session.query(Data)
            .filter(Data.project_id == project_id)
            .filter(Data.id.in_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        data["marked_review"] = Data.query.filter_by(
            project_id=project_id,
            is_marked_for_review=True,
        ).order_by(Data.last_modified.desc())

        data["all"] = Data.query.filter_by(
            project_id=project_id
        ).order_by(Data.last_modified.desc())

        paginate_data = data[active].paginate(page, 10, False)

        next_page = paginate_data.next_num if paginate_data.has_next else None
        prev_page = paginate_data.prev_num if paginate_data.has_prev else None

        response = list(
            [
                {
                    "data_id": data_point.id,
                    "filename": data_point.filename,
                    "original_filename": data_point.original_filename,
                    "created_on": "a date",
                    # data_point.created_at.strftime("%B %d, %Y"),
                    "is_marked_for_review": data_point.is_marked_for_review,
                    "number_of_segmentations": len(data_point.segmentations),
                    "sampling_rate": data_point.sampling_rate,
                    "clip_length": data_point.clip_length,
                }
                for data_point in paginate_data.items
            ]
        )
        count_data = {key: value.count() for key, value in data.items()}
    except Exception as e:
        message = "Error fetching all data points"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 500

    return (
        jsonify(
            data=response,
            count=count_data,
            next_page=next_page,
            prev_page=prev_page,
            page=page,
            active=active,
        ),
        200,
    )


@api.route("/current_user/projects/<int:project_id>/data/<int:data_value>",
           methods=["GET"])
@jwt_required
def get_next_data(project_id, data_value):
    identity = get_jwt_identity()

    page = request.args.get("page", 1, type=int)
    active = request.args.get("active", "completed", type=str)

    try:
        request_user = User.query.filter_by(username=identity["username"]
                                            ).first()
        project = Project.query.get(project_id)
        project = Project.query.get(project_id)

        if request_user not in project.users:
            return jsonify(message="Unauthorized access!"), 401

        segmentations = db.session.query(Segmentation.data_id
                                         ).distinct().subquery()
        # Lets set big id to the {username.idenity, username.id}
        # this would make it fast but aslo render serval data points
        data = {}
        big_key = identity["username"]
        # print(Data.assigned_user_id)
        # for key in Data.assigned_user_id:
        #    if request_user.id == Data.assigned_user_id[key]:
        #        big_key = key
        #        print(big_key, key)
        data["pending"] = (
            db.session.query(Data)
            .filter(request_user.id == Data.assigned_user_id[big_key])
            .filter(Data.project_id == project_id)
            .filter(Data.id.notin_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        data["completed"] = (
            db.session.query(Data)
            .filter(request_user.id == Data.assigned_user_id[big_key])
            .filter(Data.project_id == project_id)
            .filter(Data.id.in_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        paginated_data_pending = data["pending"].paginate(page, 10, False)
        paginated_data_complet = data["completed"].paginate(page, 10, False)
        paginate_data = paginated_data_pending

        if (active != "pending"):
            for data_pt in paginated_data_complet.items:
                if data_pt.id == data_value:
                    active = "completed"
                    paginate_data = paginated_data_complet
                    break
            app.logger.info(active)

        next_page = paginate_data.next_num if paginate_data.has_next else None
        prev_page = paginate_data.prev_num if paginate_data.has_prev else None
        response = list(
            [
                {
                    "data_id": data_point.id,
                    "filename": data_point.filename,
                    "original_filename": data_point.original_filename,
                    "created_on": data_point.created_at.strftime("%B %d, %Y"),
                    "is_marked_for_review": data_point.is_marked_for_review,
                    "number_of_segmentations": len(data_point.segmentations),
                    "sampling_rate": data_point.sampling_rate,
                    "clip_length": data_point.clip_length,
                }
                for data_point in paginate_data.items
            ]
        )
        count_data = {key: value.count() for key, value in data.items()}
    except Exception as e:
        message = "Error fetching all data points"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 501

    return (
        jsonify(
            data=response,
            count=count_data,
            next_page=next_page,
            prev_page=prev_page,
            page=page,
            active=active,
        ),
        200,
    )


@api.route(
 "/current_user/projects/<int:project_id>/data/<int:dv>/page/<int:page_data>",
 methods=["GET"]
)
@jwt_required
def get_next_data2(project_id, dv, page_data):
    data_value = dv
    identity = get_jwt_identity()

    page = page_data
    active = request.args.get("active", "completed", type=str)

    try:
        request_user = User.query.filter_by(username=identity["username"]
                                            ).first()
        project = Project.query.get(project_id)
        project = Project.query.get(project_id)

        if request_user not in project.users:
            return jsonify(message="Unauthorized access!"), 401

        segmentations = db.session.query(Segmentation.data_id
                                         ).distinct().subquery()
        # Lets set big id to the {username.idenity, username.id}
        # this would make it fast but aslo render serval data points
        data = {}
        big_key = identity["username"]
        # print(Data.assigned_user_id)
        # for key in Data.assigned_user_id:
        #    if request_user.id == Data.assigned_user_id[key]:
        #        big_key = key
        #        print(big_key, key)
        data["pending"] = (
            db.session.query(Data)
            .filter(request_user.id == Data.assigned_user_id[big_key])
            .filter(Data.project_id == project_id)
            .filter(Data.id.notin_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        data["completed"] = (
            db.session.query(Data)
            .filter(request_user.id == Data.assigned_user_id[big_key])
            .filter(Data.project_id == project_id)
            .filter(Data.id.in_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        paginated_data_pending = data["pending"].paginate(page, 10, False)
        paginated_data_complet = data["completed"].paginate(page, 10, False)
        paginate_data = paginated_data_pending

        if (active != "pending"):
            for data_pt in paginated_data_complet.items:
                if data_pt.id == data_value:
                    active = "completed"
                    paginate_data = paginated_data_complet
                    break
            app.logger.info(active)

        next_page = paginate_data.next_num if paginate_data.has_next else None
        prev_page = paginate_data.prev_num if paginate_data.has_prev else None
        response = list(
            [
                {
                    "data_id": data_point.id,
                    "filename": data_point.filename,
                    "original_filename": data_point.original_filename,
                    "created_on": data_point.created_at.strftime("%B %d, %Y"),
                    "is_marked_for_review": data_point.is_marked_for_review,
                    "number_of_segmentations": len(data_point.segmentations),
                    "sampling_rate": data_point.sampling_rate,
                    "clip_length": data_point.clip_length,
                }
                for data_point in paginate_data.items
            ]
        )
        count_data = {key: value.count() for key, value in data.items()}
    except Exception as e:
        message = "Error fetching all data points"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 501

    return (
        jsonify(
            data=response,
            count=count_data,
            next_page=next_page,
            prev_page=prev_page,
            page=page,
            active=active,
        ),
        200,
    )


@api.route(
 "/current_user/unknown/projects/<int:project_id>/data/<int:data_value>",
 methods=["GET"]
)
@jwt_required
def get_next_data_unknown(project_id, data_value):
    identity = get_jwt_identity()

    # page = request.args.get("page", 1, type=int)
    active = request.args.get("active", "completed", type=str)

    try:
        request_user = User.query.filter_by(username=identity["username"]
                                            ).first()
        project = Project.query.get(project_id)
        project = Project.query.get(project_id)

        if request_user not in project.users:
            return jsonify(message="Unauthorized access!"), 401

        segmentations = db.session.query(Segmentation.data_id
                                         ).distinct().subquery()
        # Lets set big id to the {username.idenity, username.id}
        # this would make it fast but aslo render serval data points
        data = {}
        big_key = identity["username"]
        # print(Data.assigned_user_id)
        # for key in Data.assigned_user_id:
        #    if request_user.id == Data.assigned_user_id[key]:
        #        big_key = key
        #        print(big_key, key)
        data["pending"] = (
            db.session.query(Data)
            .filter(Data.project_id == project_id)
            .filter(Data.id.notin_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        data["completed"] = (
            db.session.query(Data)
            .filter(Data.project_id == project_id)
            .filter(Data.id.in_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        active = "unknown"
        if (active != "pending"):
            for data_pt in data["completed"]:
                if data_pt.id == data_value:
                    active = "completed"
                    break
            if (active == "unknown"):
                active = "pending"
            app.logger.info(active)

        page = -1
        test_page = 1
        while (page == -1):
            paginated_data = data[active].paginate(test_page, 10, False)
            next = paginated_data.next_num if paginated_data.has_next else None
            prev = paginated_data.prev_num if paginated_data.has_prev else None
            for data_point in paginated_data.items:
                if (data_point.id == data_value):
                    response = list(
                        [
                            {
                                "data_id": data_point.id,
                            }
                            for data_point in paginated_data.items
                        ]
                    )
                    return (
                        jsonify(
                            data=response,
                            next_page=next,
                            prev_page=prev,
                            page=test_page,
                            active=active,
                        ),
                        200,
                    )
            if (next_page is not None):
                test_page += 1
    except Exception as e:
        message = "Error fetching all data points"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 501
    message = f"Error data value `{data_value}` not in project"
    app.logger.error(message)
    return jsonify(message=message), 404


@api.route("/current_user/projects/get_all", methods=["GET"])
@jwt_required
def get_all():
    identity = get_jwt_identity()
    app.logger.info("made it this far")
    # page = request.args.get("page", 1, type=int)
    # active = request.args.get("active", "completed", type=str)

    try:
        request_user = User.query.filter_by(username=identity["username"]
                                            ).first()

        # debug to improve secuiuty
        # if request_user not in project.users:
        #    return jsonify(message="Unauthorized access!"), 401

        segmentations = db.session.query(Segmentation.data_id
                                         ).distinct().subquery()
        # Lets set big id to the {username.idenity, username.id}
        # this would make it fast but aslo render serval data points
        data = {}
        big_key = identity["username"]
        # print(Data.assigned_user_id)
        # for key in Data.assigned_user_id:
        #    if request_user.id == Data.assigned_user_id[key]:
        #        big_key = key
        #        print(big_key, key)
        app.logger.info("made it this far")
        data["pending"] = (
            db.session.query(Data)
            .distinct()
            .order_by(Data.last_modified.desc())
            .all()
        )
        app.logger.info("made it this far")
        paginated_data = data["pending"]
        response = []
        for data_point in paginated_data:
            date = ""
            if data_point.created_at is not None:
                date = data_point.created_at.strftime("%B %d, %Y")
            else:
                date = "N/a"
            new_data = {
                    "data_id": data_point.id,
                    "filename": data_point.filename,
                    "original_filename": data_point.original_filename,
                    "created_on": date,
                    "is_marked_for_review": data_point.is_marked_for_review,
                    "number_of_segmentations": len(data_point.segmentations),
                    "sampling_rate": data_point.sampling_rate,
                    "clip_length": data_point.clip_length,
                }
            response.append(new_data)
        app.logger.info("made it this far")
        count_data = {}
        count = 0
        for key in data:
            count += 1
            count_data[key] = count
    except Exception as e:
        message = "Error fetching all data points"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 501

    return (
        jsonify(
            data=response,
            count=count_data,
        ),
        200,
    )
