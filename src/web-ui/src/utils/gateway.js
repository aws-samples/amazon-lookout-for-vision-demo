import request from "./request";

const gateway = {
  detectAnomalies(projectName, modelVersion, contentType, image) {
    return request("/detect", { projectName, modelVersion, contentType, image }, "post");
  },

  async listProjects() {
    const projects = await request("/projects");
    const models = await Promise.all(
      projects.Projects.map((p) => request(`/projects/${p.ProjectName}/models`))
    );
    return projects.Projects.map((p, i) =>
      Object.assign({}, p, { Models: models[i].Models })
    );
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
