import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import booksRepository from "./Books/Books.repository";

function App() {
  const [list, setList] = useState<any[]>([]);

  React.useEffect(() => {
    async function load() {
      const books = await booksRepository.getBooks();
      setList(books);
    }
    load();
  }, []);

  return (
    <div>
      {list.map((book, i) => (
        <div key={i}>
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
