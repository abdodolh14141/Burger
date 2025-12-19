import User from "../models/User.js";
import ProductBuy from "../models/ProductBuy.js";
// Import the necessary function/constant from the auth controller
// We need the fetchProductData function to get the current product price/details,
// since the local 'products' array is no longer guaranteed to be populated
// or may only contain a single item.

// Show All Product User Is Buying (No change needed here as it queries the DB)
export const authPurchase = async (req, res) => {
  try {
    const { id } = req.dataAuto;
    // Find all products purchased by the user
    const allData = await ProductBuy.find({ IdUser: id });

    if (allData.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Success loading purchases",
        purchases: allData,
      });
    } else {
      return res
        .status(404)
        .json({ success: true, message: "No purchases found" });
    }
  } catch (error) {
    console.error("Purchase error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Purchase Add (No change needed here as it queries the DB)
export const authPurchaseAdd = async (req, res) => {
  try {
    const { id: idUser } = req.dataAuto;
    const { id: idProduct } = req.params;

    // Fetch user and product from the database (ProductBuy is the purchased item model)
    const checkUser = await User.findOne({ _id: idUser });
    const checkProduct = await ProductBuy.findOne({ Id: idProduct });

    // Check if user and product exist
    if (!checkUser || !checkProduct) {
      return res
        .status(404)
        .json({ success: false, message: "User or product not found" });
    }

    // Check if user has sufficient balance
    if (checkUser.Price >= checkProduct.Price) {
      // Increment purchase count
      const resPurchase = await ProductBuy.findOneAndUpdate(
        { Id: idProduct },
        { $inc: { Count: 1 } },
        { new: true }
      );

      if (!resPurchase) {
        return res
          .status(404)
          .json({ success: false, message: "Purchase not found" });
      }

      // Update user's balance
      checkUser.Price -= checkProduct.Price;
      await checkUser.save();

      return res.status(200).json({
        success: true,
        message: "Purchase count incremented successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }
  } catch (error) {
    console.error("Error in authPurchaseAdd:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Purchase Delete (Modified to rely on a single product or the database)
export const authPurchaseDelete = async (req, res) => {
  const { id: idUser } = req.dataAuto;
  const idDelete = req.params.idProduct;

  try {
    // Find the original product detail to get the current price for refund
    // Since the previous file only deals with ONE specific product,
    // we should re-fetch its details from the API to get the current price
    // OR rely on the stored price in the ProductBuy model.

    // OPTION 1: Get price from the database record (resDel) - SAFER.
    // OPTION 2: If resDel.Count is 1, fetch current price from API - LESS RELIABLE/SLOW.

    // We will rely on the ProductBuy model for the refund calculation,
    // but we need to ensure the product ID is valid/exists in the DB for the user.

    // Find and delete the product purchased by the user
    const resDel = await ProductBuy.findOneAndDelete({
      Id: idDelete,
      IdUser: idUser,
    });

    if (!resDel) {
      // Return 404 if product purchase record not found
      return res.status(404).json({
        success: false,
        message: "Product purchase record not found for this user.",
      });
    }

    // At this point, resDel contains the deleted purchase record (including Price and Count)

    // Find the user
    const resUploadPrice = await User.findOne({ _id: idUser });
    if (!resUploadPrice) {
      // Return 400 if user not found (Shouldn't happen if auth is correct)
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });
    }

    // Calculate the refund amount
    // If Count > 1, the original logic calculated the refund based on COUNT * PRICE.
    // If Count was 1, the original logic used the price from the 'products' array
    // (which is now unreliable).
    // Since we are deleting the whole record (regardless of Count),
    // the refund should be COUNT * PRICE from the DELETED record (resDel).

    const refundAmount = resDel.Count * resDel.Price;

    // Update user's balance (refund)
    resUploadPrice.Price += refundAmount;
    await resUploadPrice.save();

    // Return success message
    return res.status(200).json({
      success: true,
      message: "Success Delete Product and Refund Processed",
    });
  } catch (error) {
    console.log("Error in authPurchaseDelete:", error);
    // Return 500 for internal server error
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// No change needed here
export const authPurchasePost = async (req, res) => {
  return res
    .status(200)
    .json({ success: false, message: "Invalid request data" });
};
