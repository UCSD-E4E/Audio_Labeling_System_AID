import axios from 'axios';

import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { createStore, withStore } from '@spyna/react-store';
import { createBrowserHistory } from 'history';
import { Helmet } from 'react-helmet';

import React, { Suspense } from 'react';
import {
  Admin,
  Annotate,
  Home,
  Dashboard,
  Error,
  Labels,
  LabelValues,
  Data,
  CreateUser
} from './pages';
import NavBar from './containers/navbar';

const history = createBrowserHistory();

const initialState = {
  username: '',
  isUserLoggedIn: null,
  isUserCreatingAccount: false,
  isAdmin: false,
  isLoading: false
};

const PrivateRoute = withStore(({ component: Component, ...rest }) => {
  const isUserLoggedIn = rest.store.get('isUserLoggedIn');
  const isAdmin = rest.store.get('isAdmin');
  return (
    <Route
      {...rest}
      render={props => {
        if (isUserLoggedIn === true) {
          if (rest.location.pathname === '/admin') {
            if (isAdmin) {
              return <Component {...props} />;
            }
            return <Redirect to="/dashboard" />;
          }
          return <Component {...props} />;
        }
        return <Redirect to="/" />;
      }}
    />
  );
});

const PublicRoute = withStore(({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return <Component {...props} />;
      }}
    />
  );
});

class App extends React.Component {
  componentDidMount() {
    const { store } = this.props;
    let isUserCreatingAccount = store.get('isUserCreatingAccount');
    if (window.location.href.includes('/newUser')) {
      isUserCreatingAccount = true;
    } else {
      isUserCreatingAccount = false;
      store.set('isUserCreatingAccount', false);
    }
    if (!isUserCreatingAccount) {
      const apiUrl = '/auth/is_logged_in';
      axios({
        method: 'post',
        url: apiUrl
      })
        .then(response => {
          const { is_logged_in } = response.data;
          store.set('isUserLoggedIn', is_logged_in);
          if (is_logged_in === true) {
            const { username, is_admin } = response.data;
            store.set('isAdmin', is_admin);
            store.set('username', username);
          }
          if (history.location.pathname === '/') {
            history.push('/dashboard');
          } else {
            history.push(history.location.pathname);
          }
        })
        .catch(error => {
          if (error.response.status === 401) {
            if (history.location.pathname === '/newUser') {
              store.set('isUserCreatingAccount', true);
              history.push('/newUser');
            } else {
              history.push('/');
              store.set('isUserLoggedIn', false);
              store.set('isUserCreatingAccount', false);
            }
          }
        });
    } else {
      store.set('isUserCreatingAccount', true);
      store.set('isUserLoggedIn', false);
      history.push('/newUser');
    }
  }

  render() {
    const { store } = this.props;
    const isUserLoggedIn = store.get('isUserLoggedIn');
    const isUserCreatingAccount = store.get('isUserCreatingAccount');

    if (isUserLoggedIn === null) {
      return null;
    }

    return (
      <Router>
        <div className="app">
          <Helmet titleTemplate="%s | Pyrenote" defaultTitle="Pyrenote" />
          <NavBar />
          <Suspense fallback={<div>Loading...</div>}>
            <Switch>
              <Route
                exact
                path="/"
                render={props => {
                  if (isUserLoggedIn === false) {
                    if (isUserCreatingAccount && window.location.href.includes('/newUser')) {
                      // window.location.href.includes("/newUser")
                      return <Redirect {...props} to="/newUser" />;
                    }
                    return <Home {...props} />;
                  }
                  return <Redirect {...props} to="/dashboard" />;
                }}
              />
              <PublicRoute exact path="/newUser" component={CreateUser} />
              <Route path="/empty" component={null} key="empty" />
              <PrivateRoute exact path="/admin" component={Admin} />
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path="/projects/:id/labels" component={Labels} />
              <PrivateRoute exact path="/projects/:id/data" component={Data} />
              <PrivateRoute
                exact
                path="/projects/:projectid/data/:dataid/annotate"
                component={Annotate}
              />
              <PrivateRoute exact path="/labels/:id/values" component={LabelValues} />
              <Route exact path="*">
                <Error message="Page not found!" />
              </Route>
            </Switch>
          </Suspense>
        </div>
      </Router>
    );
  }
}

const connectedApp = withStore(App);

export default createStore(connectedApp, initialState);
