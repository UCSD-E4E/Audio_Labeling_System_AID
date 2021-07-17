import sqlalchemy as sa

from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity,
    get_jti,
    get_raw_jwt,
)
from werkzeug.urls import url_parse

from backend import app, db, redis_client
from backend.models import User

from . import api


@api.route("/users", methods=["POST"])
@jwt_required
def create_user():
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    username = request.json.get("username", None)
    password = request.json.get("password", None)
    role_id = request.json.get("role", None)

    if not username:
        return (
            jsonify(message="Please provide your username!",
                    type="USERNAME_MISSING"),
            400,
        )
    if not password:
        return (
            jsonify(message="Please provide your password!",
                    type="PASSWORD_MISSING"),
            400,
        )

    if not role_id:
        return (jsonify(message="Please provide your role!",
                type="ROLE_MISSING"), 400)

    if role_id not in ["1", "2"]:
        return (
            jsonify(message="Please assign correct role!",
                    type="ROLE_INCORRECT"),
            400,
        )

    try:
        user = User(username=username, role_id=role_id)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
    except Exception as e:
        if type(e) == sa.exc.IntegrityError:
            app.logger.info(f"User {username} already exists!")
            return (jsonify(message="User already exists!",
                    type="DUPLICATE_USER"), 409)
        app.logger.error("Error creating user")
        app.logger.error(e)
        return jsonify(message="Error creating user!"), 500

    return jsonify(user_id=user.id, message="User has been created!"), 201


@api.route("/users/no_auth", methods=["POST"])
def create_user_no_auth():
    authNeeded = request.json.get("authNeeded", None)
    dont_make_admin = False
    if (not authNeeded):
        dont_make_admin = True
    app.logger.info("this far")
    print("hello?")

    identity = get_jwt_identity()
    app.logger.info(identity)
    if (identity is None):
        if (authNeeded):
            return jsonify(message="Unauthorized access!"), 401
    else:
        request_user = User.query.filter_by(username=identity["username"]
                                            ).first()
        is_admin = True if request_user.role.role == "admin" else False
        authNeeded = not(is_admin)

    if authNeeded:  # is_admin is False and authNeeded) or
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    app.logger.info("this far")

    username = request.json.get("username", None)
    password = request.json.get("password", None)
    role_id = "2"
    app.logger.info(role_id)

    if not username:
        return (
            jsonify(message="Please provide your username!",
                    type="USERNAME_MISSING"),
            400,
        )
    if not password:
        return (
            jsonify(message="Please provide your password!",
                    type="PASSWORD_MISSING"),
            400,
        )

    app.logger.info("this far")

    if not role_id:
        return (jsonify(message="Please provide your role!",
                type="ROLE_MISSING"), 400)

    if role_id not in ["1", "2"]:
        return (
            jsonify(message="Please assign correct role!",
                    type="ROLE_INCORRECT"),
            400,
        )
    app.logger.info("this far")
    try:
        user = User(username=username, role_id=role_id)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
    except Exception as e:
        if type(e) == sa.exc.IntegrityError:
            app.logger.info(f"User {username} already exists!")
            return (jsonify(message="User already exists!",
                    type="DUPLICATE_USER"), 409)
        app.logger.error("Error creating user")
        app.logger.error(e)
        return jsonify(message="Error creating user!"), 500

    return jsonify(user_id=user.id, message="User has been created!"), 201


@api.route("/users/<int:user_id>", methods=["GET"])
@jwt_required
def fetch_user(user_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        user = User.query.get(user_id)
    except Exception as e:
        app.logger.error(f"No user exists with user_id: {user_id}")
        app.logger.error(e)
        return (
            jsonify(message="No user exists with given user_id",
                    user_id=user_id),
            404,
        )

    return (
        jsonify(
            user_id=user.id,
            username=user.username,
            role_id=user.role.id,
            role=user.role.role,
        ),
        200,
    )


@api.route("/users/<int:user_id>", methods=["PATCH"])
@jwt_required
def update_user(user_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    role_id = request.json.get("role", None)
    newUserName = request.json.get("newUserName", None)

    if not role_id:
        return (jsonify(message="Please provide your role!",
                type="ROLE_MISSING"), 400)

    role_id = int(role_id)

    if role_id not in [1, 2]:
        return (
            jsonify(message="Please assign correct role!",
                    type="ROLE_INCORRECT"),
            400,
        )

    try:
        users = db.session.query(User).filter_by(role_id=1).all()

        if len(users) == 1 and users[0].id == user_id and role_id == 2:
            return jsonify(message="Atleast one admin should exist"), 400

        user = User.query.get(user_id)
        user.set_role(role_id)
        user.set_username(newUserName)
        db.session.commit()
        if (request_user.id == user_id):
            app.logger.info(request_user, user)
            is_admin = True if user.role.role == "admin" else False
            app.logger.info(user.id)
            data = {"username": newUserName, "is_admin": is_admin,
                    "user_id": user.id}
            app.logger.info(data)
            try:
                access_token = create_access_token(
                    identity=data,
                    fresh=True,
                    expires_delta=app.config["JWT_ACCESS_TOKEN_EXPIRES"],
                )
            except Exception as e:
                message = "probelm with access Token"
                app.logger.error(message)
                app.logger.error(e)
                app.logger.error(e.with_traceback)
                return jsonify(message=message), 450
            app.logger.info("here")
            access_jti = get_jti(encoded_token=access_token)

            redis_client.set(access_jti, "false",
                             app.config["JWT_ACCESS_TOKEN_EXPIRES"] * 1.2)
            return (
                jsonify(
                    username=user.username,
                    access_token=access_token,
                    role=user.role.role,
                    role_id=user.role.id,
                    message="User has been updated!",
                ),
                200,
            )
    except Exception as e:
        app.logger.error("No user found")
        app.logger.error(e)
        return jsonify(message="No user found!"), 404

    return (
        jsonify(
            username=user.username,
            role=user.role.role,
            role_id=user.role.id,
            message="User has been updated!",
        ),
        200,
    )


@api.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required
def delete_user(user_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    role_id = request.json.get("role", None)

    if not role_id:
        return (jsonify(message="Please provide your role!",
                type="ROLE_MISSING"), 400)

    role_id = int(role_id)

    if role_id not in [1, 2]:
        return (
            jsonify(message="Please assign correct role!",
                    type="ROLE_INCORRECT"),
            400,
        )

    try:
        users = db.session.query(User).filter_by(role_id=1).all()

        if len(users) == 1 and users[0].id == user_id and role_id == 2:
            return jsonify(message="Atleast one admin should exist"), 400

        user = User.query.get(user_id)
        if (request_user == user):
            return jsonify(message="CANNOT DELETE YOUR OWN USER"), 600
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        app.logger.error("No user found")
        app.logger.error(e)
        # return jsonify(message="No user found!"), 404

    return (
        jsonify(
            message="User has been deleted!",
        ),
        200,
    )


@api.route("/users", methods=["GET"])
@jwt_required
def fetch_all_users():
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin is False:
        return jsonify(message="Unauthorized access"), 401

    try:
        users = User.query.all()
        response = list(
            [
                {
                    "user_id": user.id,
                    "username": user.username,
                    "role": user.role.role.title(),
                    "created_on": user.created_at.strftime("%B %d, %Y"),
                }
                for user in users
            ]
        )
    except Exception as e:
        message = "Error fetching all users"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 500

    return jsonify(users=response), 200
