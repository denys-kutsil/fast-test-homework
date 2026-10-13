import { makeAutoObservable, runInAction } from "mobx";

import { Services } from "shared/di/services";
import { Controller } from "shared/lib/useController";
import { BooksRepository } from "features/books/model/Books.repository";
import { BooksStore } from "features/books/model/Books.store";

const ADD_FAILED = "Could not add the book. Please try again.";

export class AddBookFormController implements Controller {
  name = "";
  author = "";
  isSubmitting = false;
  error = "";

  private readonly repository: BooksRepository;
  private readonly store: BooksStore;
  private pending: AbortController | null = null;

  constructor(services: Services) {
    this.repository = services.booksRepository;
    this.store = services.booksStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isSubmitDisabled(): boolean {
    return this.name.trim() === "" || this.author.trim() === "" || this.isSubmitting;
  }

  get areFieldsDisabled(): boolean {
    return this.isSubmitting;
  }

  get isErrorHidden(): boolean {
    return this.error === "";
  }

  setName(value: string): void {
    this.name = value;
  }

  setAuthor(value: string): void {
    this.author = value;
  }

  init(): void {
    this.error = "";
  }

  dispose(): void {
    this.abortPending();
  }

  async submit(): Promise<void> {
    if (this.isSubmitDisabled) {
      return;
    }

    const request = new AbortController();
    const book = { name: this.name.trim(), author: this.author.trim() };

    this.pending = request;
    this.isSubmitting = true;
    this.error = "";

    try {
      await this.repository.add(book, { signal: request.signal });
      // Re-read from the API instead of appending locally: the response
      // carries no id, so anything added by hand would be invented data.
      await this.store.reload({ signal: request.signal });

      if (request.signal.aborted) {
        return;
      }

      runInAction(() => {
        this.name = "";
        this.author = "";
        this.isSubmitting = false;
        this.pending = null;
      });
    } catch (e) {
      if (request.signal.aborted) {
        return;
      }

      runInAction(() => {
        this.error = ADD_FAILED;
        this.isSubmitting = false;
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
