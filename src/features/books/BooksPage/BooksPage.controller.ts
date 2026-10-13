import { makeAutoObservable, runInAction } from "mobx";

import { SegmentedOption } from "components/SegmentedControl/SegmentedControl.types";
import { Services } from "shared/di/services";
import { Controller } from "shared/lib/useController";
import { RequestScope } from "shared/lib/RequestScope";
import { BooksStore } from "features/books/model/Books.store";
import { Book, BooksScope } from "features/books/model/book.types";

const LOAD_FAILED = "Could not load the books. Please try again.";

export class BooksPageController implements Controller {
  scope: BooksScope = "all";
  isLoading = false;
  error = "";

  private readonly store: BooksStore;
  private readonly request = new RequestScope();

  constructor(services: Services) {
    this.store = services.booksStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // Both lists are already in the store after reload(), so switching scope is
  // a local operation and never hits the network.
  get items(): Book[] {
    return this.scope === "private" ? this.store.privateBooks : this.store.allBooks;
  }

  get scopeOptions(): Array<SegmentedOption<BooksScope>> {
    return [
      { value: "all", label: "All books", checked: this.scope === "all" },
      { value: "private", label: "Private books", checked: this.scope === "private" }
    ];
  }

  setScope(scope: BooksScope): void {
    this.scope = scope;
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
    this.request.abort();
  }

  async load(): Promise<void> {
    const options = this.request.start();
    this.isLoading = true;
    this.error = "";

    try {
      await this.store.reload(options);

      if (this.request.settle(options)) {
        runInAction(() => {
          this.isLoading = false;
        });
      }
    } catch (e) {
      if (this.request.settle(options)) {
        runInAction(() => {
          this.error = LOAD_FAILED;
          this.isLoading = false;
        });
      }
    }
  }
}
