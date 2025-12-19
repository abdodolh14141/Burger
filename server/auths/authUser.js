import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authRegister = async (req, res) => {
  const { Name, Email: EmailUser, Age: AgeUser, Password } = req.body;

  try {
    // Check if the email is already registered
    const existingUserByEmail = await User.findOne({ Email: EmailUser });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please try logging in.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create a new user
    const newUser = new User({
      UserName: Name,
      Email: EmailUser,
      Age: AgeUser,
      Password: hashedPassword,
      Price: 5000, // Default price
    });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful. You can now log in.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again later.",
    });
  }
};

export const authLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials. Please provide both email and password.",
      });
    }

    // Check if the user exists
    const checkUser = await User.findOne({ Email: email });
    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please try again or register.",
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, checkUser.Password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: checkUser._id,
        email: checkUser.Email,
        name: checkUser.UserName,
        price: checkUser.Price,
      },
      process.env.JWT_SECRET || "default_secret", // Fallback secret for development
      {
        expiresIn: "3h",
      }
    );

    // Set the token in a cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
      maxAge: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

export const authUser = async (req, res) => {
  const { name: UserName } = req.dataAuto;
  const findUser = await User.findOne({ Name: UserName });
  return res.json({ success: true, message: "User Page", dataFind: findUser });
};

export const authEditUser = async (req, res) => {
  try {
    // Extract the new name and email from the request body
    const { name: newName, email: newEmail } = req.body;
    const { name: UserAuto } = req.dataAuto;
    // Check if the new name or email already exists in a different user
    const existingUser = await User.findOne(
      { Name: newName, Email: newEmail } // Ensure it's not the same user
    );

    const UserIsExisit = await User.findOne({
      Name: UserAuto,
    });

    if (!existingUser && !UserIsExisit) {
      return res.status(409).json({
        success: false,
        message: "This User Is Not Exisiting",
      });
    }

    // Update the user data if no existing user with the same name or email
    const updatedUser = await User.findOneAndUpdate(
      { Email: UserIsExisit.Email },
      {
        Name: newName,
        Email: newEmail,
      },
      { new: true }
    );

    if (updatedUser) {
      console.log("User updated successfully");
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } else {
      console.log("Failed to update user");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error updating user data", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
