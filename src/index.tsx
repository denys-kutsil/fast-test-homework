import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import "shared/lib/mobxConfig";
import { ServicesContext } from "shared/di/ServicesContext";
import { createServices } from "shared/di/services";
import { BooksPage } from "features/books/BooksPage/BooksPage";

ReactDOM.render(
  <ServicesContext.Provider value={createServices()}>
    <BooksPage />
  </ServicesContext.Provider>,
  document.getElementById("root")
);
