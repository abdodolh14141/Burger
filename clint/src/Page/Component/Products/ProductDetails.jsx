import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../../../styles/product_detail.css";

/**
 * Custom Hook: useFetchProduct
 * Pass the ID as an argument rather than calling useParams inside the hook.
 */
const useFetchProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(
    async (signal) => {
      if (!productId) {
        setError("No product identifier provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Ensure the URL matches your backend route
        const { data } = await axios.get(`/api/product/${productId}`, {
          signal,
        });

        if (data?.product) {
          setProduct(data.product);
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        if (err.name === "CanceledError") return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load product";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [productId] // Fixed: uses productId from arguments
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => controller.abort();
  }, [fetchProduct]);

  return { product, loading, error };
};

export const ProductDetails = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const { product, loading, error } = useFetchProduct(id);

  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => window.scrollTo(0, 0), []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const unitPrice = Number(product?.price ?? 0);
  const totalPriceLabel = useMemo(
    () => formatCurrency(unitPrice * quantity),
    [unitPrice, quantity]
  );

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(`${quantity}x ${product.name} added to your basket!`);
    } catch (err) {
      toast.error("Operation failed. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  if (loading)
    return (
      <div className="status-screen animate-pulse">
        <div className="spinner" />
        <p>Preparing fresh data...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="status-screen error-view">
        <h2 className="text-error">{error || "Something went wrong"}</h2>
        <div
          className="actions"
          style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
        >
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <Link to="/shop" className="btn-primary">
            Browse Menu
          </Link>
        </div>
      </div>
    );

  const { name, dsc, img, rate = 0, reviews = 0 } = product;

  return (
    <main className="details-wrapper container">
      <div className="breadcrumb-container">
        <article className="product-layout">
          <div className="image-stage">
            <img
              src={!imgError && img ? img : "/assets/placeholder-food.png"}
              alt={name}
              className={`hero-image ${imgError ? "placeholder" : ""}`}
              onError={() => setImgError(true)}
            />
            {rate >= 4.7 && <span className="tag-popular">High Rated</span>}
          </div>

          <section className="content-stage">
            <header className="product-header">
              <h1 className="product-name">{name}</h1>
              <div className="meta-row">
                <span className="price-tag">{formatCurrency(unitPrice)}</span>
                <div className="rating-pill" aria-label={`${rate} star rating`}>
                  <span className="star">★</span>
                  <strong>{rate.toFixed(1)}</strong>
                  <span className="count">({reviews} reviews)</span>
                </div>
              </div>
            </header>

            <div className="description-box">
              <h3>Ingredients & Details</h3>
              <p>{dsc || "Standard preparation with fresh ingredients."}</p>
            </div>

            <div className="purchase-card">
              <div className="quantity-selector">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => q - 1)}
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  disabled={quantity >= 20}
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? "Adding..." : `Add to Basket • ${totalPriceLabel}`}
              </button>
            </div>

            <footer className="product-footer">
              <div className="trust-badge">
                <span className="icon">🚚</span>
                <div>
                  <strong>Fast Delivery</strong>
                  <p>30-45 mins</p>
                </div>
              </div>
              <div className="trust-badge">
                <span className="icon">🌿</span>
                <div>
                  <strong>100% Fresh</strong>
                  <p>Sourced daily</p>
                </div>
              </div>
            </footer>
          </section>
        </article>
      </div>
    </main>
  );
};
