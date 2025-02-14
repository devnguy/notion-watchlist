import { type UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints.js";

export type ApiSearchMovieResponse = {
  results: ApiMovie[];
  page: number;
  total_results: number;
  total_pages: number;
};

export type ApiMovie = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export interface MovieServiceModule {
  searchMovies(title: string): Promise<Movie | MovieNotFound>;
}

export type UpdateMoviePayload = {
  id: string;
  movie: Movie | MovieNotFound;
};

export interface NotionServiceModule {
  updateMoviePage(input: UpdateMoviePayload): Promise<UpdatePageResponse>;
  getPageToUpdate(): Promise<{
    id: string | null;
    title: string | null;
  }>;
}

export type MovieNotFound = {
  id: null;
  title: string;
};

export type Movie = {
  // changed from number to string
  id: number;
  title: string;
  genres: string[];
  overview: string;
  release_date: string;
  reviews: number;
  backdrop_path: string;
  // notion properties
  watch_status: boolean;
};

export enum WatchStatus {
  WATCHED = "Watched",
  UNWATCHED = "Unwatched",
}
