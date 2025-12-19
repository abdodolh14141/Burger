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
            <h3>About Twinky</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
              ad minim veniam, quis nostrud exercitation.
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
