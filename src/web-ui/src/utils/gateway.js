import request from "./request";

const gateway = {
  detectAnomalies(projectName, modelVersion, image) {
    return request("/detect", { projectName, modelVersion, image }, "post");
  },

  listProjects() {
    return request("/projects");
  },

  listModels(projectName) {
    return request(`/projects/${projectName}/models`);
  },

  startModel(projectName, modelVersion, minInferenceUnits) {
    return request(
      `/projects/${projectName}/models/${modelVersion}/start`,
      { minInferenceUnits },
      "post"
    );
  },

  stopModel(projectName, modelVersion) {
    return request(
      `/projects/${projectName}/models/${modelVersion}/stop`,
      {},
      "post"
    );
  },
};

export default gateway;
