import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';

import Alert from '../../components/alert';
import { Button } from '../../components/button';
import Loader from '../../components/loader';

class EditLabelValueForm extends React.Component {
  constructor(props) {
    super(props);

    const { labelValueId } = this.props;
    const { labelId } = this.props;

    this.initialState = {
      labelId,
      valueForm: '',
      errorMessage: null,
      successMessage: null,
      isLoading: false,
      labelValueUrl: `/api/labels/${labelId}/values/${labelValueId}`
    };

    this.state = { ...this.initialState };
  }

  componentDidMount() {
    const { labelValueUrl } = this.state;
    this.setState({ isLoading: true });
    axios({
      method: 'get',
      url: labelValueUrl
    })
      .then(response => {
        if (response.status === 200) {
          const { value } = response.data;
          this.setState({
            valueForm: value,
            isLoading: false
          });
        }
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: null,
          isLoading: false
        });
      });
  }

  handleLabelValueChange(e) {
    this.setState({ valueForm: e.target.value });
  }

  handleLabelValueUpdation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { labelValueUrl, valueForm } = this.state;

    if (!valueForm || valueForm === '') {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Please enter a valid label value!',
        successMessage: ''
      });
      return;
    }

    axios({
      method: 'patch',
      url: labelValueUrl,
      data: {
        value: valueForm
      }
    })
      .then(response => {
        if (response.status === 200) {
          const { value } = response.data;
          this.setState({
            valueForm: value,
            isLoading: false,
            isSubmitting: false,
            successMessage: 'Label value has been updated',
            errorMessage: null
          });
        }
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: null,
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

  clearForm() {
    this.form.reset();
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { value, isSubmitting, errorMessage, successMessage, isLoading } = this.state;

    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="edit_label_value"
            ref={el => {
              this.form = el;
            }}
          >
            {isLoading ? <Loader /> : null}
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
            {!isLoading ? (
              <div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="label_value"
                    placeholder="Label value"
                    value={value}
                    autoFocus
                    required
                    onChange={e => this.handleLabelValueChange(e)}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <Button
                      size="lg"
                      type="primary"
                      disabled={!!isSubmitting}
                      onClick={e => this.handleLabelValueUpdation(e)}
                      isSubmitting={isSubmitting}
                      text="Update"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(EditLabelValueForm));
