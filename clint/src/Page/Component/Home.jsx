import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="home-container">
      {/* ------ HERO SECTION ------ */}
      <section id="home" className="hero-section">
        <div className="container hero-grid">
          <div className="hero__content">
            <span className="hero__subtitle">Finest handcrafted burgers</span>
            <h1 className="hero__title">
              Satisfy Your Cravings with <span>Burger-Big</span>
            </h1>
            <p className="hero__text">
              Experience the perfect blend of juicy beef, fresh ingredients, and
              our secret signature sauce. Hand-delivered to your door.
            </p>
            <div className="hero__actions">
              <button
                className="btn btn--primary"
                onClick={() => navigate("/shopping")}
              >
                Order Now
              </button>
              <button
                className="btn btn--outline"
                onClick={() => navigate("/about")}
              >
                Our Story
              </button>
            </div>
          </div>
          <div className="hero__visual">
            <div className="image-blob">
              <img
                src="https://staticcookist.akamaized.net/wp-content/uploads/sites/22/2021/09/beef-burger.jpg"
                alt="Delicious signature beef burger"
                loading="eager"
              />
            </div>
            <div className="floating-badge">
              <span>Best in Town</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------ MENU PREVIEW SECTION ------ */}
      <section className="menu-preview">
        <div className="container">
          <div className="section-header">
            <h2>The Signature Collection</h2>
            <p>Chef-inspired recipes crafted for the ultimate burger lover.</p>
          </div>

          <div className="preview-card" onClick={() => navigate("/shopping")}>
            <div className="preview-card__image">
              <img
                src="https://assets.epicurious.com/photos/5c745a108918ee7ab68daf79/1:1/w_2503,h_2503,c_limit/Smashburger-recipe-120219.jpg"
                alt="Classic Smashed Cheeseburger"
                loading="lazy"
              />
            </div>
            <div className="preview-card__content">
              <h3>Classic Smashed Cheeseburger</h3>
              <p>Double patty, double cheese, and caramelized onions.</p>
              <span className="btn-text">View Full Menu &rarr;</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
