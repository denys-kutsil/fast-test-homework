import { makeAutoObservable, runInAction } from "mobx";

import { Services } from "shared/di/services";
import { Controller } from "shared/lib/useController";
import { BooksStore } from "features/books/model/Books.store";
import { Book } from "features/books/model/book.types";

const LOAD_FAILED = "Could not load the books. Please try again.";

export class BooksPageController implements Controller {
  isLoading = false;
  error = "";

  private readonly store: BooksStore;
  private pending: AbortController | null = null;

  constructor(services: Services) {
    this.store = services.booksStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get items(): Book[] {
    return this.store.allBooks;
  }

  // Inverted on purpose: the view binds these straight to the hidden
  // attribute, so negating them in JSX would put logic back into the view.
  get isLoaderHidden(): boolean {
    return !this.isLoading;
  }

  get isErrorHidden(): boolean {
    return this.error === "";
  }

  get isEmptyHidden(): boolean {
    return this.isLoading || this.error !== "" || this.items.length > 0;
  }

  init(): void {
    this.load();
  }

  dispose(): void {
    this.abortPending();
  }

  async load(): Promise<void> {
    this.abortPending();

    const request = new AbortController();
    this.pending = request;
    this.isLoading = true;
    this.error = "";

    try {
      await this.store.reload({ signal: request.signal });

      if (request.signal.aborted) {
        return;
      }

      runInAction(() => {
        this.isLoading = false;
        this.pending = null;
      });
    } catch (e) {
      if (request.signal.aborted) {
        return;
      }

      runInAction(() => {
        this.error = LOAD_FAILED;
        this.isLoading = false;
        this.pending = null;
      });
    }
  }

  private abortPending(): void {
    if (this.pending !== null) {
      this.pending.abort();
      this.pending = null;
    }
  }
}
