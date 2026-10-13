import { aBook, makeTestServices } from "features/books/model/__fixtures__/FakeBooksRepository";
import { BooksPageController } from "./BooksPage.controller";

const makeController = () => {
  const { repository, store, services } = makeTestServices();
  return { repository, store, controller: new BooksPageController(services) };
};

describe("BooksPageController", () => {
  it("asks for the books on init", () => {
    const { repository, controller } = makeController();

    controller.init();

    expect(repository.requests.length).toBe(2);
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

  it("follows the store, so a reload is reflected without another init", async () => {
    const { repository, store, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1")]);

    const reloading = store.reload();
    await repository.succeedReads([aBook("1"), aBook("2")]);
    await reloading;

    expect(controller.items.map((item) => item.id)).toEqual(["1", "2"]);
  });

  it("builds the label so the view never has to compose one", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([{ id: "7", name: "I, Robot", author: "Isaac Asimov" }]);

    expect(controller.items).toEqual([{ id: "7", label: "Isaac Asimov: I, Robot" }]);
  });

  it("labels the books of the active scope", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads(
      [{ id: "1", name: "Dune", author: "Herbert" }],
      [{ id: "2", name: "The Hobbit", author: "Tolkien" }]
    );
    controller.setScope("private");

    expect(controller.items).toEqual([{ id: "2", label: "Tolkien: The Hobbit" }]);
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

  it("starts on the all-books scope", () => {
    const { controller } = makeController();

    expect(controller.scope).toBe("all");
    expect(controller.scopeOptions[0].checked).toBe(true);
    expect(controller.scopeOptions[1].checked).toBe(false);
  });

  it("shows the private books after switching scope", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1"), aBook("2")], [aBook("2")]);
    controller.setScope("private");

    expect(controller.items.map((book) => book.id)).toEqual(["2"]);
  });

  it("marks the active scope as checked", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1")]);
    controller.setScope("private");

    expect(controller.scopeOptions[0].checked).toBe(false);
    expect(controller.scopeOptions[1].checked).toBe(true);
  });

  it("switches back to all books", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1"), aBook("2")], [aBook("2")]);
    controller.setScope("private");
    controller.setScope("all");

    expect(controller.items.map((book) => book.id)).toEqual(["1", "2"]);
  });

  it("does not hit the api when the scope changes", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1")]);
    const callsAfterLoad = repository.requests.length;
    controller.setScope("private");

    expect(repository.requests.length).toBe(callsAfterLoad);
  });

  it("shows the empty message when the active scope has no books", async () => {
    const { repository, controller } = makeController();

    controller.init();
    await repository.succeedReads([aBook("1")], []);
    controller.setScope("private");

    expect(controller.isEmptyHidden).toBe(false);
  });

  it("aborts the in-flight request on dispose", () => {
    const { repository, controller } = makeController();

    controller.init();
    controller.dispose();

    expect(repository.requests[0].signal!.aborted).toBe(true);
  });

  it("does not report an error for a request aborted on dispose", async () => {
    const { repository, controller } = makeController();

    controller.init();
    controller.dispose();
    await repository.failReads();

    expect(controller.error).toBe("");
  });
});
