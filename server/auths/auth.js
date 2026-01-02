import User from "../models/User.js";
import axios from "axios";

// --- Configuration ---
const BURGER_API_URL =
  process.env.OPEN_FOOD_BURGER_API_URL || "https://default-burger-api.com"; // Fallback URL

// --- Helper Functions ---
/**
 * Fetch data from an external API with error handling.
 * @param {string} url - The API URL to fetch data from.
 * @returns {Promise<any>} - Returns the API response data or throws an error.
 */
const fetchFromApi = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("External API Error:", error.message);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `External API Error: ${error.response.status} - ${error.response.statusText}`
      );
    }
    throw new Error("Network Error: Unable to fetch from external API.");
  }
};

/**
 * Validates that the external data is an array.
 * @param {any} data - The data to validate.
 * @throws {Error} - Throws if data is not a valid array.
 */
const validateApiResponse = (data) => {
  if (!Array.isArray(data)) {
    throw new Error("Invalid data format received from external API.");
  }
};

// --- Controller Functions ---

/**
 * Fetch all product data for the shop page.
 * @route GET /api/products
 */
export const fetchAllProductData = async (req, res) => {
  try {
    const now = Date.now();

    // 2. Fetch from External API with a timeout
    // Note: We destructure { data } directly from the axios response
    const { data } = await axios.get(BURGER_API_URL, { timeout: 5000 });

    // 3. Validation
    // Ensure validateApiResponse handles the nested data structure
    validateApiResponse(data);

    // Handle different API shapes (some return an array, some return { products: [] })
    const products = Array.isArray(data) ? data : data.products;

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The menu is currently empty.",
      });
    }

    return res.status(200).json({
      success: true,
      source: "api",
      message: "Products fetched successfully.",
      count: products.length,
      products: products,
    });
  } catch (error) {
    // 5. Advanced Error Handling
    const isTimeout = error.code === "ECONNABORTED";
    console.error("[fetchAllProductData Error]:", error.message);

    return res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: isTimeout
        ? "External API took too long to respond."
        : "Failed to retrieve product data.",
    });
  }
};

/**
 * Fetch and return a subset of products for the first page.
 * @route GET /api/products/page/1
 */
export const authPageOne = async (req, res) => {
  try {
    const productData = await axios.get(BURGER_API_URL);
    validateApiResponse(productData);

    // Map to required UI shape and limit to 10 items
    const pageOne = productData.map((product) => ({
      id: product.id,
      name: product.name,
      img: product.img,
      dsc: product.dsc,
      price: product.price,
      rate: product.rate,
      country: product.country,
    }));

    return res.status(200).json({ success: true, products: pageOne });
  } catch (error) {
    console.error("[authPageOne Error]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve page one products.",
    });
  }
};

/**
 * Fetch a single product by its ID.
 * @route GET /api/products/:productId
 */
export const authProductId = async (req, res) => {
  const { id } = req.params;

  // 1) Basic validation
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required.",
    });
  }

  try {
    // 2) Fetch external catalogue with a short timeout
    const response = await axios.get(BURGER_API_URL, {
      timeout: 5000,
      // keep validateStatus default so we can handle non-2xx explicitly
    });

    // 3) Ensure the external response has the expected structure
    const catalogue = response?.data;

    // 4) Robust search supporting different id flavors
    const product = catalogue.find((p) => p?.id === id || p?._id === id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // 5) Sanitize / normalise the returned product to avoid leaking unwanted fields
    const normalized = {
      id: product.id ?? null,
      name: product.name ?? product.title ?? null,
      dsc: product.dsc ?? product.description ?? product.desc ?? null,
      price:
        product.price !== undefined
          ? Number(product.price)
          : product.cost !== undefined
          ? Number(product.cost)
          : null,
      img: product.img ?? product.image ?? product.thumbnail ?? null,
      rate:
        product.rate !== undefined
          ? Number(product.rate)
          : product.rating !== undefined
          ? Number(product.rating)
          : null,
      reviews:
        product.reviews !== undefined
          ? Number(product.reviews)
          : product.reviewCount !== undefined
          ? Number(product.reviewCount)
          : 0,
      raw: product, // keep original in case the client needs it (optional)
    };

    // 6) Happy path
    return res.status(200).json({
      success: true,
      product: normalized,
    });
  } catch (err) {
    // 7) Error handling: distinguish timeout, upstream errors, and unexpected internal errors
    const isTimeout = err?.code === "ECONNABORTED";
    if (isTimeout) {
      console.error(`[authProductId] Timeout fetching catalogue for ID=${id}`);
      return res.status(504).json({
        success: false,
        message: "External API timeout.",
      });
    }

    // Axios returned a non-2xx response
    if (err?.response) {
      console.error(
        `[authProductId] Upstream error for ID=${id} status=${err.response.status}`
      );
      return res.status(502).json({
        success: false,
        message: "Upstream service error.",
      });
    }

    // Fallback: internal server error
    console.error(
      `[authProductId] Internal error for ID=${id} - ${
        err?.stack ?? err?.message ?? err
      }`
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Fetch user profile data.
 * @route GET /api/user/profile
 */
export const authProfile = async (req, res) => {
  try {
    // Assumes req.dataAuto is populated via middleware
    const { name: UserName } = req.dataAuto;

    // Query user record
    const findUserSession = await User.findOne({ Name: UserName });
    if (!findUserSession) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      PriceUser: findUserSession.PriceUser || { Price: 0 },
    });
  } catch (error) {
    console.error("[authProfile Error]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Additional endpoint placeholders for future implementation.
 */
export const authBuy = async (req, res) => {
  // TODO: Implement buy functionality
};

export const authAbout = (req, res) => {
  // TODO: Implement about functionality
};

export const authAboutPost = (req, res) => {
  // TODO: Implement about post functionality
};
