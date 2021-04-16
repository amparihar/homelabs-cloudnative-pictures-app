import { Link } from "react-router-dom";


const SignOut = () => {
  return (
    <section className="section">
      <div className="container is-center" style={{width:"50%"}}>
        <div className="card" >
          <header className="card-header" style={{backgroundColor:"#48c78e"}}>
            <p className="card-header-title">Sign Out</p>
          </header>
          <div className="card-content">
            <h6 className="label">You have successfully Signed Out</h6>
          </div>
          <footer className="card-footer">
            <Link to="/signin" className="card-footer-item button is-link">
              BACK TO SIGN IN
            </Link>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default SignOut;
