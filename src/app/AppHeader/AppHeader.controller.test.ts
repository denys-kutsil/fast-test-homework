import { Services } from "shared/di/services";
import { BooksRepository } from "features/books/model/Books.repository";
import { BooksStore } from "features/books/model/Books.store";
import { FakeBooksRepository, aBook } from "features/books/model/__fixtures__/FakeBooksRepository";
import { AppHeaderController } from "./AppHeader.controller";

const makeController = () => {
  const repository = new FakeBooksRepository();
  const booksStore = new BooksStore((repository as unknown) as BooksRepository);
  const services = ({ booksRepository: repository, booksStore } as unknown) as Services;

  return { repository, store: booksStore, controller: new AppHeaderController(services) };
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
