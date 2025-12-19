import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../../../styles/purchases.css";

export const Purchases = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/buy/purchases");
        setData(response.data.purchases);
        toast.success(response.data.message);
      } catch (error) {
        setError(true);
        toast.error("Error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const deletePurchases = async (id) => {
    try {
      const resDelete = await axios.delete(`/api/buy/purchases/${id}`);
      if (resDelete.data.success) {
        toast.success(resDelete.data.message);
        setData(data.filter((product) => product.Id !== id)); // Remove deleted product from UI
      } else {
        toast.error(resDelete.data.message);
      }
    } catch (error) {
      console.error("Error occurred while deleting the product:", error);
      toast.error("Error occurred while deleting the product.");
    }
  };

  const addPurchases = async (id) => {
    try {
      const resAdd = await axios.put(`/api/buy/purchases/${id}`);
      if (resAdd.data.success) {
        toast.success(resAdd.data.message);
        const updatedData = data.map((product) =>
          product.Id === id ? { ...product, Count: product.Count + 1 } : product
        );
        setData(updatedData);
      } else {
        toast.error(resAdd.data.message || "Error adding purchase");
      }
    } catch (error) {
      console.error("Error occurred while adding the purchase:", error);
      toast.error("Error occurred while adding the purchase.");
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!data || data.length === 0) {
    return (
      <h1 className="errorProduct">
        No Purchases Found. Please Buy Something.
      </h1>
    );
  }

  if (error) {
    return (
      <h1>
        <em>
          Error occurred while fetching data. Please try again or buy something.
        </em>
      </h1>
    );
  }

  return (
    <div className="container-purchases">
      <h1>مشتريات</h1>
      <div className="row">
        {data.map(({ Id, ImgSrc, Text, Price, Count }) => (
          <div key={Id} className="product-card purchases">
            <img src={ImgSrc} alt={Text} className="product-image" />
            <p>Count: {Count}</p>
            <span className="spanProduct">Price: {Price}</span>
            <button onClick={() => nav(`/product/${Id}`)}>عرض</button>

            <button onClick={() => deletePurchases(Id)}>حذف</button>
            <button onClick={() => addPurchases(Id)}>اضافة</button>
          </div>
        ))}
      </div>
    </div>
  );
};
