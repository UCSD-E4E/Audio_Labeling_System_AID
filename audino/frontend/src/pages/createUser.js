import React from 'react';
import { Button } from '../components/button';
import CreateUserForm from '../containers/forms/createUserForm';

class CreateUser extends React.Component {
  goBack() {
    const index = window.location.href.indexOf('/newUser');
    const path = window.location.href.substring(0, index);
    window.location.href = path;
  }

  render() {
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <CreateUserForm authNeeded="false" />
          <Button size="lg" type="primary" onClick={e => this.goBack(e)} text="Go back to Login" />
        </div>
      </div>
    );
  }
}

export default CreateUser;
