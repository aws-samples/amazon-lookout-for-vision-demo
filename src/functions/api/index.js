const AWS = require("aws-sdk");

const { REGION } = process.env;

const lv = new AWS.LookoutVision({ region: REGION });

const respond = (statusCode, response) => ({
  statusCode,
  body: JSON.stringify(response),
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

exports.detectHandler = async (event) => {
  const body = JSON.parse(event.body);
  const { contentType, image, projectName, modelVersion } = body;
  const imageBytes = Buffer.from(image, "base64");

  try {
    const anomalies = await lv
      .detectAnomalies({
        ProjectName: projectName,
        ModelVersion: modelVersion,
        Body: imageBytes,
        ContentType: contentType,
      })
      .promise();

    return respond(200, anomalies);
  } catch (e) {
    console.log(e);
    return respond(e.statusCode || 500, { error: e });
  }
};

exports.listModelsHandler = async (event) => {
  const { projectName } = event.pathParameters;
  try {
    const models = await lv.listModels({ ProjectName: projectName }).promise();
    return respond(200, models);
  } catch (e) {
    console.log(e);
    return respond(e.statusCode || 500, { error: e });
  }
};

exports.listProjectsHandler = async () => {
  try {
    const projects = await lv.listProjects().promise();
    return respond(200, projects);
  } catch (e) {
    console.log(e);
    return respond(e.statusCode || 500, { error: e });
  }
};

exports.startModelHandler = async (event) => {
  const { projectName, modelVersion } = event.pathParameters;
  const body = JSON.parse(event.body);
  const { minInferenceUnits } = body;
  try {
    const response = await lv
      .startModel({
        ProjectName: projectName,
        ModelVersion: modelVersion,
        MinInferenceUnits: minInferenceUnits,
      })
      .promise();
    return respond(200, response);
  } catch (e) {
    console.log(e);
    return respond(e.statusCode || 500, { error: e });
  }
};

exports.stopModelHandler = async (event) => {
  const { projectName, modelVersion } = event.pathParameters;
  try {
    const response = await lv
      .stopModel({
        ProjectName: projectName,
        ModelVersion: modelVersion,
      })
      .promise();
    return respond(200, response);
  } catch (e) {
    console.log(e);
    return respond(e.statusCode || 500, { error: e });
  }
};
