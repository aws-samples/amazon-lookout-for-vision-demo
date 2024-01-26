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
  const [imageMask, setImageMask] = useState(undefined);
  const [contentType, setContentType] = useState(undefined);
  const [modelVersion, setModelVersion] = useState(model);
  const [projectName, setProjectName] = useState(name);
  const [projects, setProjects] = useState(undefined);
  const [retriableError, setRetriable] = useState(true);
  const [showValidationHint, setShowValidationHint] = useState(false);

  const imageContainer = useRef(undefined);

  const resetSummary = () => {
    setApiResponse(undefined);
    setErrorDetails("");
    setImageMask(undefined); 
  };

  const validateImage = (type, size) => {
    const validType = [
      "data:image/jpeg;base64",
      "data:image/png;base64",
    ].includes(type);

    const validSize = size < 8000000;
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
      const mimeType = type.split(":")[1].split(";")[0];

      if (validationResult.isValid) {
        setImage(content);
        setContentType(mimeType);
        setFormState("ready");
      } else {
        setImage(undefined);
        setContentType(undefined);
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
        .detectAnomalies(projectName, modelVersion, contentType, image)
        .then(async (response) => {
          setApiResponse(response);
          if (response.DetectAnomalyResult.AnomalyMask.data) {
            var binary = '';
            var bytes = new Uint8Array(response.DetectAnomalyResult.AnomalyMask.data);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
              binary += String.fromCharCode( bytes[ i ] );
            }
            var base64Data = window.btoa(binary);

            loadAnomalyMask(`data:image/png;base64, ${base64Data}`);
          }
          setFormState("processed");
        })
        .catch((e) => {
          setFormState("error");
          setErrorDetails(formatErrorMessage(e));
          setRetriable(isErrorRetryable(e));
          setShowValidationHint(isImageValidationError(e));
        });
    }
  }, [contentType, formState, gateway, image, imageMask, projectName, modelVersion]);

  const loadAnomalyMask = async (data) => {
    
    // create fake image to handle onload event
    var img = document.createElement("img");
    img.src = data;
    img.style.visibility = "hidden";
    document.body.appendChild(img);

    img.onload = function() {
      var canvas = document.createElement("canvas");
      canvas.width = img.offsetWidth;
      canvas.height = img.offsetHeight;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(img,0,0);

      // remove fake image
      img.parentNode.removeChild(img);

      // replace the white background with transparent
      if (canvas.width > 0 && canvas.height > 0) {
        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;

        var r,g,b;
        for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            if((r == 255) &&
              (g == 255) &&
              (b == 255)) {

                data[x] = 0;
                data[x+1] = 0;
                data[x+2] = 0;
                data[x+3] = 0;

            } 
        }

        ctx.putImageData(imageData,0,0);
        setImageMask(canvas.toDataURL());
      }
    }    
  }

  const overlayMask = (img) => {    
    var imageElement = document.getElementById(img.id);
    if (imageElement) {
      var topMargin = (img.height + 40) * -1; // add 40 to compensate for the padding
      imageElement.style.marginTop = topMargin + "px";
    }
  }

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
              {imageMask && (
                <img
                  id="imageMask"
                  alt="image mask"
                  ref={(x) => (imageContainer.current = x)}
                  src={imageMask}
                  onLoad={(e) => {
                    overlayMask(e.target);
                  }}
                  style={{ width: "100%", margin: "10px"}}
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