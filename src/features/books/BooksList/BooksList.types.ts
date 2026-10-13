export interface BookListItem {
  id: string;
  label: string;
}

export interface BooksListProps {
  items: BookListItem[];
}
