from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity,
    get_jti,
    get_raw_jwt,
)
from werkzeug.urls import url_parse
from werkzeug.exceptions import BadRequest
from backend import app,  db, jwt, redis_client
from backend.models import Logs, User
import json
from . import api

@api.route("/log_msg", methods=["POST"])
@jwt_required
def post_log_msg_request():
    identity = get_jwt_identity()
    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400
    request_user = User.query.filter_by(username=identity["username"]).first()
    project_id = int(request.json.get("project_id", None))
    message = request.json.get("message", "")
    post_log_msg(message, request_user.id, project_id)

   
#if you wanted to use this in a normal request so we don't cluter the site, tada
def post_log_msg(message, request_user, project_id=None):
    try:
        log = Logs(project_id=project_id,message=message, created_by=request_user)

        db.session.add(log)
        db.session.commit()
        db.session.refresh(log)

    except Exception as e:
        app.logger.error(f"Could not create log")
        app.logger.error(e)
        return (
            jsonify(
                message=f"Could not create segmentation",
                type="LOG_CREATION FAILED",
            ),
            500,
        )

    return (
        jsonify(log=log.id, message=message, type="LOG_CREATED"),
        201,
    )


@api.route("/log_msg", methods=["GET"])
@jwt_required
def get_logs():
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False
    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401
    messages =  Logs.query.all()
    json_output = {}
    for msg in messages:
        json_output[msg.id] = msg.to_dict()
    
    return json_output, 200
    #if request_user not in project.users:
    #    return jsonify(message="Unauthorized access!"), 401
