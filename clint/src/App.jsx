import axios from "axios";
import { Routes, Route } from "react-router-dom";
import { Register } from "./Page/Users/Register";
import { Login } from "./Page/Users/Login";
import { Home } from "./Page/Component/Home";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./Page/Component/Layout/Navbar";
import { Footer } from "./Page/Component/Layout/Footer";
import { Shop } from "./Page/Component/Products/Shop";
import { ProductDetails } from "./Page/Component/Products/ProductDetails";
import { User } from "./Page/Users/User";
import { Purchases } from "./Page/Component/Products/Purchases";
import { About } from "./Page/Component/About";

// Set axios defaults outside the component
try {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
} catch (error) {
  console.error("Error setting axios defaults:", error);
}

function App() {
  return (
    <div className="App">
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/api/login" element={<Login />} />
        <Route path="/api/register" element={<Register />} />
        <Route path="/shopping" element={<Shop />} />
        <Route path="/api/user" element={<User />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/product" element={<Purchases />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
