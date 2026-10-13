import { HttpGateway } from "shared/api/HttpGateway";
import { HttpBooksRepository } from "./Books.repository";
import { BookDto } from "./book.types";

class FakeHttpGateway implements HttpGateway {
  getPaths: string[] = [];
  postCalls: Array<{ path: string; payload: unknown }> = [];
  getResult: unknown = [];
  postResult: unknown = { status: "ok" };

  get = async <T>(path: string): Promise<T> => {
    this.getPaths.push(path);
    return this.getResult as T;
  };

  post = async <T>(path: string, payload: unknown): Promise<T> => {
    this.postCalls.push({ path, payload });
    return this.postResult as T;
  };
}

const seeded: BookDto = {
  id: 111,
  name: "Wind in the willows",
  author: "Kenneth Graeme",
  ownerId: "postnikov"
};

const created: BookDto = { name: "New Book", author: "New Author" };

const repositoryWith = (dtos: BookDto[]) => {
  const http = new FakeHttpGateway();
  http.getResult = dtos;
  return { http, repository: new HttpBooksRepository(http, "tester") };
};

describe("BooksRepository", () => {
  it("reads all books from the user's collection", async () => {
    const { http, repository } = repositoryWith([]);

    await repository.getAll();

    expect(http.getPaths).toEqual(["/books/tester/"]);
  });

  it("reads private books from the private sub-resource", async () => {
    const { http, repository } = repositoryWith([]);

    await repository.getPrivate();

    expect(http.getPaths).toEqual(["/books/tester/private"]);
  });

  it("maps a dto to the domain model", async () => {
    const { repository } = repositoryWith([seeded]);

    const books = await repository.getAll();

    expect(books).toEqual([
      { id: "111", name: "Wind in the willows", author: "Kenneth Graeme" }
    ]);
  });

  it("derives an id for a book the api returned without one", async () => {
    const { repository } = repositoryWith([created]);

    const books = await repository.getAll();

    expect(books[0].id).toBe("local::New Book:New Author:0");
  });

  it("derives the same id every time the same response is mapped", async () => {
    const { repository } = repositoryWith([seeded, created]);

    const first = await repository.getAll();
    const second = await repository.getAll();

    expect(second.map((b) => b.id)).toEqual(first.map((b) => b.id));
  });

  it("derives different ids for books with identical name and author", async () => {
    const { repository } = repositoryWith([created, created]);

    const books = await repository.getAll();

    expect(books[0].id).not.toBe(books[1].id);
  });

  it("creates a book by posting to the collection", async () => {
    const { http, repository } = repositoryWith([]);

    await repository.add({ name: "Dune", author: "Herbert" });

    expect(http.postCalls).toEqual([
      { path: "/books/tester/", payload: { name: "Dune", author: "Herbert" } }
    ]);
  });

  it("fails when the api does not confirm the new book", async () => {
    const { http, repository } = repositoryWith([]);
    http.postResult = { status: "error" };

    await expect(repository.add({ name: "Dune", author: "Herbert" })).rejects.toThrow();
  });
});
