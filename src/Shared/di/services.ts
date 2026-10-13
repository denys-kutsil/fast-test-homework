import { BooksRepository } from "../../Books/model/Books.repository";
import { ApiGateway } from "../api/ApiGateway";

export interface Services {
  booksRepository: BooksRepository;
}

export const createServices = (): Services => ({
  booksRepository: new BooksRepository(new ApiGateway())
});
