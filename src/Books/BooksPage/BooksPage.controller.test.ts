import { RequestOptions } from "../../Shared/api/HttpGateway";
import { Services } from "../../Shared/di/services";
import { BooksRepository } from "../model/Books.repository";
import { Book } from "../model/book.types";
import { BooksPageController } from "./BooksPage.controller";

const aBook = (id: string): Book => ({ id, name: `Book ${id}`, author: "Author" });

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

class FakeBooksRepository {
  calls: RequestOptions[] = [];

  private resolveLast: (books: Book[]) => void = () => undefined;
  private rejectLast: (error: Error) => void = () => undefined;

  getAll = (options?: RequestOptions): Promise<Book[]> => {
    this.calls.push(options as RequestOptions);
    return new Promise<Book[]>((resolve, reject) => {
      this.resolveLast = resolve;
      this.rejectLast = reject;
    });
  };

  succeed = async (books: Book[]) => {
    this.resolveLast(books);
    await flush();
  };

  fail = async () => {
    this.rejectLast(new Error("network is down"));
    await flush();
  };
}

const makeController = () => {
  const repository = new FakeBooksRepository();
  const services = ({ booksRepository: repository } as unknown) as Services;
  return { repository, controller: new BooksPageController(services) };
};

describe("BooksPageController", () => {
  it("requests the books on init", () => {
    const { repository, controller } = makeController();

    controller.init();

    expect(repository.calls.length).toBe(1);
  });

  it("shows the loader while the request is in flight", () => {
    const { controller } = makeController();

    controller.init();

    expect(controller.isLoaderHidden).toBe(false);
  });

  it("publishes the loaded books and hides the loader", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeed([aBook("1"), aBook("2")]);

    expect(controller.items.map((book) => book.id)).toEqual(["1", "2"]);
    expect(controller.isLoaderHidden).toBe(true);
  });

  it("keeps the empty message hidden while loading", () => {
    const { controller } = makeController();

    controller.init();

    expect(controller.isEmptyHidden).toBe(true);
  });

  it("shows the empty message once an empty list arrives", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeed([]);

    expect(controller.isEmptyHidden).toBe(false);
  });

  it("reports an error when loading fails", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.fail();

    expect(controller.isErrorHidden).toBe(false);
    expect(controller.error).toBeTruthy();
    expect(controller.isLoaderHidden).toBe(true);
  });

  it("hides the empty message while an error is shown", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.fail();

    expect(controller.isEmptyHidden).toBe(true);
  });

  it("aborts the in-flight request on dispose", () => {
    const { repository, controller } = makeController();

    controller.init();
    controller.dispose();

    expect(repository.calls[0].signal!.aborted).toBe(true);
  });

  it("does not report an error for a request aborted on dispose", async () => {
    const { repository, controller } = makeController();

    controller.init();
    controller.dispose();
    await repository.fail();

    expect(controller.error).toBe("");
  });
});
