import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";
import Loader from "../../components/loader";
import LabelValues from "../../pages/labelValues"

class DeleteLabelForm extends React.Component {
  constructor(props) {
    super(props);
    const labelId = this.props.labelId;

    this.initialState = {
      labelId,
      errorMessage: null,
      successMessage: null,
      isLoading: false,
      labelValueUrl: `/api/labels/${labelId}/projectId/${props.projectId}`,
    };

    this.state = Object.assign({}, this.initialState);
  }

  componentDidMount() {
      console.log("DELETE LABEL FORM HAS RENDER TADA")
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleLabelValueChange(e) {
    this.setState({ value: e.target.value });
  }

  clearForm() {
    this.form.reset();
  }

  handleLabelValueUpdation(e) {
    e.preventDefault();
    
    this.setState({ isSubmitting: true });
    axios({
      method: "delete",
      url: this.state.labelValueUrl,
    })
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            isLoading: false,
            isSubmitting: false,
            successMessage: "Label value has been DELETED",
            errorMessage: null,
          });
          this.props.onDelete()
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: null,
          isSubmitting: false,
        });
      });
  }

  handleAlertDismiss(e) {
    e.preventDefault();
    this.setState({
      successMessage: "",
      errorMessage: "",
    });
  }

  render() {
    const {
      value,
      isSubmitting,
      errorMessage,
      successMessage,
      isLoading,
    } = this.state;

    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="edit_label_value"
            ref={(el) => (this.form = el)}
          >
            {isLoading ? <Loader /> : null}
            {errorMessage ? (
              <Alert
                type="danger"
                message={errorMessage}
                onClose={(e) => this.handleAlertDismiss(e)}
              />
            ) : null}
            {successMessage ? (
              <Alert
                type="success"
                message={successMessage}
                onClose={(e) => this.handleAlertDismiss(e)}
              />
            ) : null}
            {!isLoading ? (
              <div>
                <div className="form-group">
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <Button
                      size="lg"
                      type="danger"
                      disabled={isSubmitting ? true : false}
                      onClick={(e) => this.handleLabelValueUpdation(e)}
                      isSubmitting={isSubmitting}
                      text="DELETE LABEL CATEGORY"
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

export default withStore(withRouter(DeleteLabelForm));
