import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* ------  HERO  ------ */}
      <section id="home" className="hero">
        <div className="hero__content">
          <h1>
            Welcome to <span>Burger-Big</span>
          </h1>
          <p>Your one-stop shop for delicious, juicy, handcrafted burgers.</p>
          <button className="btn" onClick={() => navigate("/shopping")}>
            See Menu
          </button>
        </div>
        <div className="hero__visual">
          <img
            src="https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2021/09/beef-burger.jpg"
            alt="hero burger"
            loading="lazy"
          />
        </div>
      </section>
      <section className="menu-preview">
        {/* ------  MENU PREVIEW  ------ */}
        <div className="model">
          <img
            src="https://assets.epicurious.com/photos/5c745a108918ee7ab68daf79/1:1/w_2503,h_2503,c_limit/Smashburger-recipe-120219.jpg"
            alt="Classic Smashed Cheeseburger"
            loading="lazy"
          />
          <div>
            <h2>Our Delicious Burgers</h2>
            <p>Click any burger to see details</p>
          </div>
        </div>
      </section>
    </>
  );
};
