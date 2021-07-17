import React from 'react';
import Modal from 'react-bootstrap/Modal';
import UploadDataForm from './forms/uploadDataForm';
import CreateUserForm from './forms/createUserForm';
import EditUserForm from './forms/editUserForm';
import CreateProjectForm from './forms/createProjectForm';
import CreateLabelForm from './forms/createLabelForm';
import EditLabelForm from './forms/editLabelForm';
import ManageUsersProjectForm from './forms/manageUsersProjectForm';
import CreateLabelValueForm from './forms/createLabelValuelForm';
import EditLabelValueForm from './forms/editLabelValueForm';
import DeleteLabelValueForm from './forms/deleteLabelValueFrom';
import DeleteUserForm from './forms/deleteUser';
import DeleteLabelForm from './forms/deleteLabelFrom';
import EditProjectForm from './forms/editProjectForm';
import DownloadDataForm from './forms/downloadDataFrom';

const FormModal = props => {
  const {
    show,
    onExited,
    onHide,
    title,
    formType,
    userId,
    projectId,
    labelId,
    labelValueId,
    api_key,
    projectName
  } = props;
  return (
    <Modal
      show={show}
      onExited={onExited}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formType === 'NEW_USER' ? <CreateUserForm authNeeded="true" /> : null}
        {formType === 'NEW_PROJECT' ? <CreateProjectForm /> : null}
        {formType === 'EDIT_USER' ? <EditUserForm userId={userId} /> : null}
        {formType === 'Edit_PROJECT' ? <EditProjectForm projectId={projectId} /> : null}
        {formType === 'DELETE_USER' ? <DeleteUserForm userId={userId} onDelete={onExited} /> : null}
        {formType === 'MANAGE_PROJECT_USERS' ? (
          <ManageUsersProjectForm projectId={projectId} />
        ) : null}
        {formType === 'NEW_LABEL' ? <CreateLabelForm projectId={projectId} /> : null}
        {formType === 'EDIT_LABEL' ? (
          <EditLabelForm projectId={projectId} labelId={labelId} />
        ) : null}
        {formType === 'NEW_LABEL_VALUE' ? <CreateLabelValueForm labelId={labelId} /> : null}
        {formType === 'EDIT_LABEL_VALUE' ? (
          <EditLabelValueForm labelId={labelId} labelValueId={labelValueId} />
        ) : null}
        {formType === 'DELETE_LABEL_VALUE' ? (
          <DeleteLabelValueForm labelId={labelId} labelValueId={labelValueId} />
        ) : null}
        {formType === 'DELETE_LABEL' ? (
          <DeleteLabelForm labelId={labelId} projectId={projectId} />
        ) : null}
        {formType === 'UPLOAD_DATA' ? (
          <UploadDataForm projectId={projectId} projectName={projectName} apiKey={api_key} />
        ) : null}
        {formType === 'DOWNLOAD_DATA' ? (
          <DownloadDataForm projectId={projectId} projectName={projectName} apiKey={api_key} />
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default FormModal;
