import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../../styles/shopping.css";

const PLACEHOLDER = "https://via.placeholder.com/300x200?text=Burger";
const ITEMS_PER_PAGE = 12;

/* ------------ Sub-Components ------------ */

const Skeleton = ({ qty = 8 }) => (
  <div className="grid">
    {Array.from({ length: qty }).map((_, i) => (
      <div key={i} className="card skeleton-card">
        <div className="skeleton-img animate-pulse" />
        <div className="skeleton-content">
          <div className="skeleton-line short animate-pulse" />
          <div className="skeleton-line long animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const StarRating = ({ rating = 0 }) => {
  const value = Math.min(5, Math.max(0, rating));
  return (
    <div className="star-rating" title={`Rating: ${value}/5`}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star ${i < Math.floor(value) ? "full" : ""}`}>
          ★
        </span>
      ))}
      <span className="rating-text">{value.toFixed(1)}</span>
    </div>
  );
};

const ProductCard = ({ id, name, img, price, dsc, rate, category }) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price || 0);

  return (
    <Link to={`/product/${id}`} className="card product-card">
      <div className="card-image-wrapper">
        <img
          src={img || PLACEHOLDER}
          alt={name}
          className="card-image"
          onError={(e) => (e.target.src = PLACEHOLDER)}
        />
        {rate >= 4.5 && <span className="popular-badge">🔥 Top Rated</span>}
        <div className="category-badge">{category}</div>
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{name}</h3>
          <div className="price-tag">{formattedPrice}</div>
        </div>
        <StarRating rating={rate} />
        <p className="card-description">
          {dsc?.length > 70 ? `${dsc.substring(0, 70)}...` : dsc}
        </p>
        <div className="card-footer">
          <span className="view-link">View Details →</span>
        </div>
      </div>
    </Link>
  );
};

/* ------------ Main Component ------------ */

export const Shop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("/api/shopping", { signal });

      // Fixed logic: Check if data exists before accessing properties
      const rawItems = data?.products || (Array.isArray(data) ? data : []);

      const processedData = rawItems.map((item) => ({
        ...item,
        id: item.id || item._id, // Normalize ID field
        rate: parseFloat(item.rate) || 0,
        price: parseFloat(item.price) || 0,
        category: item.category || "Classic",
      }));

      setItems(processedData);
    } catch (e) {
      if (axios.isCancel(e)) return;
      setError(e.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);
    return () => controller.abort();
  }, [fetchItems]);

  // Handle Filtering & Sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortFns = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name),
      rating: (a, b) => b.rate - a.rate,
    };

    return result.sort(sortFns[sortBy] || sortFns.rating);
  }, [items, sortBy, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedItems, currentPage]);

  if (loading)
    return (
      <section className="shop">
        <Skeleton />
      </section>
    );

  return (
    <section className="shop">
      <header className="shop-header">
        <div className="header-text">
          <h1>Burger Menu 🍔</h1>
          <p>{filteredAndSortedItems.length} styles available</p>
        </div>

        <div className="shop-controls">
          <input
            type="search" // Better for mobile keyboards
            placeholder="Search burgers..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="sort-select"
          >
            <option value="rating">Top Rated</option>
            <option value="price-asc">Cheapest</option>
            <option value="price-desc">Premium</option>
            <option value="name">A-Z</option>
          </select>
        </div>
      </header>

      {currentItems.length > 0 ? (
        <>
          <div className="grid">
            {currentItems.map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pag-btn"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((p) => p - 1);
                  window.scrollTo(0, 0);
                }}
              >
                Prev
              </button>
              <div className="page-indicator">
                {currentPage} / {totalPages}
              </div>
              <button
                className="pag-btn"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  window.scrollTo(0, 0);
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>No burgers found</h3>
          <p>Try searching for a different ingredient!</p>
        </div>
      )}
    </section>
  );
};
