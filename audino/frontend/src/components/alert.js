/* eslint "jsx-a11y/no-noninteractive-element-interactions": "off" */
import React from 'react';
import PropTypes from 'prop-types';
import BootstrapAlert from 'react-bootstrap/Alert';

const Alert = ({ type, message, overlay, onClose }) => {
  return (
    <div className={overlay ? 'overlay center-top' : ''}>
      <BootstrapAlert
        variant={type}
        style={{ cursor: 'pointer' }}
        onClick={onClose}
        role="alert"
        dismissible={onClose != null}
      >
        {message}
      </BootstrapAlert>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  overlay: PropTypes.bool,
  onClick: PropTypes.func
};

Alert.defaultProps = {
  overlay: false,
  onClick: () => {}
};

export default Alert;
