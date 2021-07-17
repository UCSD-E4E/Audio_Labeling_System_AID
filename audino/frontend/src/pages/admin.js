import axios from 'axios';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../components/button';
import Loader from '../components/loader';
import FormModal from '../containers/modal';
import { AdminHandleFormProjects, AdminHandleFormUsers } from './adminHandleForm';

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
    fetchProjects();
    fetchUsers();
  }, []);

  const showModal = newState => {
    setModalState({ ...modalState, ...newState, modalShow: true });
  };

  const handleNewUser = () => {
    showModal({ formType: 'NEW_USER', title: 'Create New User' });
  };

  const handleNewProject = () => {
    showModal({ formType: 'NEW_PROJECT', title: 'Create New Project' });
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
                      <AdminHandleFormProjects
                        showModal={showModal}
                        adminProps={props}
                        project={project}
                      />
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
                      <AdminHandleFormUsers showModal={showModal} user={user} />
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
