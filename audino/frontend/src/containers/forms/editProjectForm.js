import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";

class EditProjectForm extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      name: "",
      errorMessage: "",
      successMessage: "",
      isSubmitting: false,
      url: `/api/projects/${this.props.projectId}`,
    };

    this.state = Object.assign({}, this.initialState);
  }

  componentDidMount() {
    const { url } = this.state;
    this.setState({ isLoading: true });
    axios({
      method: "get",
      url,
    })
      .then((response) => {
        if (response.status === 200) {
          const { name} = response.data;
          this.setState({ name});
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: null,
          isLoading: false,
        });
      });
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleProjectNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleProjectCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { name, url } = this.state;

    if (!name || name === "") {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please enter a valid project name!",
        successMessage: null,
      });
      return;
    }

    axios({
      method: "patch",
      url: url,
      data: {
        name,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.resetState();
          this.form.reset();
          this.setState({ successMessage: "Successfully changed name" });
        }
      })
      .catch((error) => {
        console.log(error.response);
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: "",
          isSubmitting: false,
        });
      });
  }

  render() {
    const { isSubmitting, errorMessage, successMessage } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="new_project"
            ref={(el) => (this.form = el)}
          >
            {errorMessage ? (
              <Alert type="danger" message={errorMessage} />
            ) : null}
            {successMessage ? (
              <Alert type="success" message={successMessage} />
            ) : null}
            <div className="form-group text-left">
              <input
                type="text"
                className="form-control"
                id="project_name"
                placeholder="Project Name"
                autoFocus={true}
                required={true}
                onChange={(e) => this.handleProjectNameChange(e)}
              />
            </div>
            <div className="form-row">
              <div className="form-group col">
                <Button
                  size="lg"
                  type="primary"
                  disabled={isSubmitting ? true : false}
                  onClick={(e) => this.handleProjectCreation(e)}
                  isSubmitting={isSubmitting}
                  text="Save"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(EditProjectForm));
