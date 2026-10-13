import React from "react";
import { observer } from "mobx-react";

import { BooksListProps } from "./BooksList.types";

export const BooksList = observer((props: BooksListProps) => (
  <ul className="books-list">
    {props.items.map((item) => (
      <li key={item.id}>{item.label}</li>
    ))}
  </ul>
));
