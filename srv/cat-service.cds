using my.bookshop as my from '../db/schema';

type BooksInput {
  title : String;
  stock : Integer;
}

service CatalogService {
  entity Books as projection on my.Books;

  action UploadBooks(items: array of BooksInput) returns Integer;
}
