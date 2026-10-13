import ApiGateway from "../Shared/ApiGateway.js";
import { API_USER } from "../Shared/api/config";

const BOOKS_PATH = `/books/${API_USER}/`;

class BooksRepository {
  constructor() {
    this.httpGateway = new ApiGateway();
  }

  getBooks = async () => {
    const booksDto = await this.httpGateway.get(BOOKS_PATH);
    return booksDto;
  };

  addBook = async ({ name, author }) => {
    const bookAddDto = await this.httpGateway.post(BOOKS_PATH, { name, author });
    return bookAddDto && bookAddDto.status === "ok" ? true : false;
  };
}

const booksRepository = new BooksRepository();
export default booksRepository;
