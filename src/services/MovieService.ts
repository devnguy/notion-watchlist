import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ApiMovie,
  ApiSearchMovieResponse,
  Movie,
  MovieNotFound,
  MovieServiceModule,
  WatchStatus,
} from "./types";

// mapping is from https://api.themoviedb.org/3/genre/movie/list
const getGenreFromId = (id: number): string => {
  return {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  }[id];
};

const mapMovie = (movie: ApiMovie): Movie => {
  return {
    title: movie.title,
    genres: movie.genre_ids.map(id => getGenreFromId(id)),
    id: movie.id,
    overview: movie.overview,
    release_date: movie.release_date,
    reviews: movie.vote_average,
    backdrop_path: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,

    // notion properties
    watch_status: false,
  };
};

export class MovieService implements MovieServiceModule {
  private readonly apiKey: string;
  private readonly url: string;
  private readonly accessToken: string;
  private client: AxiosInstance;

  constructor(config: { apiKey: string; url: string; accessToken: string }) {
    this.apiKey = config.apiKey;
    this.accessToken = config.accessToken;
    this.url = config.url;
    this.client = axios.create({
      baseURL: this.url,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Returns the first movie that matches the search
  // https://developer.themoviedb.org/reference/search-movie
  // https://api.themoviedb.org/3/search/movie
  async searchMovies(title: string): Promise<Movie | MovieNotFound> {
    const url = new URL(`${this.url}/search/movie`);
    url.searchParams.append("query", title);
    // url.searchParams.append("query", "test");

    const response: AxiosResponse<ApiSearchMovieResponse> =
      await this.client.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

    if (response.data.results.length === 0) {
      return {
        id: null,
        title: title,
      };
    }

    const sortedByPopularity = response.data.results.sort(
      (a, b) => b.vote_count - a.vote_count,
    );

    const movie = sortedByPopularity[0];
    return mapMovie(movie);
  }
}
