import React from "react";
import { ListGroup } from "react-bootstrap";

import Icon from "./Icon";
import SectionAccordion from "./SectionAccordion";

const percentageToString = (percentage) => Math.round(percentage * 1000) / 10;

const ResultSummary = ({ apiResponse, image, modelVersion, projectName }) => {
  const isAnomalous =
    !apiResponse || apiResponse.DetectAnomalyResult.IsAnomalous;

  return (
    <div>
      {apiResponse && (
        <>
          <SectionAccordion labelName="Result">
            <ListGroup>
              <ListGroup.Item>
                <span>Anomalous:</span>{" "}
                <Icon type={isAnomalous ? "fail" : "success"} />{" "}
                <span style={{ color: !isAnomalous ? "#1d8102" : "#d13212" }}>
                  {isAnomalous.toString()}
                </span>
                <span className="confidence">
                  {percentageToString(
                    apiResponse.DetectAnomalyResult.Confidence
                  )}
                  %
                </span>
              </ListGroup.Item>
            </ListGroup>
          </SectionAccordion>
          <SectionAccordion labelName="Request" open={false}>
            <div className="prettify-json">
              {JSON.stringify(
                {
                  ProjectName: projectName,
                  ModelVersion: modelVersion,
                  ContentType: "image",
                  Body: image,
                },
                undefined,
                2
              )}
            </div>
          </SectionAccordion>
          <SectionAccordion labelName="Response" open={false}>
            <div className="prettify-json">
              {JSON.stringify(apiResponse, undefined, 2)}
            </div>
          </SectionAccordion>
        </>
      )}
    </div>
  );
};

export default ResultSummary;
