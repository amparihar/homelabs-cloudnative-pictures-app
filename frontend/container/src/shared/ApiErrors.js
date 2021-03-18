import React from "react";

export const ApiErrors = ({ errors = [] }) => {
  return errors.length ? (
    <article className="message is-danger">
      <div className="message-body">
        <ul>
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      </div>
    </article>
  ) : null;
};
