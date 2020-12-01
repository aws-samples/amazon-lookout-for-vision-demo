import { Authenticator, Greetings, SignUp } from "aws-amplify-react";
import React, { useState } from "react";
import { Container } from "react-bootstrap";

import Header from "./components/Header";
import ImageMode from "./components/ImageMode";
import ProjectsSummary from "./components/ProjectsSummary";
import SettingsHelp from "./components/SettingsHelp";
import Help from "./components/Help";

import gateway from "./utils/gateway";

const App = () => {
  const [authState, setAuthState] = useState(undefined);
  const [currentPage, setCurrentPage] = useState("projects");
  const [model, setModel] = useState(undefined);
  const [projectName, setProjectName] = useState(undefined);
  const [refreshCycle, setRefreshCycle] = useState(0);

  const onHelp = () => setCurrentPage("help");
  const loadProjectList = () => setCurrentPage("projects");
  const loadModel = (projectName, model) => {
    setProjectName(projectName);
    setModel(model);
    setCurrentPage("image");
  };

  const classNames = ["App"];
  if (authState !== "signedIn") classNames.push("amplify-auth");

  return (
    <div className={classNames.join(" ")}>
      <Authenticator
        onStateChange={(s) => setAuthState(s)}
        hide={[Greetings, SignUp]}
      >
        {authState === "signedIn" && (
          <>
            <Header
              currentPage={currentPage}
              loadProjectList={loadProjectList}
              onHelp={onHelp}
              onRefresh={() => {
                setRefreshCycle(refreshCycle + 1);
              }}
            />
            <Container>
              <SettingsHelp show={!window.lookoutVisionSettings} />
              {currentPage === "projects" && (
                <ProjectsSummary
                  gateway={gateway}
                  onHelp={onHelp}
                  onModelClick={loadModel}
                  refreshCycle={refreshCycle}
                />
              )}
              {currentPage === "help" && <Help />}
              {currentPage === "image" && (
                <ImageMode gateway={gateway} model={model} name={projectName} />
              )}
            </Container>
          </>
        )}
      </Authenticator>
    </div>
  );
};

export default App;
