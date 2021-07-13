import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import { setAuthorizationToken } from "../utils";

class NavBar extends React.Component {
  handleLogout(e) {
    const { history } = this.props;

    axios({
      method: "delete",
      url: "/auth/logout",
    })
      .then(() => {
        localStorage.removeItem("access_token");
        this.props.store.set("isUserLoggedIn", false);
        this.props.store.set("isAdmin", false);
        this.props.store.set("isLoading", false);

        setAuthorizationToken(null);

        history.push("/");
      })
      .catch((error) => {
        // TODO: Show error logging out
        console.log(error);
      });
  }

  render() {
    const isUserLoggedIn = this.props.store.get("isUserLoggedIn");
    const isAdmin = this.props.store.get("isAdmin");

    return (
      <nav class="navbar navbar-expand-md bg-dark navbar-dark">
        <Link to="/" className="navbar-brand">
          Pyrenote
        </Link>

        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#collapsibleNavbar"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        {isUserLoggedIn && (
          <div class="collapse navbar-collapse" id="collapsibleNavbar">
            <ul class="navbar-nav">
              <li class="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li class="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin Panel
                </Link>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link"
                  onClick={(e) => this.handleLogout(e)}
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
