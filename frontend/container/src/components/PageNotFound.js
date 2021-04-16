import { Link } from "react-router-dom";

const PageNotFound = () => {
  const {
    location: { href },
  } = window;
  return (
    <section className="section">
      <div className="container is-center" style={{ width: "50%" }}>
        <div className="card">
          <header
            className="card-header"
            style={{ backgroundColor: "#48c78e" }}
          >
            <p className="card-header-title">404 - Webpage not found</p>
          </header>
          <div className="card-content">
            <h6 className="label">
              The webpage at {href} might be temporarily down or it may have
              moved permanently to a new web address.
            </h6>
          </div>
          <footer className="card-footer">
            <Link to="/home" className="card-footer-item button is-link">
              BACK TO HOME PAGE
            </Link>
          </footer>
        </div>
      </div>
    </section>
  );
};

export { PageNotFound };
