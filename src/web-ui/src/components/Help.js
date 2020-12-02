import React from "react";

const Help = () => (
  <div className="intro tab-content">
    <h2>Amazon Lookout for Vision</h2>
    Amazon Lookout for Vision is a machine learning (ML) service that spots
    defects and anomalies in visual representations using computer vision (CV).
    With Amazon Lookout for Vision, manufacturing companies can increase quality
    and reduce operational costs by quickly identifying differences in images of
    objects at scale. For example, Amazon Lookout for Vision can be used to
    identify missing components in products, damage to vehicles or structures,
    irregularities in production lines, miniscule defects in silicon wafers, and
    other similar problems. Amazon Lookout for Vision uses ML to see and
    understand images from any camera as a person would, but with an even higher
    degree of accuracy and at a much larger scale. Amazon Lookout for Vision
    allows customers to eliminate the need for costly and inconsistent manual
    inspection, while improving quality control, defect and damage assessment,
    and compliance. In minutes, you can begin using Amazon Lookout for Vision to
    automate inspection of images and objects–with no machine learning expertise
    required.
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
