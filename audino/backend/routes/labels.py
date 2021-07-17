import sqlalchemy as sa
import uuid

from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse

from backend import app, db
from backend.models import User, Label, LabelValue, Project

from . import api


@api.route("/labels/<int:label_id>/values", methods=["POST"])
@jwt_required
def add_value_to_label(label_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    value = request.json.get("value", None)

    if not value:
        return (
            jsonify(message="Please provide a label value!",
                    type="VALUE_MISSING"),
            400,
        )

    try:
        label_value = LabelValue(value=value, label_id=label_id)
        db.session.add(label_value)
        db.session.commit()
        db.session.refresh(label_value)
    except Exception as e:
        if type(e) == sa.exc.IntegrityError:
            app.logger.info(f"Label Value: {value} already exists!")
            app.logger.info(e)
            return (
                jsonify(
                    message=f"Label Value: {value} already exists!",
                    type="DUPLICATE_VALUE",
                ),
                409,
            )
        app.logger.error(f"Error adding value to label")
        app.logger.error(e)
        return (
            jsonify(
                message=f"Error adding value to label",
                type="VALUE_CREATION_FAILED"
            ),
            500,
        )

    return (
        jsonify(
            value_id=label_value.id,
            message=f"Value assigned to label",
            type="VALUE_ASSIGNED_TO_LABEL",
        ),
        201,
    )


@api.route("/labels/<int:label_id>/values", methods=["GET"])
@jwt_required
def get_values_for_label(label_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        values = LabelValue.query.filter_by(label_id=label_id).all()
        response = [
            {
                "value_id": value.id,
                "value": value.value,
                "created_on": value.created_at.strftime("%B %d, %Y"),
            }
            for value in values
        ]
    except Exception as e:
        error = f"No values exists for label with id: {label_id}"
        app.logger.error(error)
        app.logger.error(e)
        return (jsonify(message=error), 404)

    return (jsonify(values=response), 200)


@api.route("/labels/<int:label_id>/values/<int:label_value_id>",
           methods=["GET"])
@jwt_required
def fetch_label_value(label_id, label_value_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        value = LabelValue.query.get(label_value_id)
    except Exception as e:
        error = f"No value found with value id: {label_value_id}"
        app.logger.error(error)
        app.logger.error(e)
        return (jsonify(message=error), 404)

    return (
        jsonify(
            values={
                "value_id": value.id,
                "value": value.value,
                "created_on": value.created_at.strftime("%B %d, %Y"),
            }
        ),
        200,
    )


@api.route("/labels/<int:label_id>/values/<int:label_value_id>",
           methods=["DELETE"])
@jwt_required
def delete_label_value(label_id, label_value_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        value = LabelValue.query.get(label_value_id)
        db.session.delete(value)
        db.session.commit()
    except Exception as e:
        error_msg = f"No value found with value id: {label_value_id}"
        app.logger.error(error_msg)
        app.logger.error(e)
        return (jsonify(message=error_msg), 404)

    return (
        jsonify(
            values={
                "value_id": value.id,
                "value": value.value,
                "created_on": value.created_at.strftime("%B %d, %Y"),
            }
        ),
        200,
    )


@api.route("/labels/<int:label_id>/values/<int:label_value_id>",
           methods=["PATCH"])
@jwt_required
def update_value_for_label(label_id, label_value_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    value = request.json.get("value", None)

    if not value:
        return (
            jsonify(message="Please provide a label value!",
                    type="VALUE_MISSING"),
            400,
        )
    err = f"Label Value ID: {label_value_id} no exist w/ Label ID: {label_id}"
    try:
        label_value = LabelValue.query.get(label_value_id)
        label_value.set_label_value(value)
        db.session.commit()
    except Exception as e:
        if type(e) == sa.exc.IntegrityError:
            app.logger.info(f"Label Value: {value} already exists!")
            return (
                jsonify(
                    message=f"Label Value: {value} already exists!",
                    type="DUPLICATE_VALUE",
                ),
                409,
            )
        app.logger.error(err)
        app.logger.error(e)
        return (
            jsonify(
                message=err
            ),
            404,
        )

    return (
        jsonify(
            value_id=label_value.id,
            value=label_value.value,
            created_on=label_value.created_at.strftime("%B %d, %Y"),
        ),
        200,
    )


@api.route("/labels/<int:label_id>/projectId/<int:project_id>",
           methods=["DELETE"])
@jwt_required
def delete_label(label_id, project_id):
    app.logger.info("============================")
    app.logger.info(label_id)
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        LabelCat = Label.query.get(label_id)
        project = Project.query.get(project_id)
        LabelValues = LabelValue.query.filter_by(label_id=label_id).all()

        for value in LabelValues:
            db.session.delete(value)
            db.session.commit()

        project.labels.remove(LabelCat)
        db.session.delete(LabelCat)
        db.session.commit()

    except Exception as e:
        app.logger.error(e)
        return (jsonify(message=f"No value found with value id: {LabelCat}"),
                404)

    return (
        jsonify(
            message="success"
        ),
        200,
    )
