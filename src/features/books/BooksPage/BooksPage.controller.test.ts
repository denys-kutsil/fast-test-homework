import { Services } from "shared/di/services";
import { BooksRepository } from "features/books/model/Books.repository";
import { BooksStore } from "features/books/model/Books.store";
import { FakeBooksRepository, aBook } from "features/books/model/__fixtures__/FakeBooksRepository";
import { BooksPageController } from "./BooksPage.controller";

const makeController = () => {
  const repository = new FakeBooksRepository();
  const booksStore = new BooksStore((repository as unknown) as BooksRepository);
  const services = ({ booksRepository: repository, booksStore } as unknown) as Services;

  return { repository, store: booksStore, controller: new BooksPageController(services) };
};

describe("BooksPageController", () => {
  it("asks for the books on init", () => {
    const { repository, controller } = makeController();

    controller.init();

    expect(repository.readCalls.length).toBeGreaterThan(0);
  });

  it("shows the loader while the request is in flight", () => {
    const { controller } = makeController();

    controller.init();

    expect(controller.isLoaderHidden).toBe(false);
  });

  it("publishes the loaded books and hides the loader", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1"), aBook("2")]);

    expect(controller.items.map((book) => book.id)).toEqual(["1", "2"]);
    expect(controller.isLoaderHidden).toBe(true);
  });

  it("reads its items straight from the store", async () => {
    const { repository, store, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1")]);

    expect(controller.items).toBe(store.allBooks);
  });

  it("keeps the empty message hidden while loading", () => {
    const { controller } = makeController();

    controller.init();

    expect(controller.isEmptyHidden).toBe(true);
  });

  it("shows the empty message once an empty list arrives", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([]);

    expect(controller.isEmptyHidden).toBe(false);
  });

  it("reports an error when loading fails", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.failReads();

    expect(controller.isErrorHidden).toBe(false);
    expect(controller.isLoaderHidden).toBe(true);
  });

  it("hides the empty message while an error is shown", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.failReads();

    expect(controller.isEmptyHidden).toBe(true);
  });

  it("aborts the in-flight request on dispose", () => {
    const { repository, controller } = makeController();

    controller.init();
    controller.dispose();

    expect(repository.readCalls[0].signal!.aborted).toBe(true);
  });

  it("does not report an error for a request aborted on dispose", async () => {
    const { repository, controller } = makeController();

    controller.init();
    controller.dispose();
    await repository.failReads();

    expect(controller.error).toBe("");
  });
});
