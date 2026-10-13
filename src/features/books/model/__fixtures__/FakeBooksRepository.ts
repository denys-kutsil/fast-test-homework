import { RequestOptions } from "shared/api/HttpGateway";
import { Book, NewBook } from "features/books/model/book.types";

export const aBook = (id: string): Book => ({
  id,
  name: `Book ${id}`,
  author: "Author"
});

export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Hands out promises the test resolves by hand, so loading states can be
 * observed while a request is still in flight.
 */
export class FakeBooksRepository {
  readCalls: RequestOptions[] = [];
  addCalls: NewBook[] = [];

  private resolvers: Array<(books: Book[]) => void> = [];
  private rejecters: Array<(error: Error) => void> = [];
  private addResolve: () => void = () => undefined;
  private addReject: (error: Error) => void = () => undefined;

  getAll = (options?: RequestOptions): Promise<Book[]> => this.read(options);

  getPrivate = (options?: RequestOptions): Promise<Book[]> => this.read(options);

  add = (book: NewBook, options?: RequestOptions): Promise<void> => {
    this.addCalls.push(book);
    this.readCalls.push(options as RequestOptions);
    return new Promise<void>((resolve, reject) => {
      this.addResolve = resolve;
      this.addReject = reject;
    });
  };

  confirmAdd = async () => {
    this.addResolve();
    await flush();
  };

  rejectAdd = async () => {
    this.addReject(new Error("the api said no"));
    await flush();
  };

  succeedReads = async (books: Book[]) => {
    const pending = this.resolvers;
    this.resolvers = [];
    this.rejecters = [];
    pending.forEach((resolve) => resolve(books));
    await flush();
  };

  failReads = async () => {
    const pending = this.rejecters;
    this.resolvers = [];
    this.rejecters = [];
    pending.forEach((reject) => reject(new Error("network is down")));
    await flush();
  };

  private read(options?: RequestOptions): Promise<Book[]> {
    this.readCalls.push(options as RequestOptions);
    return new Promise<Book[]>((resolve, reject) => {
      this.resolvers.push(resolve);
      this.rejecters.push(reject);
    });
  }
}
