import { BooksRepository } from "features/books/model/Books.repository";
import { BooksStore } from "features/books/model/Books.store";
import { ApiGateway } from "shared/api/ApiGateway";

export interface Services {
  booksRepository: BooksRepository;
  booksStore: BooksStore;
}

export const createServices = (): Services => {
  const booksRepository = new BooksRepository(new ApiGateway());

  return {
    booksRepository,
    booksStore: new BooksStore(booksRepository)
  };
};
