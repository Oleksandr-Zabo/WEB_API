import { Book } from './book.types.ts';

export interface User {
  id: string;
  isAdmin: boolean;
  name: string;
  nickName: string;
  email: string;
  password: string;
  savedBooks: Book[];
}

export interface CreateUpdateUserRequest {
  isAdmin: boolean;
  name: string;
  nickName: string;
  email: string;
  password: string;
}

export interface UserFormData {
  isAdmin: boolean;
  name: string;
  nickName: string;
  email: string;
  password: string;
}