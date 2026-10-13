import React from "react";
import { observer } from "mobx-react";

import { Book } from "../model/book.types";

interface BooksListProps {
  items: Book[];
}

export const BooksList = observer((props: BooksListProps) => (
  <ul className="books-list">
    {props.items.map((book) => (
      <li key={book.id}>
        {book.author}: {book.name}
      </li>
    ))}
  </ul>
));
