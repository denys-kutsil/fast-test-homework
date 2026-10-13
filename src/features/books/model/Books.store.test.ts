import { BooksRepository } from "./Books.repository";
import { BooksStore } from "./Books.store";
import { FakeBooksRepository, aBook } from "features/books/model/__fixtures__/FakeBooksRepository";

const makeStore = () => {
  const repository = new FakeBooksRepository();
  const store = new BooksStore((repository as unknown) as BooksRepository);
  return { repository, store };
};

describe("BooksStore", () => {
  it("starts empty with a zero counter", () => {
    const { store } = makeStore();

    expect(store.allBooks).toEqual([]);
    expect(store.privateCount).toBe(0);
  });

  it("fills both lists on reload", async () => {
    const { repository, store } = makeStore();

    const reloading = store.reload();
    await repository.succeedReads([aBook("1"), aBook("2")]);
    await reloading;

    expect(store.allBooks.length).toBe(2);
    expect(store.privateBooks.length).toBe(2);
  });

  it("counts the private books only", async () => {
    const { repository, store } = makeStore();

    const reloading = store.reload();
    await repository.succeedReads([aBook("1")]);
    await reloading;

    expect(store.privateCount).toBe(store.privateBooks.length);
  });

  it("lets a failed reload surface to the caller", async () => {
    const { repository, store } = makeStore();

    const reloading = store.reload();
    const settled = reloading.then(() => "resolved").catch(() => "rejected");
    await repository.failReads();

    expect(await settled).toBe("rejected");
  });
});
