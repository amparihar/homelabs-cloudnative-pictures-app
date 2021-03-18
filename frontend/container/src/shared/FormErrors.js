import React from "react";

export const FormErrors = ({ errors }) => {
  return Object.keys(errors).length ? (
    <article className="message is-danger">
      <div className="message-body">
        <ul>
          {Object.keys(errors).map((fieldName, idx) => (
            <li key={idx}>{errors[fieldName]["message"]}</li>
          ))}
        </ul>
      </div>
    </article>
  ) : null;
};
