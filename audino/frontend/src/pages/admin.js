import axios from 'axios';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  faPlusSquare,
  faEdit,
  faUserPlus,
  faTags,
  faDownload,
  faTrash,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../components/button';
import Loader from '../components/loader';
import FormModal from '../containers/modal';

const Admin = props => {
  const [modalState, setModalState] = React.useState({
    formType: null,
    modalShow: false,
    title: null,
    userId: null,
    projectId: null,
    projectName: null,
    api_key: null
  });

  const [userState, setUserState] = React.useState({
    users: [],
    isUserLoading: false
  });
  const [projectState, setProjectState] = React.useState({
    projects: [],
    isProjectLoading: false
  });

  const fetchProjects = () => {
    axios({
      method: 'get',
      url: '/api/projects'
    })
      .then(response => {
        setProjectState({
          ...projectState,
          projects: response.data.projects,
          isProjectLoading: false
        });
      })
      .catch(() => {
        setProjectState({
          ...projectState,
          isProjectLoading: false
        });
      });
  };

  const fetchUsers = () => {
    axios({
      method: 'get',
      url: '/api/users'
    })
      .then(response => {
        setUserState({
          ...userState,
          users: response.data.users,
          isUserLoading: false
        });
      })
      .catch(() => {
        setUserState({
          ...userState,
          isUserLoading: false
        });
      });
  };

  React.useEffect(() => {
    this.fetchProjects();
    this.fetchUsers();
  }, []);

  const showModal = newState => {
    setModalState({ ...modalState, ...newState, modalShow: true });
  };

  const handleNewProject = () => {
    showModal({ formType: 'NEW_PROJECT', title: 'Create New Project' });
  };

  const handleEditProject = (e, projectId) => {
    showModal({
      formType: 'Edit_PROJECT',
      title: 'Edit Project',
      projectId
    });
  };

  const handleNewUser = () => {
    showModal({ formType: 'NEW_USER', title: 'Create New User' });
  };

  const handleEditUser = (e, userId) => {
    showModal({ formType: 'EDIT_USER', title: 'Edit User', userId });
  };

  const handleDeleteUser = (e, userId) => {
    // TODO: CREATE MODAL TO CONFRIM BUT FOR NOW MAKE DEV BUTTON
    showModal({ formType: 'DELETE_USER', title: 'Delete User', userId });
  };

  const handleAddUsersToProject = (e, projectId, projectName) => {
    showModal({
      formType: 'MANAGE_PROJECT_USERS',
      title: `Project ${projectName}: Manage User Access`,
      projectId
    });
  };

  const handleUploadDataToProject = (e, projectName, projectId, api_key) => {
    showModal({
      formType: 'UPLOAD_DATA',
      title: `Project ${projectName}: Upload Project Audio Files`,
      projectId,
      projectName,
      api_key
    });
  };

  const handleDownloadDataToProject = (e, projectName, projectId, api_key) => {
    showModal({
      formType: 'DOWNLOAD_DATA',
      title: `Project ${projectName}: DOWNLOAD ANNOTATIONS`,
      projectId,
      projectName,
      api_key
    });
  };

  const handleAddLabelsToProject = (e, projectId) => {
    const { history } = props;
    history.push(`/projects/${projectId}/labels`);
  };

  const updatePage = () => {
    fetchProjects();
    fetchUsers();
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel</title>
      </Helmet>
      <div className="container h-100">
        <FormModal
          onExited={() => updatePage()}
          formType={modalState.formType}
          title={modalState.title}
          show={modalState.modalShow}
          userId={modalState.userId}
          projectId={modalState.projectId}
          projectName={modalState.projectName}
          api_key={modalState.api_key}
          onHide={() => setModalState({ ...modalState, modalShow: false })}
        />
        <div className="h-100 mt-5">
          <div className="row border-bottom my-3">
            <div className="col float-left">
              <h1>Projects</h1>
            </div>
            <hr />
            <div className="col float-right">
              <h1 className="text-right">
                <IconButton
                  icon={faPlusSquare}
                  size="lg"
                  title="Create new project"
                  onClick={e => handleNewProject(e)}
                />
              </h1>
            </div>
            {!projectState.isProjectLoading && projectState.projects.length > 0 ? (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Created By</th>
                    <th scope="col">API Key</th>
                    <th scope="col">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {projectState.projects.map((project, index) => (
                    <tr key={index}>
                      <th scope="row" className="align-middle">
                        {index + 1}
                      </th>
                      <td className="align-middle">{project.name}</td>
                      <td className="align-middle">{project.created_by}</td>
                      <td className="align-middle">{project.api_key}</td>
                      <td className="align-middle">
                        <IconButton
                          icon={faUserPlus}
                          size="sm"
                          title="Manage users"
                          onClick={e =>
                            handleAddUsersToProject(e, project.project_id, project.name)
                          }
                        />
                        <IconButton
                          icon={faTags}
                          size="sm"
                          title="Manage labels"
                          onClick={e => handleAddLabelsToProject(e, project.project_id)}
                        />
                        <IconButton
                          icon={faEdit}
                          size="sm"
                          title="Edit Annotations"
                          onClick={e => handleEditProject(e, project.project_id)}
                        />
                        <div />
                        <IconButton
                          icon={faUpload}
                          size="sm"
                          title="Upload Data"
                          onClick={e =>
                            handleUploadDataToProject(
                              e,
                              project.name,
                              project.project_id,
                              project.api_key
                            )
                          }
                        />
                        <IconButton
                          icon={faDownload}
                          size="sm"
                          title="Download Data"
                          onClick={e =>
                            handleDownloadDataToProject(
                              e,
                              project.name,
                              project.project_id,
                              project.api_key
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <div className="row my-4 justify-content-center align-items-center">
            {projectState.isProjectLoading ? <Loader /> : null}
            {!projectState.isProjectLoading && projectState.projects.length === 0 ? (
              <div className="font-weight-bold">No projects exists!</div>
            ) : null}
          </div>
          <div className="row mt-2">
            <div className="col float-left">
              <h1>Users</h1>
            </div>
            <div className="col float-right">
              <h1 className="text-right">
                <IconButton
                  icon={faPlusSquare}
                  size="lg"
                  title="Create new user"
                  onClick={e => handleNewUser(e)}
                />
              </h1>
            </div>
            {!userState.isUserLoading && userState.users.length > 0 ? (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Username</th>
                    <th scope="col">Role</th>
                    <th scope="col">Created On</th>
                    <th scope="col">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {userState.users.map((user, index) => (
                    <tr key={index}>
                      <th scope="row" className="align-middle">
                        {index + 1}
                      </th>
                      <td className="align-middle">{user.username}</td>
                      <td className="align-middle">{user.role}</td>
                      <td className="align-middle">{user.created_on}</td>
                      <td className="align-middle">
                        <IconButton
                          icon={faEdit}
                          size="sm"
                          title="Edit user"
                          onClick={e => handleEditUser(e, user.user_id)}
                        />
                        <IconButton
                          icon={faTrash}
                          size="sm"
                          title="Delete User"
                          onClick={e => handleDeleteUser(e, user.user_id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <div className="row my-4 justify-content-center align-items-center">
            {userState.isUserLoading ? <Loader /> : null}
            {!userState.isUserLoading && userState.users.length === 0 ? (
              <div className="font-weight-bold">No user exists!</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Admin);
