import React, { useEffect, useRef } from "react";
import { findDOMNode } from "react-dom";
import { Form } from "react-bootstrap";

const ProjectSelect = ({ onChange, onMount, projects, preSelected }) => {
  const selected = useRef(undefined);

  const changeHandler = () => onChange(findDOMNode(selected.current).value);

  useEffect(() => {
    onMount(findDOMNode(selected.current).value);
  }, [onMount, selected]);

  return (
    <div className="form-element">
      <div className="form-prompt">
        Select your model
        <div className="form-instructions">
          This list contains all the project and versions in the "HOSTED" state
        </div>
      </div>
      <div className="upload-prompt-row">
        <Form.Control
          as="select"
          onChange={changeHandler}
          ref={(x) => (selected.current = x)}
          defaultValue={preSelected}
        >
          {Object.keys(projects).map((project, i) =>
            projects[project].map((model, j) => (
              <option
                key={`${i}/${j}`}
                value={`${project}/${model.details.ModelVersion}`}
              >
                {project}/{model.details.ModelVersion}
              </option>
            ))
          )}
        </Form.Control>
      </div>
    </div>
  );
};

export default ProjectSelect;
