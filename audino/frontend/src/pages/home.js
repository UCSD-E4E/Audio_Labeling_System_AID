import React from 'react';
import LoginForm from '../containers/forms/loginForm';
import { Button } from '../components/button';

const Home = () => {
  return (
    <div className="container h-75 text-center">
      <div className="row h-100 justify-content-center align-items-center">
        <LoginForm />
        <Button
          size="lg"
          type="primary"
          onClick={() => {
            window.location.href = `/newUser`;
          }}
          text="No Account? Sign up here!"
        />
      </div>
    </div>
  );
};

export default Home;
