import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Spinner, Table } from "react-bootstrap";
import { formatErrorMessage, mapResults } from "../utils";

import Icon from "./Icon";
import ProjectActions from "./ProjectActions";

const ProjectsSummary = ({ gateway, onHelp, onModelClick, refreshCycle }) => {
  const [projects, setProjects] = useState(undefined);
  const [errorDetails, setErrorDetails] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [projectsRefreshCycle, setProjectsRefreshCycle] = useState(1);

  const refreshProjects = () =>
    setProjectsRefreshCycle(projectsRefreshCycle + 1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const projects = await gateway.listProjects();
        setProjects(mapResults(projects));
      } catch (e) {
        setErrorDetails(formatErrorMessage(e));
      }
      setLoading(false);
    };

    loadData();
  }, [gateway, projectsRefreshCycle, refreshCycle]);

  return (
    <div className="projects tab-content">
      <div className="logo">
        <Icon type="logo" size="64" />
      </div>
      <h2>Amazon Lookout for Vision Demo</h2>
      {errorDetails && (
        <Alert variant="danger" style={{ marginTop: "30px" }}>
          An error happened: {errorDetails}.{" "}
          <a href={window.location.href}>Retry</a>.
        </Alert>
      )}
      {loading && (
        <>
          <Spinner
            animation="border"
            role="status"
            style={{ marginTop: "30px" }}
          >
            <span className="sr-only">Loading...</span>
          </Spinner>
          <br />
        </>
      )}
      {projects && Object.keys(projects).length === 0 && (
        <div className="no-projects">
          There are no projects available in the current account. Check the{" "}
          <Button variant="link" onClick={onHelp}>
            help page
          </Button>{" "}
          if you need help on getting started.
        </div>
      )}
      {projects &&
        Object.keys(projects)
          .sort()
          .map((projectName, index) => (
            <Card key={index}>
              <Card.Header>{projectName}</Card.Header>
              <Card.Body>
                {projects[projectName].length === 0 && (
                  <span>
                    There are no models available for {projectName} project
                  </span>
                )}
                <Table>
                  <tbody>
                    {projects[projectName].map((model, index) => (
                      <tr key={`v-${index}`}>
                        <td>
                          {model.details.Status === "HOSTED" ? (
                            <Button
                              variant="link"
                              onClick={() =>
                                onModelClick(
                                  projectName,
                                  model.details.ModelVersion
                                )
                              }
                            >
                              Model Version: {model.version}
                            </Button>
                          ) : (
                            `Model Version: ${model.version}`
                          )}
                        </td>
                        <td>{model.details.Status}</td>
                        <td style={{ textAlign: "right" }}>
                          <ProjectActions
                            projectName={projectName}
                            modelVersion={model.version}
                            gateway={gateway}
                            onError={(e) => setErrorDetails(e.toString())}
                            refreshProjects={refreshProjects}
                            status={model.details.Status}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}
    </div>
  );
};

export default ProjectsSummary;
