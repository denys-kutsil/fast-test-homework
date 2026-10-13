import { makeAutoObservable, runInAction } from "mobx";

import { Services } from "shared/di/services";
import { Controller } from "shared/lib/useController";
import { RequestScope } from "shared/lib/RequestScope";
import { BooksRepository } from "features/books/model/Books.repository";
import { BooksStore } from "features/books/model/Books.store";

const ADD_FAILED = "Could not add the book. Please try again.";
const REFRESH_FAILED = "Book added, but the list could not be refreshed.";

export class AddBookFormController implements Controller {
  name = "";
  author = "";
  isSubmitting = false;
  error = "";

  private readonly repository: BooksRepository;
  private readonly store: BooksStore;
  private readonly request = new RequestScope();

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
    // Nothing to load: the form starts empty.
  }

  dispose(): void {
    this.request.abort();
  }

  async submit(): Promise<void> {
    if (this.isSubmitDisabled) {
      return;
    }

    const options = this.request.start();
    const book = { name: this.name.trim(), author: this.author.trim() };

    this.isSubmitting = true;
    this.error = "";

    try {
      await this.repository.add(book, options);
    } catch (e) {
      if (this.request.settle(options)) {
        runInAction(() => {
          this.error = ADD_FAILED;
          this.isSubmitting = false;
        });
      }
      return;
    }

    // The book exists on the server from here on, so the fields are cleared
    // before the refresh is even attempted. If the refresh then fails, the
    // form is already empty and the message below says the book was saved,
    // which is what stops the user from submitting it a second time.
    if (options.signal!.aborted) {
      return;
    }

    runInAction(() => {
      this.name = "";
      this.author = "";
    });

    try {
      // Re-read from the API instead of appending locally: the response
      // carries no id, so anything added by hand would be invented data.
      await this.store.reload(options);

      if (this.request.settle(options)) {
        runInAction(() => {
          this.isSubmitting = false;
        });
      }
    } catch (e) {
      if (this.request.settle(options)) {
        runInAction(() => {
          this.error = REFRESH_FAILED;
          this.isSubmitting = false;
        });
      }
    }
  }
}
