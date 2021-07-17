import axios from 'axios';
import React from 'react';
import { withRouter } from 'react-router-dom';
// import { Helmet } from 'react-helmet';
import { withStore } from '@spyna/react-store';
import { faPlusSquare, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import { IconButton } from '../components/button';
import Loader from '../components/loader';
import FormModal from '../containers/labelValueModal';

class LabelValues extends React.Component {
  constructor(props) {
    super(props);
    const { id } = this.props;
    const labelId = Number(id);
    this.state = {
      labelId,
      labelValues: [],
      formType: null,
      modalShow: false,
      isLabelValuesLoading: false,
      getLabelValuesUrl: `/api/labels/${labelId}/values`
    };
  }

  componentDidMount() {
    const { getLabelValuesUrl } = this.state;
    this.setState({ isLabelValuesLoading: true });

    axios({
      method: 'get',
      url: getLabelValuesUrl
    })
      .then(response => {
        this.setState({
          labelValues: response.data.values,
          isLabelValuesLoading: false
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({
          isLabelValuesLoading: false
        });
      });
  }

  handleNewLabelValues() {
    this.setModalShow(true);
    this.setState({
      formType: 'NEW_LABEL_VALUE',
      title: 'Create New Label Value'
    });
  }

  handleEditLabelValue(e, labelId, labelValueId) {
    this.setModalShow(true);
    this.setState({
      formType: 'EDIT_LABEL_VALUE',
      title: 'Edit Label Value',
      labelId,
      labelValueId
    });
  }

  handleDeleteLabel(e, labelId, labelValueId) {
    this.setModalShow(true);
    this.setState({
      formType: 'DELETE_LABEL_VALUE',
      title: 'DELETE Label Value',
      labelId,
      labelValueId
    });
  }

  setModalShow(modalShow) {
    this.setState({ modalShow });
  }

  refreshPage() {
    this.componentDidMount();
  }

  render() {
    const { labelValues, labelId, labelValueId, formType, title, modalShow, isLabelValuesLoading } =
      this.state;
    return (
      <div>
        <div className="container h-100">
          <FormModal
            onExited={() => this.refreshPage()}
            formType={formType}
            title={title}
            show={modalShow}
            labelId={labelId}
            labelValueId={labelValueId}
            onHide={() => this.setModalShow(false)}
          />
          <div className="h-100 mt-5">
            <div className="row border-bottom my-3">
              <hr />
              <div className="float-right">
                <h1 className="text-right">
                  <IconButton
                    icon={faPlusSquare}
                    size="lg"
                    title="Create new label"
                    onClick={e => this.handleNewLabelValues(e)}
                  />
                </h1>
              </div>
              {!isLabelValuesLoading && labelValues.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Label Value Id</th>
                      <th scope="col">Value</th>
                      <th scope="col">Created On</th>
                      <th scope="col">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labelValues.map((labelValue, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row" className="align-middle">
                            {index + 1}
                          </th>
                          <td className="align-middle">{labelValue.value_id}</td>
                          <td className="align-middle">{labelValue.value}</td>
                          <td className="align-middle">{labelValue.created_on}</td>
                          <td className="align-middle">
                            <IconButton
                              icon={faEdit}
                              size="sm"
                              title="Edit label value"
                              onClick={e =>
                                this.handleEditLabelValue(e, labelId, labelValue.value_id)
                              }
                            />
                            <IconButton
                              icon={faTrash}
                              size="sm"
                              title="Delete Label"
                              onClick={e => this.handleDeleteLabel(e, labelId, labelValue.value_id)}
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
              {isLabelValuesLoading ? <Loader /> : null}
              {!isLabelValuesLoading && labelValues.length === 0 ? (
                <div className="font-weight-bold">No label values exists!</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(LabelValues));
