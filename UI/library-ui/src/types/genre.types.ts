export interface Genre {
	id: number;
	name: string;
	description?: string;
}

export interface CreateUpdateGenreRequest {
	name: string;
	description?: string;
}

export interface GenreFormData {
	name: string;
	description?: string;
}
