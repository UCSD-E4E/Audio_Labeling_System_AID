import React from 'react';
import {
  faEdit,
  faUserPlus,
  faTags,
  faDownload,
  faTrash,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../components/button';

class AdminHandleFormProjects extends React.Component {
  constructor(props) {
    super(props);
    this.adminProps = props.adminProps;
    this.project = props.project;
    this.showModal = modalProps => {
      props.showModal(modalProps);
    };
  }

  handleAddLabelsToProject(e, projectId) {
    const { history } = this.adminProps;
    history.push(`/projects/${projectId}/labels`);
  }

  handleEditProject(e, projectId) {
    this.showModal({
      formType: 'Edit_PROJECT',
      title: 'Edit Project',
      projectId
    });
  }

  handleAddUsersToProject(e, projectId, projectName) {
    this.showModal({
      formType: 'MANAGE_PROJECT_USERS',
      title: `Project ${projectName}: Manage User Access`,
      projectId
    });
  }

  handleUploadDataToProject(e, projectName, projectId, api_key) {
    this.showModal({
      formType: 'UPLOAD_DATA',
      title: `Project ${projectName}: Upload Project Audio Files`,
      projectId,
      projectName,
      api_key
    });
  }

  handleDownloadDataToProject(e, projectName, projectId, api_key) {
    this.showModal({
      formType: 'DOWNLOAD_DATA',
      title: `Project ${projectName}: DOWNLOAD ANNOTATIONS`,
      projectId,
      projectName,
      api_key
    });
  }

  render() {
    return (
      <td className="align-middle">
        <IconButton
          icon={faUserPlus}
          size="sm"
          title="Manage users"
          onClick={e => this.handleAddUsersToProject(e, this.project.project_id, this.project.name)}
        />
        <IconButton
          icon={faTags}
          size="sm"
          title="Manage labels"
          onClick={e => this.handleAddLabelsToProject(e, this.project.project_id)}
        />
        <IconButton
          icon={faEdit}
          size="sm"
          title="Edit Annotations"
          onClick={e => this.handleEditProject(e, this.project.project_id)}
        />
        <div />
        <IconButton
          icon={faUpload}
          size="sm"
          title="Upload Data"
          onClick={e =>
            this.handleUploadDataToProject(
              e,
              this.project.name,
              this.project.project_id,
              this.project.api_key
            )
          }
        />
        <IconButton
          icon={faDownload}
          size="sm"
          title="Download Data"
          onClick={e =>
            this.handleDownloadDataToProject(
              e,
              this.project.name,
              this.project.project_id,
              this.project.api_key
            )
          }
        />
      </td>
    );
  }
}

class AdminHandleFormUsers extends React.Component {
  constructor(props) {
    super(props);
    this.user = props.user;
    this.showModal = modalProps => {
      props.showModal(modalProps);
    };
  }

  handleEditUser(e, userId) {
    this.showModal({ formType: 'EDIT_USER', title: 'Edit User', userId });
  }

  handleDeleteUser(e, userId) {
    // TODO: CREATE MODAL TO CONFRIM BUT FOR NOW MAKE DEV BUTTON
    this.showModal({ formType: 'DELETE_USER', title: 'Delete User', userId });
  }

  render() {
    return (
      <td className="align-middle">
        <IconButton
          icon={faEdit}
          size="sm"
          title="Edit user"
          onClick={e => this.handleEditUser(e, this.user.user_id)}
        />
        <IconButton
          icon={faTrash}
          size="sm"
          title="Delete User"
          onClick={e => this.handleDeleteUser(e, this.user.user_id)}
        />
      </td>
    );
  }
}

export { AdminHandleFormProjects, AdminHandleFormUsers };
