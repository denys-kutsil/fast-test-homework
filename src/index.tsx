import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import { ServicesContext, useServices } from "./Shared/di/ServicesContext";
import { createServices } from "./Shared/di/services";
import { Book } from "./Books/model/book.types";

function App() {
  const { booksRepository } = useServices();
  const [list, setList] = useState<Book[]>([]);

  React.useEffect(() => {
    async function load() {
      const books = await booksRepository.getAll();
      setList(books);
    }
    load();
  }, [booksRepository]);

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

ReactDOM.render(
  <ServicesContext.Provider value={createServices()}>
    <App />
  </ServicesContext.Provider>,
  rootElement
);
