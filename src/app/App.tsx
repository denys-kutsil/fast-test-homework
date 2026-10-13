import React from "react";

import { AppHeader } from "app/AppHeader/AppHeader";
import { BooksPage } from "features/books/BooksPage/BooksPage";

export const App = () => (
  <div className="app">
    <AppHeader />
    <BooksPage />
  </div>
);
