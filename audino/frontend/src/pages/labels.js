import axios from 'axios';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { faPlusSquare, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import { IconButton } from '../components/button';
import Loader from '../components/loader';
import FormModal from '../containers/modal';

class Labels extends React.Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    const projectId = Number(match.params.id);

    this.state = {
      projectId,
      labels: [],
      formType: null,
      modalShow: false,
      isLabelsLoading: false,
      labelsUrl: `/projects/${projectId}/labels`,
      getLabelsUrl: `/api/projects/${projectId}`
    };
  }

  componentDidMount() {
    const { getLabelsUrl } = this.state;
    this.setState({ isLabelsLoading: true });

    axios({
      method: 'get',
      url: getLabelsUrl
    })
      .then(response => {
        this.setState({
          labels: response.data.labels,
          isLabelsLoading: false
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({
          isLabelsLoading: false
        });
      });
  }

  handleNewLabel() {
    this.setModalShow(true);
    this.setState({
      formType: 'NEW_LABEL',
      title: 'Create New Label Category'
    });
  }

  handleEditLabel(e, labelId) {
    this.setModalShow(true);
    this.setState({
      formType: 'EDIT_LABEL',
      title: 'Edit Label Category',
      labelId
    });
  }

  handleDeleteCategory(e, labelId) {
    this.setModalShow(true);
    this.setState({
      formType: 'DELETE_LABEL',
      title: "DELETE LABEL CATEGORY AND IT's LABEL VALUES",
      labelId
    });
  }

  setModalShow(modalShow) {
    this.setState({ modalShow });
  }

  refreshPage() {
    const { history } = this.props;
    const { labelsUrl } = this.state;
    history.replace({ pathname: '/empty' });
    setTimeout(() => {
      history.replace({ pathname: labelsUrl });
    });
  }

  render() {
    const { labels, projectId, labelId, formType, title, modalShow, isLabelsLoading } = this.state;
    return (
      <div>
        <Helmet>
          <title>Manage Labels</title>
        </Helmet>
        <div className="container h-100">
          <FormModal
            onExited={() => this.refreshPage()}
            formType={formType}
            title={title}
            show={modalShow}
            projectId={projectId}
            labelId={labelId}
            onHide={() => this.setModalShow(false)}
          />
          <div className="h-100 mt-5">
            <div className="row border-bottom my-3">
              <div className="col float-left">
                <h1>Labels</h1>
              </div>
              <hr />
              <div className="col float-right">
                <h1 className="text-right">
                  <IconButton
                    icon={faPlusSquare}
                    size="lg"
                    title="Create new label"
                    onClick={e => this.handleNewLabel(e)}
                  />
                </h1>
              </div>
              {!isLabelsLoading && labels.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Label Id</th>
                      <th scope="col">Name</th>
                      <th scope="col">Type</th>
                      <th scope="col">Created On</th>
                      <th scope="col">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labels.map((label, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row" className="align-middle">
                            {index + 1}
                          </th>
                          <td className="align-middle">{label.label_id}</td>
                          <td className="align-middle">{label.name}</td>
                          <td className="align-middle">{label.type}</td>
                          <td className="align-middle">{label.created_on}</td>
                          <td className="align-middle">
                            <IconButton
                              icon={faEdit}
                              size="sm"
                              title="Edit label"
                              onClick={e => this.handleEditLabel(e, label.label_id)}
                            />
                            <IconButton
                              icon={faTrash}
                              size="sm"
                              title="Delete label Category"
                              onClick={e => this.handleDeleteCategory(e, label.label_id)}
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
              {isLabelsLoading ? <Loader /> : null}
              {!isLabelsLoading && labels.length === 0 ? (
                <div className="font-weight-bold">No labels exists!</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Labels);
