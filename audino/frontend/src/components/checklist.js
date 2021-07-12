import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const noop = () => {};

const FeatureChecklist = ({ item = "", isChecked = false, handleCheck = noop }) => {
  console.log("IT LAODED")
  return (
    <div>
      <input type="checkbox" onChange={handleCheck} style={{flex: "1 0 25%"}} id={item} name={item} value={item} checked={isChecked}/>
      <label for={item}>&ensp;  {item}</label><br/>
    </div>
  );
};

FeatureChecklist.propTypes = {
  item: PropTypes.object.isRequired,
  isChecked: PropTypes.bool,
};

export default FeatureChecklist;
