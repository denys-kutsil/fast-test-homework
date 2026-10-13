import { aBook, makeTestServices } from "features/books/model/__fixtures__/FakeBooksRepository";
import { AppHeaderController } from "./AppHeader.controller";

const makeController = () => {
  const { repository, store, services } = makeTestServices();
  return { repository, store, controller: new AppHeaderController(services) };
};

describe("AppHeaderController", () => {
  it("shows zero before anything is loaded", () => {
    const { controller } = makeController();

    expect(controller.booksCountLabel).toBe("Your books: 0");
  });

  it("counts the private books, not every book on the page", async () => {
    const { repository, store, controller } = makeController();

    const reloading = store.reload();
    await repository.succeedReads([aBook("1"), aBook("2"), aBook("3")], [aBook("3")]);
    await reloading;

    expect(controller.booksCountLabel).toBe("Your books: 1");
  });

  it("follows the store when the books are reloaded", async () => {
    const { repository, store, controller } = makeController();

    const first = store.reload();
    await repository.succeedReads([aBook("1")], [aBook("1")]);
    await first;

    const second = store.reload();
    await repository.succeedReads([aBook("1"), aBook("2")], [aBook("1"), aBook("2")]);
    await second;

    expect(controller.booksCountLabel).toBe("Your books: 2");
  });
});
