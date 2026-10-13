import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import { ApiGateway } from "./Shared/api/ApiGateway";
import { BooksRepository } from "./Books/model/Books.repository";
import { Book } from "./Books/model/book.types";

const booksRepository = new BooksRepository(new ApiGateway());

function App() {
  const [list, setList] = useState<Book[]>([]);

  React.useEffect(() => {
    async function load() {
      const books = await booksRepository.getAll();
      setList(books);
    }
    load();
  }, []);

  return (
    <div>
      {list.map((book) => (
        <div key={book.id}>
          {book.author}: {book.name}
        </div>
      ))}
      <button
        onClick={() => {
          alert("TBD");
        }}
      >
        Add
      </button>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
