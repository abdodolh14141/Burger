import { Link } from "react-router-dom";
import "../../../styles/footer.css";

export const Footer = () => {
  return (
    <footer className="LastContainer">
      <div className="LinksSocial">
        <ul className="wrapper">
          <li className="icon facebook">
            <Link to="https://www.github.com/abdodolh14141" target="_blank">
              <i className="fab fa-github"></i>
            </Link>
          </li>
          <li className="icon youtube">
            <Link to="#" target="_blank">
              <i className="fab fa-youtube"></i>
            </Link>
          </li>
          <li className="icon tiktok">
            <Link to="https://www.tiktok.com/@dolh73" target="_blank">
              <i className="fab fa-tiktok"></i>
            </Link>
          </li>
        </ul>
      </div>

      <div className="par">
        <p>
          This Website Is Original Dola• <Link to="/about">About Us</Link>
        </p>
      </div>
    </footer>
  );
};
