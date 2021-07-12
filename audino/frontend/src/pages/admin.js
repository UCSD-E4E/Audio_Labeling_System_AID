import axios from "axios";
import React from "react";
import { withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";

import {
  faPlusSquare,
  faEdit,
  faUserPlus,
  faTags,
  faDownload,
  faTrash,
  faUpload,
  faList
} from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../components/button";
import Loader from "../components/loader";
import FormModal from "../containers/modal";

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      projects: [],
      formType: null,
      modalShow: false,
      isUserLoading: false,
      isProjectLoading: false,
    };
  }

  componentDidMount() {
    this.setState({ isUserLoading: true, isProjectLoading: true });

    // TODO: Combine these two api calls
    axios({
      method: "get",
      url: "/api/projects",
    })
      .then((response) => {
        this.setState({
          projects: response.data.projects,
          isProjectLoading: false,
        });
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          isProjectLoading: false,
        });
      });

    axios({
      method: "get",
      url: "/api/users",
    })
      .then((response) => {
        this.setState({ users: response.data.users, isUserLoading: false });
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          isUserLoading: false,
        });
      });
  }

  refreshPage() {
    const { history } = this.props;
    history.replace({ pathname: "/empty" });
    setTimeout(() => {
      history.replace({ pathname: "/admin" });
    });
  }

  handleNewProject() {
    this.setModalShow(true);
    this.setState({ formType: "NEW_PROJECT", title: "Create New Project" });
  }

  handleEditProject(e, projectId) {
    this.setModalShow(true);
    this.setState({ formType: "Edit_PROJECT", title: "Edit Project", projectId});
  }

  handleDeleteProject() {
    this.setModalShow(true);
    this.setState({ formType: "DELETE_PROJECT", title: "Delete Project" });
  }

  handleNewUser() {
    this.setModalShow(true);
    this.setState({ formType: "NEW_USER", title: "Create New User" });
  }

  handleEditUser(e, userId) {
    this.setModalShow(true);
    this.setState({ formType: "EDIT_USER", title: "Edit User", userId });
  }

  handleDeleteUser(e, userId) {
    //TODO: CREATE MODAL TO CONFRIM BUT FOR NOW MAKE DEV BUTTON
    console.log("DELETE USER", userId)
    this.setModalShow(true);
    this.setState({ formType: "DELETE_USER", title: "Delete User", userId });
  }

  handleAddLabelsToProject(e, projectId) {
    const { history } = this.props;
    history.push(`/projects/${projectId}/labels`);
  }

  handleAddUsersToProject(e, projectId, projectName) {
    this.setModalShow(true);
    this.setState({
      formType: "MANAGE_PROJECT_USERS",
      title: `Project ${projectName}: Manage User Access`,
      projectId,
    });
  }

  handleUploadDataToProject(e, projectName, projectId, api_key) {
    console.log(api_key, "hi")
    this.setModalShow(true);
    this.setState({
      formType: "UPLOAD_DATA",
      title: `Project ${projectName}: Upload Project Audio Files`,
      projectId,
      projectName,
      api_key,
    });
  }
  handleFeatureToggle(e, projectName, projectId, api_key) {
    console.log(api_key, "hi")
    this.setModalShow(true);
    this.setState({
      formType: "FEATURE_FORM",
      title: `Toggle Features on or off for ${projectName}`,
      projectId,
      projectName,
      api_key,
    });
  }

  handleDownloadDataToProject(e, projectName, projectId, api_key) {
    console.log(api_key, "hi")
    this.setModalShow(true);
    this.setState({
      formType: "DOWNLOAD_DATA",
      title: `Project ${projectName}: DOWNLOAD ANNOTATIONS`,
      projectId,
      projectName,
      api_key,
    });
  }

  _fake_click(obj) {
    let ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    obj.dispatchEvent(ev);
  }

  _export_raw(name, data) {
    let urlObject = window.URL || window.webkitURL || window;
    let export_blob = new Blob(data);

    if ("msSaveBlob" in navigator) {
      navigator.msSaveBlob(export_blob, name);
    } else if ("download" in HTMLAnchorElement.prototype) {
      let save_link = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "a"
      );
      save_link.href = urlObject.createObjectURL(export_blob);
      save_link.download = name;
      this._fake_click(save_link);
    } else {
      throw new Error("Neither a[download] nor msSaveBlob is available");
    }
  }

  setModalShow(modalShow) {
    this.setState({ modalShow });
  }

  render() {
    const {
      users,
      projects,
      title,
      isProjectLoading,
      isUserLoading,
      modalShow,
      formType,
      userId,
      projectId,
      api_key,
      projectName,
    } = this.state;

    return (
      <div>
        <Helmet>
          <title>Admin Panel</title>
        </Helmet>
        <div className="container h-100">
          <FormModal
            onExited={() => this.refreshPage()}
            formType={formType}
            title={title}
            show={modalShow}
            userId={userId}
            projectId={projectId}
            projectName={projectName}
            api_key={api_key}
            onHide={() => this.setModalShow(false)}
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
                    onClick={(e) => this.handleNewProject(e)}
                  />
                </h1>
              </div>
              {!isProjectLoading && projects.length > 0 ? (
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
                    {projects.map((project, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row" className="align-middle">
                            {index + 1}
                          </th>
                          <td className="align-middle">{project["name"]}</td>
                          <td className="align-middle">
                            {project["created_by"]}
                          </td>
                          <td className="align-middle">{project["api_key"]}</td>
                          <td className="align-middle">
                            <IconButton
                              icon={faUserPlus}
                              size="sm"
                              title={"Manage users"}
                              onClick={(e) =>
                                this.handleAddUsersToProject(
                                  e,
                                  project["project_id"],
                                  project["name"]
                                )
                              }
                            />
                            <IconButton
                              icon={faTags}
                              size="sm"
                              title={"Manage labels"}
                              onClick={(e) =>
                                this.handleAddLabelsToProject(
                                  e,
                                  project["project_id"]
                                )
                              }
                            />
                            <IconButton
                              icon={faEdit}
                              size="sm"
                              title={"Edit Annotations"}
                              onClick={(e) =>
                                this.handleEditProject(e, project["project_id"])
                              }
                            />
                            {/*<IconButton
                              icon={faTrash}
                              size="sm"
                              title={"Delete Annotations"}
                              onClick={(e) =>
                                this.handleDeleteProject(e)
                              }
                            />*/}
                            <div></div>
                            <IconButton
                              icon={faUpload}
                              size="sm"
                              title={"Upload Data"}
                              onClick={(e) =>
                                this.handleUploadDataToProject(
                                  e,
                                  project["name"],
                                  project["project_id"],
                                  project["api_key"]
                                )
                              }
                            />
                            <IconButton
                              icon={faDownload}
                              size="sm"
                              title={"Download Data"}
                              onClick={(e) =>
                                this.handleDownloadDataToProject(
                                  e,
                                  project["name"],
                                  project["project_id"],
                                  project["api_key"]
                                )
                              }
                            />
                            <IconButton
                              icon={faList}
                              size="sm"
                              title={"Turn on or Off Annotation Features"}
                              onClick={(e) =>
                                this.handleFeatureToggle(
                                  e,
                                  project["name"],
                                  project["project_id"],
                                  project["api_key"]
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </div>
            <div className="row my-4 justify-content-center align-items-center">
              {isProjectLoading ? <Loader /> : null}
              {!isProjectLoading && projects.length === 0 ? (
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
                    title={"Create new user"}
                    onClick={(e) => this.handleNewUser(e)}
                  />
                </h1>
              </div>
              {!isUserLoading && users.length > 0 ? (
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
                    {users.map((user, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row" className="align-middle">
                            {index + 1}
                          </th>
                          <td className="align-middle">{user["username"]}</td>
                          <td className="align-middle">{user["role"]}</td>
                          <td className="align-middle">{user["created_on"]}</td>
                          <td className="align-middle">
                            <IconButton
                              icon={faEdit}
                              size="sm"
                              title={"Edit user"}
                              onClick={(e) =>
                                this.handleEditUser(e, user["user_id"])
                              }
                            />
                            <IconButton
                              icon={faTrash}
                              size="sm"
                              title={"Delete User"}
                              onClick={(e) =>
                                this.handleDeleteUser(e, user["user_id"])
                              }
                            />
                            {/* <IconButton
                              icon={faTrashAlt}
                              size="sm"
                              onClick={(e) =>
                                this.handleDeleteUser(e, user["user_id"])
                              }
                            /> */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </div>
            <div className="row my-4 justify-content-center align-items-center">
              {isUserLoading ? <Loader /> : null}
              {!isUserLoading && users.length === 0 ? (
                <div className="font-weight-bold">No user exists!</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Admin);
