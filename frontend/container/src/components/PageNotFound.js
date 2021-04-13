import { Link } from "react-router-dom";

const PageNotFound = () => {
  const {
    location: { href },
  } = window;
  return (
    <section className="section" style={{ maxWidth: "50%" }}>
      <div className="container">
        <article className="message is-link">
          <div className="message-header">
            <p>404 - Webpage not found</p>
          </div>
          <div className="message-body">
            The webpage at {href} might be temporarily down or it may have moved
            permanently to a new web address.
            <br />
            Please <Link to="/home">click here</Link> to go to the Home Page.
          </div>
        </article>
      </div>
    </section>
  );
};

export { PageNotFound };
