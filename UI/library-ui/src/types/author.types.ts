export interface Author {
	id: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	bookCount?: number;
}

export interface CreateUpdateAuthorRequest {
	FirstName: string;
	LastName: string;
	BirthDate: string;
}

export interface AuthorFormData {
	firstName: string;
	lastName: string;
	birthDate: string;
}
