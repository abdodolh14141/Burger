import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

import "../../../styles/product_detail.css";

/**
 * Custom Hook: fetch product with cancellation + better error messages
 */
const useFetchProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setError("No product id provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(`/api/product/${id}`);

      if (data?.product) {
        setProduct(data.product);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      // prefer API message, fallback to axios / JS message
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load product";
      setError(message);
      // toast here is optional; the UI also renders the error
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);

    return () => controller.abort();
  }, [fetchProduct]);

  return { product, loading, error };
};

/**
 * Product Details Page
 */
export const ProductDetails = () => {
  const navigate = useNavigate();
  const { product, loading, error } = useFetchProduct();

  // local UI state
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const safePrice = useMemo(() => {
    const priceNum = Number(product?.price ?? 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number.isFinite(priceNum) ? priceNum : 0);
  }, [product?.price]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      // Replace with real cart API / context call
      await new Promise((r) => setTimeout(r, 400));
      toast.success(`${product.name || "Product"} added to cart (${quantity})`);
    } catch (err) {
      toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const inc = () => setQuantity((q) => Math.min(99, q + 1));
  const dec = () => setQuantity((q) => Math.max(1, q - 1));

  if (loading)
    return (
      <div className="status-screen" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Fetching the best ingredients...</p>
      </div>
    );

  if (error || !product)
    return (
      <div className="status-screen" role="alert" aria-live="assertive">
        <h2>{error || "Product Not Found"}</h2>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <Link to="/shop" className="btn-secondary">
            Back to Menu
          </Link>
        </div>
      </div>
    );

  const { name = "Unnamed Product", dsc, img, rate = 0, reviews = 0 } = product;

  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='18'%3ENo image available%3C/text%3E%3C/svg%3E";

  return (
    <main className="details-wrapper">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link> / <span>{name}</span>
      </nav>

      <article className="product-layout">
        <div className="image-stage">
          <img
            src={!imgError && img ? img : fallbackImg}
            alt={name}
            className="hero-image"
            width={400}
            onError={() => setImgError(true)}
          />
          {rate >= 4.5 && <div className="tag-popular">Best Seller</div>}
        </div>

        <section className="content-stage">
          <header>
            <h1 className="product-name">{name}</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <p className="price-display">{safePrice}</p>
              <div className="rating" aria-label={`Rating: ${rate} out of 5`}>
                <strong>{rate?.toFixed?.(1) ?? "0.0"}</strong>
                <span className="reviews">({reviews})</span>
              </div>
            </div>
          </header>

          <div className="description-box">
            <h3>Description</h3>
            <p>{dsc || "No description provided for this item."}</p>
          </div>

          <div className="purchase-zone" aria-live="polite">
            <div className="quantity-control" style={{ marginBottom: 12 }}>
              <button
                aria-label="Decrease quantity"
                onClick={dec}
                className="btn-quiet"
              >
                −
              </button>
              <span className="quantity" aria-live="polite">
                {quantity}
              </span>
              <button
                aria-label="Increase quantity"
                onClick={inc}
                className="btn-quiet"
              >
                +
              </button>
            </div>

            <button
              className="btn-primary-large"
              onClick={handleAddToCart}
              disabled={adding}
              aria-busy={adding}
            >
              {adding ? "Adding..." : `Add to Basket — ${safePrice}`}
            </button>
          </div>

          <ul className="trust-points">
            <li>✓ Made to Order</li>
            <li>✓ Fresh Ingredients</li>
            <li>✓ 45 Min Delivery</li>
          </ul>
        </section>
      </article>
    </main>
  );
};
