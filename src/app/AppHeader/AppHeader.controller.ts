import { makeAutoObservable } from "mobx";

import { Services } from "shared/di/services";
import { Controller } from "shared/lib/useController";
import { BooksStore } from "features/books/model/Books.store";

export class AppHeaderController implements Controller {
  private readonly store: BooksStore;

  constructor(services: Services) {
    this.store = services.booksStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get booksCountLabel(): string {
    return `Your books: ${this.store.privateCount}`;
  }

  init(): void {
    // The header owns no data of its own; the count follows the store.
  }

  dispose(): void {
    // Nothing to release: no requests and no reactions are started here.
  }
}
