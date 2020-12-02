import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Col,
  Container,
  Form,
  FormGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  formatErrorMessage,
  isErrorRetryable,
  isImageValidationError,
  mapResults,
} from "../utils";

import FileUpload from "./FileUpload";
import ResultSummary from "./ResultSummary";
import ProjectSelect from "./ProjectSelect";

const validModelState = "HOSTED";

const ImageMode = ({ gateway, model, name }) => {
  const [apiResponse, setApiResponse] = useState(undefined);
  const [errorDetails, setErrorDetails] = useState("");
  const [formState, setFormState] = useState("initial");
  const [image, setImage] = useState(undefined);
  const [modelVersion, setModelVersion] = useState(model);
  const [projectName, setProjectName] = useState(name);
  const [projects, setProjects] = useState(undefined);
  const [retriableError, setRetriable] = useState(true);
  const [showValidationHint, setShowValidationHint] = useState(false);

  const imageContainer = useRef(undefined);

  const resetSummary = () => setApiResponse(undefined) && setErrorDetails("");

  const validateImage = (type, size) => {
    const validType = [
      "data:image/jpeg;base64",
      "data:image/png;base64",
    ].includes(type);

    const validSize = size < 4000000;
    const result = { isValid: validType && validSize };
    const errors = [];
    if (!validType) errors.push("the image format is not valid");
    if (!validSize) errors.push("the image size is not valid");
    if (errors.length > 0) result.error = errors.join(" and ");

    return result;
  };

  const processImage = (file) => {
    resetSummary();
    const reader = new FileReader();

    reader.onload = () => {
      const [type, content] = reader.result.split(",");
      const validationResult = validateImage(type, file.size);

      if (validationResult.isValid) {
        setImage(content);
        setFormState("ready");
      } else {
        setImage(undefined);
        setFormState("error");
        setErrorDetails(validationResult.error);
      }
    };
    reader.onerror = () => setFormState("error");

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      setFormState("error");
    }
  };

  const fetchResult = (value) => {
    const [name, model] = value.split("/");
    setProjectName(name);
    setModelVersion(model);
    if (image) setFormState("ready");
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const projects = await gateway.listProjects();
        const result = mapResults(projects, validModelState);

        if (result.length === 0) {
          setErrorDetails(
            `There are no model with State=${validModelState} in the current account. This is mandatory in order to use this demo`
          );
          setFormState("error");
        }
        setProjects(result);
      } catch (e) {
        setErrorDetails(formatErrorMessage(e));
      }
    };

    loadData();
  }, [gateway]);

  useEffect(() => {
    if (formState === "ready") {
      gateway
        .detectAnomalies(projectName, modelVersion, image)
        .then((response) => {
          setApiResponse(response);
          setFormState("processed");
        })
        .catch((e) => {
          setFormState("error");
          setErrorDetails(formatErrorMessage(e));
          setRetriable(isErrorRetryable(e));
          setShowValidationHint(isImageValidationError(e));
        });
    }
  }, [formState, gateway, image, projectName, modelVersion]);

  return (
    <Row className="tab-content">
      <Col md={12} sm={6} className="h100">
        <Container>
          <Alert
            variant="danger"
            style={{
              display: formState === "error" ? "block" : "none",
            }}
          >
            {errorDetails}{" "}
            {retriableError && <a href={window.location.href}>Retry</a>}
            {showValidationHint && (
              <>
                <br />
                Hint: verify the image size used for testing is the same as the
                images used during the training
              </>
            )}
          </Alert>
          <Row>
            <Col
              md={12}
              sm={6}
              style={{
                textAlign: "left",
                marginLeft: "20px",
                paddingBottom: "40px",
              }}
            ></Col>
            <Col md={8} sm={6}>
              {image && (
                <img
                  alt="The uploaded content"
                  ref={(x) => (imageContainer.current = x)}
                  src={`data:image/png;base64, ${image}`}
                  style={{ width: "100%", margin: "10px" }}
                />
              )}
            </Col>
            <Col md={4} sm={6}>
              {projects && Object.keys(projects).length > 0 && (
                <Form>
                  <ProjectSelect
                    onChange={fetchResult}
                    onMount={(e) => {
                      const [name, model] = e.split("/");
                      setProjectName(name);
                      setModelVersion(model);
                    }}
                    projects={projects}
                    preSelected={`${projectName}/${modelVersion}`}
                  />
                  <FormGroup>
                    <FileUpload
                      id="asd"
                      onChange={(e) => processImage(e.target.files[0])}
                    />
                  </FormGroup>
                </Form>
              )}
              {formState === "ready" && (
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              )}
              {formState !== "ready" && (
                <ResultSummary
                  apiResponse={apiResponse}
                  image={image}
                  modelVersion={modelVersion}
                  projectName={projectName}
                />
              )}
            </Col>
          </Row>
        </Container>
      </Col>
    </Row>
  );
};

export default ImageMode;
