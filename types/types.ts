export interface Film {
  filmId: number;
  filmTitle: string;
  filmDescription: string;
  languageId: number;
  rentalDuration: number;
  rentalRate: string;
  length: number;
  rating: string;
  filmCategory?: string;
}

export interface SearchCriteria {
  rental_rate: string;
  length: number;
  language_id: number;
  rating: string;
}
