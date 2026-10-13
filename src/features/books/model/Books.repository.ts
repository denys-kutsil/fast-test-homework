import { API_USER } from "shared/api/config";
import { HttpGateway, RequestOptions } from "shared/api/HttpGateway";
import { Book, BookDto, NewBook } from "./book.types";

interface AddBookResultDto {
  status?: string;
}

// The API omits id on every book it did not seed itself, so the key has to be
// derived. The position is part of it because the data really does contain
// books with identical name and author.
const syntheticId = (dto: BookDto, index: number): string =>
  `local:${dto.ownerId || ""}:${dto.name}:${dto.author}:${index}`;

const toBook = (dto: BookDto, index: number): Book => ({
  id: typeof dto.id === "number" ? String(dto.id) : syntheticId(dto, index),
  name: dto.name,
  author: dto.author
});

export class BooksRepository {
  private readonly http: HttpGateway;
  private readonly booksPath: string;

  constructor(http: HttpGateway, user: string = API_USER) {
    this.http = http;
    this.booksPath = `/books/${user}/`;
  }

  getAll = async (options?: RequestOptions): Promise<Book[]> => {
    const dto = await this.http.get<BookDto[]>(this.booksPath, options);
    return dto.map(toBook);
  };

  getPrivate = async (options?: RequestOptions): Promise<Book[]> => {
    const dto = await this.http.get<BookDto[]>(`${this.booksPath}private`, options);
    return dto.map(toBook);
  };

  add = async (book: NewBook, options?: RequestOptions): Promise<void> => {
    const result = await this.http.post<AddBookResultDto>(this.booksPath, book, options);

    if (result.status !== "ok") {
      throw new Error("The API did not confirm the new book");
    }
  };
}
