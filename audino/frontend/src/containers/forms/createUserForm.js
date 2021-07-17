import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';
import setAuthorizationToken from '../../utils';
import Alert from '../../components/alert';
import { Button } from '../../components/button';

class CreateUserForm extends React.Component {
  constructor(props) {
    super(props);
    let { authNeeded } = this.props;
    authNeeded = authNeeded === 'true';
    this.initialState = {
      authNeeded,
      usernameData: '',
      password: '',
      role: 'user',
      errorMessage: '',
      successMessage: '',
      isSubmitting: false
    };

    this.state = { ...this.initialState };
  }

  handleUsernameChange(e) {
    this.setState({ usernameData: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
    this.checkPassword();
  }

  handleRoleChange(e) {
    this.setState({ role: e.target.value });
  }

  handleUserCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });
    const { usernameData, password, role, authNeeded } = this.state;

    if (!usernameData || usernameData === '') {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Please enter a valid username!',
        successMessage: ''
      });
      return;
    }

    if (!password || password === '') {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Please enter a valid password!',
        successMessage: ''
      });
      return;
    }

    const checker = document.getElementById('confirm-password').value;
    if (!checker || checker === '' || password !== checker) {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Passwords must match!',
        successMessage: ''
      });
      return;
    }

    if (authNeeded && (!role || !['1', '2'].includes(role))) {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Please select a valid role!',
        successMessage: ''
      });
      return;
    }

    let apiurl = '';

    if (authNeeded) {
      apiurl = 'api/users';
    } else {
      apiurl = 'api/users/no_auth';
    }
    axios({
      method: 'post',
      url: apiurl,
      data: {
        username: usernameData,
        password,
        role,
        authNeeded
      }
    })
      .then(response => {
        if (response.status === 201) {
          if (!authNeeded) {
            apiurl = 'api/projects/example';
            axios({
              method: 'patch',
              url: apiurl,
              data: {
                users: usernameData
              }
            })
              .then(msg => {
                if (msg.status === 200) {
                  this.handleLoggingIn(e);
                }
              })
              .catch(error => {
                this.setState({
                  errorMessage: error.msg.data.message,
                  successMessage: '',
                  isSubmitting: false
                });
              });
          } else {
            this.resetState();
            this.form.reset();
            this.setState({ successMessage: response.data.message });
          }
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

  handleLoggingIn(e) {
    e.preventDefault();

    const { usernameData, password } = this.state;
    const { history, store } = this.props;

    axios({
      method: 'post',
      url: '/auth/login',
      data: {
        username: usernameData,
        password
      }
    })
      .then(response => {
        this.resetState();
        this.setState({
          successMessage: 'Logging you in...'
        });

        const { access_token, username, is_admin } = response.data;

        localStorage.setItem('access_token', access_token);

        setAuthorizationToken(access_token);

        store.set('usernameData', username);
        store.set('isAdmin', is_admin);
        store.set('isUserLoggedIn', true);

        history.push('/dashboard');
      })
      .catch(error => {
        this.setState({
          successMessage: '',
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

  checkPassword() {
    const checker = document.getElementById('confirm-password').value;
    const { password } = this.state;
    if (password !== '' && checker !== '' && checker !== password) {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Passwords do not match!',
        successMessage: ''
      });
    } else {
      this.setState({
        errorMessage: '',
        successMessage: ''
      });
    }
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { isSubmitting, errorMessage, successMessage, authNeeded } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
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
                id="username"
                placeholder="Username"
                autoFocus
                required
                onChange={e => this.handleUsernameChange(e)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                required={false}
                onChange={e => this.handlePasswordChange(e)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                id="confirm-password"
                placeholder="Confirm Password"
                required
                onChange={() => this.checkPassword()}
              />
            </div>
            {authNeeded && (
              <div className="form-group">
                <select
                  className="form-control"
                  name="role"
                  onChange={e => this.handleRoleChange(e)}
                >
                  <option value="-1">Choose role</option>
                  <option value="1">Admin</option>
                  <option value="2">User</option>
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="form-group col">
                <Button
                  size="lg"
                  type="primary"
                  disabled={!!isSubmitting}
                  onClick={e => this.handleUserCreation(e)}
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

export default withStore(withRouter(CreateUserForm));
