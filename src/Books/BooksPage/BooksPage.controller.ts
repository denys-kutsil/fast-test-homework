import { makeAutoObservable, runInAction } from "mobx";

import { Services } from "../../Shared/di/services";
import { Controller } from "../../Shared/lib/useController";
import { BooksRepository } from "../model/Books.repository";
import { Book } from "../model/book.types";

const LOAD_FAILED = "Could not load the books. Please try again.";

export class BooksPageController implements Controller {
  items: Book[] = [];
  isLoading = false;
  error = "";

  private readonly repository: BooksRepository;
  private pending: AbortController | null = null;

  constructor(services: Services) {
    this.repository = services.booksRepository;
    makeAutoObservable(this, {}, { autoBind: true });
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
      const items = await this.repository.getAll({ signal: request.signal });

      if (request.signal.aborted) {
        return;
      }

      runInAction(() => {
        this.items = items;
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
