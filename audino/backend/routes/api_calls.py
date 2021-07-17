from flask import Blueprint
auth = Blueprint("auth", __name__, url_prefix="/auth")
api = Blueprint("api", __name__, url_prefix="/api")
