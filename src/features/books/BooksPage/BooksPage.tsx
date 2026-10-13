import React from "react";
import { observer } from "mobx-react";

import { useController } from "shared/lib/useController";
import { AddBookForm } from "features/books/AddBookForm/AddBookForm";
import { BooksList } from "features/books/BooksList/BooksList";
import { BooksPageController } from "./BooksPage.controller";

export const BooksPage = observer(() => {
  const controller = useController(BooksPageController);

  return (
    <section className="books-page">
      <AddBookForm />
      <p hidden={controller.isLoaderHidden}>Loading…</p>
      <p hidden={controller.isErrorHidden} className="error">
        {controller.error}
      </p>
      <p hidden={controller.isEmptyHidden}>No books yet</p>
      <BooksList items={controller.items} />
    </section>
  );
});
