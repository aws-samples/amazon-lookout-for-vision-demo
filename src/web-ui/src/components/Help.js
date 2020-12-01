import React from "react";

const Help = () => (
  <div className="intro tab-content">
    <h2>Amazon Lookout for Vision</h2>
    Amazon Lookout for Vision gives you a fast and easy way to implement
    computer vision-based inspection to detect defects on industrial products,
    at scale. Provide as few as 30 baseline images and Amazon Lookout for Vision
    will automatically build a model for you within few hours. You can then
    integrate the model with your manufacturing lines to quickly and accurately
    identify anomalies like dents, cracks and scratches.
    <br />
    <br />
    Consult the{" "}
    <a
      href="https://docs.aws.amazon.com/lookout-for-vision/latest/developer-guide/what-is.html"
      target="_blank"
      rel="noopener noreferrer"
    >
      Getting Started Documentation
    </a>{" "}
    to learn how to create and train an Amazon Lookout for Vision model.
    <br />
    <br />
    To manage users, you can use the{" "}
    <a
      href="https://console.aws.amazon.com/cognito/users"
      target="_blank"
      rel="noopener noreferrer"
    >
      Cognito Users Pool console
    </a>
  </div>
);

export default Help;
