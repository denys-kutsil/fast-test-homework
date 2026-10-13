import { makeAutoObservable, runInAction } from "mobx";

import { RequestOptions } from "shared/api/HttpGateway";
import { BooksRepository } from "./Books.repository";
import { Book } from "./book.types";

export class BooksStore {
  allBooks: Book[] = [];
  privateBooks: Book[] = [];

  private readonly repository: BooksRepository;

  constructor(repository: BooksRepository) {
    this.repository = repository;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get privateCount(): number {
    return this.privateBooks.length;
  }

  // Both lists are refreshed together, including after a book is created, so
  // the counter in the header always matches what the server actually holds.
  async reload(options?: RequestOptions): Promise<void> {
    const [all, personal] = await Promise.all([
      this.repository.getAll(options),
      this.repository.getPrivate(options)
    ]);

    runInAction(() => {
      this.allBooks = all;
      this.privateBooks = personal;
    });
  }
}
