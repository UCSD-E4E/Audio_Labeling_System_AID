import React from "react";
import Modal from "react-bootstrap/Modal";
import UploadDataForm from "./forms/uploadDataForm";
import CreateUserForm from "./forms/createUserForm";
import EditUserForm from "./forms/editUserForm";
import CreateProjectForm from "./forms/createProjectForm";
import CreateLabelForm from "./forms/createLabelForm";
import EditLabelForm from "./forms/editLabelForm";
import ManageUsersProjectForm from "./forms/manageUsersProjectForm";
import CreateLabelValueForm from "./forms/createLabelValuelForm";
import EditLabelValueForm from "./forms/editLabelValueForm";
import DeleteLabelValueForm from "./forms/deleteLabelValueFrom";
import DeleteUserForm from "./forms/deleteUser";
import DeleteLabelForm from "./forms/deleteLabelFrom"
import EditProjectForm from "./forms/editProjectForm"
import DownloadDataForm from "./forms/downloadDataFrom";

const FormModal = (props) => {
  console.log("INSIDE FORMMODAL", props.formType)
  return (
    <Modal
      show={props.show}
      onExited={props.onExited}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.formType === "NEW_USER" ? <CreateUserForm authNeeded="true"/> : null}
        {props.formType === "NEW_PROJECT" ? <CreateProjectForm /> : null}
        {props.formType === "EDIT_USER" ? (
          <EditUserForm userId={props.userId} />
        ) : null}
        {props.formType === "Edit_PROJECT" ? (
          <EditProjectForm projectId={props.projectId} />
        ) : null}
        {props.formType === "DELETE_USER" ? (
          <DeleteUserForm userId={props.userId} onDelete={props.onExited}/>
        ) : null}
        {props.formType === "MANAGE_PROJECT_USERS" ? (
          <ManageUsersProjectForm projectId={props.projectId} />
        ) : null}
        {props.formType === "NEW_LABEL" ? (
          <CreateLabelForm projectId={props.projectId} />
        ) : null}
        {props.formType === "EDIT_LABEL" ? (
          <EditLabelForm projectId={props.projectId} labelId={props.labelId} />
        ) : null}
        {props.formType === "NEW_LABEL_VALUE" ? (
          <CreateLabelValueForm labelId={props.labelId} />
        ) : null}
        {props.formType === "EDIT_LABEL_VALUE" ? (
          <EditLabelValueForm
            labelId={props.labelId}
            labelValueId={props.labelValueId}
          />
        ) : null}
        {props.formType === "DELETE_LABEL_VALUE" ? (
          <DeleteLabelValueForm
            labelId={props.labelId}
            labelValueId={props.labelValueId}
            onDelete={props.onExited}
          />
        ) : null}
        {props.formType === "DELETE_LABEL" ? (      
          <DeleteLabelForm
            labelId={props.labelId}
            projectId={props.projectId}
            onDelete={props.onExited}
            />
        ) : null}
        {props.formType === "UPLOAD_DATA" ? (
          <UploadDataForm
            projectId={props.projectId}
            projectName={props.projectName}
            apiKey={props.api_key}
          />
        ) : null}
        {props.formType === "DOWNLOAD_DATA" ? (
          <DownloadDataForm
            projectId={props.projectId}
            projectName={props.projectName}
            apiKey={props.api_key}
          />
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default FormModal;
