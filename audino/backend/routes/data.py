import json
import sqlalchemy as sa
import uuid

from pathlib import Path

from flask import jsonify, flash, redirect, url_for, request
from flask import send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from backend import app, db
from backend.models import Data, Project, User, Segmentation, Label, LabelValue

import wave
from . import api

ALLOWED_EXTENSIONS = ["wav", "mp3", "ogg"]


@api.route("/audio/<path:file_name>", methods=["GET"])
@jwt_required
def send_audio_file(file_name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file_name)


def validate_segmentation(segment):
    """
    Validate the segmentation before accepting the annotation's upload
    from users
    """
    required_key = {"start_time", "end_time"}

    if set(required_key).issubset(segment.keys()):
        return True
    else:
        return False


def generate_segmentation(
    annotations,
    project_id,
    start_time,
    end_time,
    data_id,
    time_spent,
    segmentation_id=None,
):
    """Generate a Segmentation from the required segment information
    """
    app.logger.info(time_spent)
    if segmentation_id is None:
        segmentation = Segmentation(
            data_id=data_id,
            start_time=start_time,
            end_time=end_time,
            time_spent=time_spent,
        )
    else:
        # segmentation updated for existing data
        segmentation = Segmentation.query.filter_by(
            data_id=data_id, id=segmentation_id
        ).first()
        segmentation.set_start_time(start_time)
        segmentation.set_end_time(end_time)
        segmentation.set_time_spent(time_spent)

    db.session.add(segmentation)
    db.session.flush()

    values = []

    for label_name, val in annotations.items():
        label = Label.query.filter_by(name=label_name, project_id=project_id
                                      ).first()

        if label is None:
            description = f"Label not found with name: `{label_name}`"
            raise NotFound(description=description)

        if "values" not in val:
            raise BadRequest(
                description=f"Key: `values` missing in Label: `{label_name}`"
            )

        label_values = val["values"]

        if isinstance(label_values, list):
            for val_id in label_values:
                value = LabelValue.query.filter_by(
                    id=int(val_id), label_id=int(label.id)
                ).first()

                if value is None:
                    err = f"label value id `{val_id}` not in `{label_name}`"
                    raise BadRequest(
                        description=err
                    )
                values.append(value)

        else:
            if label_values == "-1":
                continue

            value = LabelValue.query.filter_by(
                id=int(label_values), label_id=int(label.id)
            ).first()
            err = "no label value with id `{label_values}` in `{label_name}`"
            if value is None:
                raise BadRequest(
                    description=err
                )
            values.append(value)

    segmentation.values = values
    return segmentation


@api.route("/data", methods=["POST"])
def add_data():
    api_key = request.headers.get("Authorization", None)

    if not api_key:
        description = "API Key missing from `Authorization` Header"
        raise BadRequest(description=description)

    project = Project.query.filter_by(api_key=api_key).first()

    if not project:
        raise NotFound(description="No project exist with given API Key")

    username = request.form.getlist("username", None)
    username_id = {}
    for name in username:
        user = User.query.filter_by(username=name).first()

        if not user:
            raise NotFound(description="No user found with given username")

        username_id[name] = user.id

    segmentations = request.form.get("segmentations", "[]")
    is_marked_for_review = bool(request.form.get("is_marked_for_review",
                                                 False))
    audio_file = request.files["audio_file"]
    original_filename = secure_filename(audio_file.filename)
    sampling_rate = request.form.get("sampling_rate", 0)
    clip_length = request.form.get("clip_length", 0.0)

    extension = Path(original_filename).suffix.lower()

    if len(extension) > 1 and extension[1:] not in ALLOWED_EXTENSIONS:
        raise BadRequest(description="File format is not supported")

    filename = f"{str(uuid.uuid4().hex)}{extension}"

    file_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)
    audio_file.save(file_path.as_posix())
    try:
        data = Data(
            project_id=project.id,
            filename=filename,
            original_filename=original_filename,
            is_marked_for_review=is_marked_for_review,
            assigned_user_id=username_id,
            sampling_rate=sampling_rate,
            clip_length=clip_length,
        )
    except Exception as e:
        raise BadRequest(description="username_id is bad ")
    print("HELLLO THERE ERROR MESSAGE")
    db.session.flush()

    segmentations = json.loads(segmentations)

    new_segmentations = []

    for segment in segmentations:
        validated = validate_segmentation(segment)

        if not validated:
            raise BadRequest(description=f"Segmentations have missing keys.")

        new_segment = generate_segmentation(
            data_id=data.id,
            project_id=project.id,
            end_time=segment["end_time"],
            start_time=segment["start_time"],
            annotations=segment.get("annotations", {}),
        )

        new_segmentations.append(new_segment)

    data.set_segmentations(new_segmentations)

    db.session.commit()
    db.session.refresh(data)

    return (
        jsonify(
            data_id=data.id,
            message=f"Data uploaded successfully",
            type="DATA_CREATED",
        ),
        201,
    )


@api.route("/data/admin_portal", methods=["POST"])
def add_data_from_site():
    app.logger.info(request.files)
    app.logger.info(request.form)
    api_key = request.form.get("apiKey", None)
    app.logger.info("also made it to asdfasdfasdfhere!")

    if not api_key:
        description = "API Key missing from `Authorization` Header"
        raise BadRequest(description=description)

    project = Project.query.filter_by(api_key=api_key).first()

    if not project:
        raise NotFound(description="No project exist with given API Key")

    app.logger.info("also made it to asdfasdfasdfhere!")
    username_txt = request.form.get("username", None)
    username = username_txt.split(",")
    username_id = {}
    for name in username:
        app.logger.info(name)
        user = User.query.first()
        app.logger.info(user)
        if not user:
            raise NotFound(description="No user found with given username")

        username_id[name] = user.id
    app.logger.info("also made it to asdfasdfasdfhere!")
    is_marked_for_review = True
    app.logger.info("made it to here!")
    file_length = request.form.get("file_length", None)
    audio_files = []
    for n in range(int(file_length)):
        audio_files.append(request.files.get(str(n)))

    app.logger.info(audio_files)
    app.logger.info(audio_files)
    app.logger.info("also made it to here!")
    for file in audio_files:
        app.logger.info(file)
        original_filename = secure_filename(file.filename)

        extension = Path(original_filename).suffix.lower()

        if len(extension) > 1 and extension[1:] not in ALLOWED_EXTENSIONS:
            raise BadRequest(description="File format is not supported")

        filename = f"{str(uuid.uuid4().hex)}{extension}"

        file_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)
        file.save(file_path.as_posix())
        wave_file = wave.open(str(file_path), 'rb')
        frame_rate = wave_file.getframerate()
        frames = wave_file.getnframes()
        rate = wave_file.getframerate()
        clip_duration = frames / float(rate)
        wave_file.close()
        try:
            data = Data(
                project_id=project.id,
                filename=filename,
                original_filename=original_filename,
                is_marked_for_review=is_marked_for_review,
                assigned_user_id=username_id,
                sampling_rate=frame_rate,
                clip_length=clip_duration,
            )
            app.logger.info(filename)
        except Exception as e:
            raise BadRequest(description="username_id is bad ")
        db.session.add(data)
        db.session.flush()
        db.session.commit()
        db.session.refresh(data)

    return (
        jsonify(
            message=f"Data uploaded successfully",
            type="DATA_CREATED",
        ),
        201,
    )
