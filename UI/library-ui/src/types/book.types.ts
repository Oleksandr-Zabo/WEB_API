
export interface Book {
  id: string;
  title: string;
  authorId: string;
  authorName?: string;
  isbn: string;
  publishYear: number;
  price: number;
  genreIds?: number[];
  genreNames?: string[];
}


export interface CreateUpdateBookRequest {
  title: string;
  authorId: string;
  isbn: string;
  publishYear: number;
  price: number;
  genreIds: number[];
}


export interface BookFormData {
  title: string;
  authorId: string;
  isbn: string;
  publishYear: number | string;
  price: number | string;
  genreIds: number[];
}
