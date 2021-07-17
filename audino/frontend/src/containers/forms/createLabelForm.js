import axios from 'axios';
import React from 'react';

import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';

import Alert from '../../components/alert';
import { Button } from '../../components/button';
import LabelValues from '../../pages/labelValues';

class CreateLabelForm extends React.Component {
  constructor(props) {
    super(props);

    const { projectId } = this.props;
    this.initialState = {
      projectId,
      name: null,
      type: null,
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
      previousLabelId: -1,
      createLabelUrl: `/api/projects/${projectId}/labels`
    };

    this.state = { ...this.initialState };
  }

  handleLabelNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleLabelTypeChange(e) {
    this.setState({ type: e.target.value });
  }

  handleLabelCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { name, type, createLabelUrl } = this.state;

    if (!name || name === '') {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Please enter a valid label name!',
        successMessage: ''
      });
      return;
    }

    if (!type || !['1', '2'].includes(type)) {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Please select a valid label type!',
        successMessage: ''
      });
      return;
    }

    axios({
      method: 'post',
      url: createLabelUrl,
      data: {
        name,
        type
      }
    })
      .then(response => {
        if (response.status === 201) {
          this.resetState();
          this.form.reset();
          this.setState({
            successMessage: response.data.message,
            previousLabelId: response.data.label_id
          });
        }
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: '',
          isSubmitting: false
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

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { isSubmitting, errorMessage, successMessage, projectId, previousLabelId } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          {previousLabelId === -1 ? (
            <form
              name="new_user"
              ref={el => {
                this.form = el;
              }}
            >
              {errorMessage ? (
                <Alert
                  type="danger"
                  message={errorMessage}
                  onClose={e => this.handleAlertDismiss(e)}
                />
              ) : null}
              {successMessage ? (
                <Alert
                  type="success"
                  message={successMessage}
                  onClose={e => this.handleAlertDismiss(e)}
                />
              ) : null}
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="label_name"
                  placeholder="Label Name"
                  autoFocus
                  required
                  onChange={e => this.handleLabelNameChange(e)}
                />
              </div>
              <div className="form-group">
                <select
                  className="form-control"
                  name="label_type"
                  onChange={e => this.handleLabelTypeChange(e)}
                >
                  <option value="-1">Choose Label Type</option>
                  <option value="1">Select</option>
                  <option value="2">Multi-Select</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <Button
                    size="lg"
                    type="primary"
                    disabled={!!isSubmitting}
                    onClick={e => this.handleLabelCreation(e)}
                    isSubmitting={isSubmitting}
                    text="Save"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div>
              <LabelValues projectId={projectId} id={previousLabelId} />
              <Button
                size="lg"
                type="primary"
                disabled={!!isSubmitting}
                onClick={() => this.setState({ previousLabelId: -1 })}
                isSubmitting={isSubmitting}
                text="Create a new Category"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(CreateLabelForm));
