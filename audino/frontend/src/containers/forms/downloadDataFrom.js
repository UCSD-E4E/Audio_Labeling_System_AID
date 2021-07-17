import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../../components/button';
import Alert from '../../components/alert';

import Loader from '../../components/loader';

class DownloadDataForm extends React.Component {
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

  componentDidMount() {}

  handleDownloadAnnotationsCSV(e, projectName, projectId) {
    axios({
      method: 'get',
      url: `/api/projects/${projectId}/annotations`,
      headers: {
        csv: 'true'
      }
    })
      .then(response => {
        const { annotations } = response.data;
        if (annotations) {
          const data = annotations; // JSON.stringify(annotations, null, 2)
          try {
            let csvContent = '';
            data.forEach((infoArray, index) => {
              // REMOVED FUNCTION HERE, ADD FUNCTION WORD SEAN
              const dataString = infoArray.join(',');
              csvContent += index < data.length ? `${dataString}\n` : dataString;
            });
            const download = (content, fileName, mimeType) => {
              const a = document.createElement('a');
              mimeType = mimeType || 'application/octet-stream';

              if (navigator.msSaveBlob) {
                // IE10
                navigator.msSaveBlob(
                  new Blob([content], {
                    type: mimeType
                  }),
                  fileName
                );
              } else if (URL && 'download' in a) {
                // html5 A[download]
                a.href = URL.createObjectURL(
                  new Blob([content], {
                    type: mimeType
                  })
                );
                a.setAttribute('download', fileName);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              } else {
                window.location.href = `data:application/octet-stream,${encodeURIComponent(
                  content
                )}`; // only this mime type is supported
              }
            };
            download(csvContent, `${projectName}.csv`, 'text/csv;encoding:utf-8');
          } catch (c) {
            console.error(c);
          }
        } else {
          console.warn('No annotations found');
        }
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message
        });
      });
  }

  handleDownloadAnnotationsJSON(e, projectName, projectId) {
    axios({
      method: 'get',
      url: `/api/projects/${projectId}/annotations`,
      headers: {
        csv: 'false'
      }
    })
      .then(response => {
        const { annotations } = response.data;
        if (annotations) {
          this._export_raw(`${projectName}.json`, JSON.stringify(annotations, null, 2));
        } else {
          console.warn('No annotations found');
        }
      })
      .catch(error => {
        console.error(error);
        this.setState({
          errorMessage: error.response.data.message
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

  _fake_click(obj) {
    const ev = document.createEvent('MouseEvents');
    ev.initMouseEvent(
      'click',
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
    const urlObject = window.URL || window.webkitURL || window;
    const export_blob = new Blob([data], { type: 'application/json' });
    if ('msSaveBlob' in navigator) {
      navigator.msSaveBlob(export_blob, name);
    } else if ('download' in HTMLAnchorElement.prototype) {
      const save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
      save_link.href = urlObject.createObjectURL(export_blob);
      save_link.download = name;
      this._fake_click(save_link);
    } else {
      throw new Error('Neither a[download] nor msSaveBlob is available');
    }
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { errorMessage, successMessage, isLoading, projectName, projectId } = this.state;
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
        <div className="row h-50 justify-content-center align-items-center">
          <div
            style={{
              float: 'left',
              width: '50%'
            }}
          >
            <text>DOWNLOAD JSON</text>
            <IconButton
              icon={faDownload}
              size="lg"
              title="Download Annotations - JSON"
              onClick={e => this.handleDownloadAnnotationsJSON(e, projectName, projectId)}
            />
          </div>
          <div
            style={{
              float: 'left',
              width: '50%'
            }}
          >
            <text>DOWNLOAD CSV </text>
            <IconButton
              icon={faDownload}
              size="lg"
              title="Download Annotations - CSV"
              onClick={e => this.handleDownloadAnnotationsCSV(e, projectName, projectId)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(DownloadDataForm));
