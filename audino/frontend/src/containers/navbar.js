import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';

import setAuthorizationToken from '../utils';

class NavBar extends React.Component {
  handleLogout() {
    const { history } = this.props;

    axios({
      method: 'delete',
      url: '/auth/logout'
    })
      .then(() => {
        localStorage.removeItem('access_token');
        this.props.store.set('isUserLoggedIn', false);
        this.props.store.set('isAdmin', false);
        this.props.store.set('isLoading', false);

        setAuthorizationToken(null);

        history.push('/');
      })
      .catch(error => {
        // TODO: Show error logging out
        console.log(error);
      });
  }

  render() {
    const isUserLoggedIn = this.props.store.get('isUserLoggedIn');

    return (
      <nav className="navbar navbar-expand-md bg-dark navbar-dark">
        <Link to="/" className="navbar-brand">
          Pyrenote
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#collapsibleNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {isUserLoggedIn && (
          <div className="collapse navbar-collapse" id="collapsibleNavbar">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin Panel
                </Link>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link"
                  onClick={e => this.handleLogout(e)}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    );
  }
}

export default withRouter(withStore(NavBar));
