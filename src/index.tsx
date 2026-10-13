import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import "./Shared/lib/mobxConfig";
import { ServicesContext } from "./Shared/di/ServicesContext";
import { createServices } from "./Shared/di/services";
import { BooksPage } from "./Books/BooksPage/BooksPage";

ReactDOM.render(
  <ServicesContext.Provider value={createServices()}>
    <BooksPage />
  </ServicesContext.Provider>,
  document.getElementById("root")
);
