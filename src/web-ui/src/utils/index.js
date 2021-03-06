export const mapResults = (data, type) => {
  const result = {};

  data.forEach((project) => {
    const projectName = project.ProjectName;
    if (!type) result[projectName] = result[projectName] || [];

    project.Models.forEach((model) => {
      const modelVersion = model.ModelVersion;
      if (!type || model.Status === type) {
        result[projectName] = result[projectName] || [];
        result[projectName].unshift({
          version: modelVersion,
          details: model,
        });
      }
    });
  });

  return result;
};

const MAX_RETRIES = 3;
const RETRY_START = 1000;

export const retryWrapper = (p, timeout, retryN = 0) =>
  new Promise((resolve, reject) =>
    p()
      .then(resolve)
      .catch((e) => {
        if (retryN === MAX_RETRIES) return reject(e);
        const t = (timeout || RETRY_START / 2) * 2;
        const r = retryN + 1;
        console.log(`Retry n. ${r} in ${t / 1000}s...`);
        setTimeout(() => retryWrapper(p, t, r).then(resolve).catch(reject), t);
      })
  );

export const formatErrorMessage = (e) => {
  let msg = "An error happened";
  if (e.response) {
    if (e.response.status) msg += ` (${e.response.status} status code)`;
    if (e?.response?.data?.error?.message)
      msg += `: ${e.response.data.error.message}`;
  }

  return msg;
};

export const isErrorRetryable = (e) =>
  e?.response?.data?.error?.retryable === true;

export const isImageValidationError = (e) =>
  e?.response?.data?.error?.code || false;
