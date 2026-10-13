import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import "shared/lib/mobxConfig";
import { App } from "app/App";
import { ServicesContext } from "shared/di/ServicesContext";
import { createServices } from "shared/di/services";

ReactDOM.render(
  <ServicesContext.Provider value={createServices()}>
    <App />
  </ServicesContext.Provider>,
  document.getElementById("root")
);
