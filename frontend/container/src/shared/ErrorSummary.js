import React from "react";

export const ErrorSummary = ({ formErr, apiErr, errors, ...props }) => {
  if (formErr) {
    return formErr(errors);
  } else if (apiErr) {
    return apiErr(errors);
  } else return <div />;
};
