import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../../styles/about.css";

export const About = () => {
  // State for the report message
  const [reportMessage, setReportMessage] = useState("");

  // Function to handle the report submission
  const submitReport = async () => {
    if (!reportMessage) {
      toast.error("Please enter a report message.");
      return;
    }

    try {
      const response = await axios.post("/api/about/report", {
        report: reportMessage,
      });
      if (response.status === 200) {
        toast.success(response.data.message);
        setReportMessage(""); // Clear the textarea after successful submission
      }
    } catch (error) {
      toast.error("Failed to submit the report. Please try again.");
      console.error("Error submitting report:", error);
    }
  };

  return (
    <div className="container_about">
      <article>
        <section className="cardAbout">
          <div className="text-content">
            <h3>About Burger-Big</h3>
            <p>
              Tell Us What You Think! At Burger-Big, we're passionate about
              crafting the perfect burger experience for you. Your feedback
              helps us improve and serve you better. Whether it's a suggestion,
              compliment, or concern, we want to hear from you. Please share
              your thoughts below and help us make Burger-Big even better!
            </p>
          </div>
          <div className="report">
            <h1>Report</h1>
            <textarea
              cols="30"
              rows="10"
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              placeholder="Enter your report message..."
            ></textarea>
            <button type="button" onClick={submitReport}>
              Submit Report
            </button>
          </div>
        </section>
      </article>
    </div>
  );
};
