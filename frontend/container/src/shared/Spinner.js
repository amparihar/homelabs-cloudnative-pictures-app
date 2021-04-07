import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const Spinner = () => {
  return <Loader type="Grid" color="blue" height={100} width={100} />;
};

export default Spinner;
