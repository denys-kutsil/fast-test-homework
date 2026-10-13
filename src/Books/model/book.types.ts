export interface BookDto {
  id?: number;
  name: string;
  author: string;
  ownerId?: string;
}

export interface Book {
  id: string;
  name: string;
  author: string;
}

export interface NewBook {
  name: string;
  author: string;
}
