import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <section className="section" style={{maxWidth:"50%"}}>
      <div className="container">
        <article className="message is-link">
          <div className="message-header">
            <p>404</p>
          </div>
          <div className="message-body">
            Oops! That page couldn't be found.
            <br/>
            Please <Link to="/home">click here</Link> to go to the Home Page.
          </div>
        </article>
      </div>
    </section>
  );
};

export { PageNotFound };
