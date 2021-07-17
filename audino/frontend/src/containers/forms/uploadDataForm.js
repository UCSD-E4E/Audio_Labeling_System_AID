import React from 'react';
import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';

import Alert from '../../components/alert';
import { Button } from '../../components/button';
import Loader from '../../components/loader';

class UploadDataForm extends React.Component {
  constructor(props) {
    super(props);
    let { projectId } = this.props;
    const { apiKey, projectName } = this.props;
    projectId = Number(projectId);

    this.initialState = {
      apiKey,
      projectId,
      projectName,
      errorMessage: '',
      successMessage: '',
      isLoading: false,
      isSubmitting: false,
      projectUrl: `/api/projects/${projectId}`,
      getUsersUrl: '/api/users',
      uploadUrl: 'api/data/admin_portal',
      updateUsersProject: `/api/projects/${projectId}/users`,
      files: {}
    };

    this.state = { ...this.initialState };
  }

  handleUpload() {
    const { uploadUrl, apiKey, files } = this.state;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      formData.append(i, file);
    }
    formData.append('apiKey', apiKey);
    formData.append('username', ['admin', 'admin']);
    formData.append('file_length', files.length);
    this.setState({ isLoading: true });
    fetch(uploadUrl, {
      method: 'POST',
      body: formData
    }).then(response => {
      const msg = response.json();
      msg.then(data => {
        if (data.code !== 201 && data.type !== 'DATA_CREATED') {
          this.setState({
            isSubmitting: false,
            errorMessage: data.message,
            successMessage: null,
            isLoading: false
          });
        } else {
          this.setState({
            isSubmitting: false,
            successMessage: data.message,
            errorMessage: null,
            isLoading: false,
            files: {}
          });
        }
      });
    });
  }

  handleAlertDismiss(e) {
    e.preventDefault();
    this.setState({
      successMessage: '',
      errorMessage: ''
    });
  }

  onChangeHandler(e) {
    this.setState({ files: e.target.files });
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { isSubmitting, errorMessage, successMessage, isLoading } = this.state;
    return (
      <div className="container h-75 text-center">
        <div>
          {isLoading ? <Loader /> : null}
          {errorMessage ? (
            <Alert type="danger" message={errorMessage} onClose={e => this.handleAlertDismiss(e)} />
          ) : null}
          {successMessage ? (
            <Alert
              type="success"
              message={successMessage}
              onClose={e => this.handleAlertDismiss(e)}
            />
          ) : null}
        </div>
        <div className="row h-100 justify-content-center align-items-center">
          <input
            type="file"
            name="file"
            onChange={e => {
              this.onChangeHandler(e);
            }}
            multiple
          />
          <div className="form-row">
            <div className="form-group col">
              <Button
                size="lg"
                type="primary"
                disabled={isSubmitting}
                onClick={e => this.handleUpload(e)}
                isSubmitting={isSubmitting}
                alt="Uploading"
                text="Upload"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(UploadDataForm));
