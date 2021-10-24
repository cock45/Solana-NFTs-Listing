import React from "react";
import { usePromiseTracker } from "react-promise-tracker";
import Loader from "react-loader-spinner";
import "./spinner.css";

const Spinner = (props:any): JSX.Element => {
  const { promiseInProgress } = usePromiseTracker();

  if(!promiseInProgress) return <div />
  return (
      <div className="spinner">
        <Loader type="ThreeDots" color="#2BAD60" height="100" width="100" />
      </div>
  );
};

export default Spinner;