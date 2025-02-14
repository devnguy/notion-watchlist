import { type UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints.js";
import {
  type Movie,
  type NotionServiceModule,
  type UpdateMoviePayload,
} from "./types.js";
import { Client } from "@notionhq/client";

export class NotionService implements NotionServiceModule {
  private client: Client;
  private databaseId: string;

  constructor(config: { client: Client; databaseId: string }) {
    this.client = config.client;
    this.databaseId = config.databaseId;
  }

  async getPageToUpdate(): Promise<{
    id: string | null;
    title: string | null;
  }> {
    const response = await this.client.databases.query({
      database_id: this.databaseId,
      // TODO: in addition to title, might want to look for a row that was
      // recently added
      filter: {
        title: {
          contains: ";",
        },
        property: "Title",
        type: "title",
      },
    });

    if (response.results.length === 0) {
      return {
        id: null,
        title: null,
      };
    }

    const result = response.results[0];

    if (result === undefined) {
      return {
        id: null,
        title: null,
      };
    }

    if ("properties" in result) {
      if (result.properties.Title && "title" in result.properties.Title) {
        return {
          id: result.id,
          title:
            Array.isArray(result.properties.Title.title) &&
            result.properties.Title.title[0]
              ? result.properties.Title.title[0].plain_text.replace(";", "")
              : null,
        };
      }
    }
    return {
      id: result.id,
      title: null,
    };
  }

  async updateMoviePage(
    input: UpdateMoviePayload,
  ): Promise<UpdatePageResponse> {
    if (input.movie.id !== null) {
      const movie = input.movie as Movie;

      const updateResponse = this.client.pages.update({
        page_id: input.id,
        cover: {
          external: {
            url: movie.backdrop_path,
          },
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: movie.title,
                },
              },
            ],
          },
          Genres: {
            multi_select: movie.genres.map(genre => {
              return {
                name: genre,
              };
            }),
          },
          Overview: {
            rich_text: [
              {
                text: {
                  content: movie.overview,
                },
              },
            ],
          },
          "Release Date": {
            date: {
              start: movie.release_date,
            },
          },
          Reviews: {
            number: movie.reviews,
          },
        },
      });

      return updateResponse;
    }

    const updateWithNotFoundResponse = this.client.pages.update({
      page_id: input.id,
      properties: {
        Title: {
          title: [
            {
              text: {
                content: `${input.movie.title} | Movie not found`,
              },
            },
          ],
        },
      },
    });

    return updateWithNotFoundResponse;
  }
}

/*
poll notion
  query notion movie db where title contains ";"
    movieTitle = get movie title property from page
    call update(movieTitle)

update
  movie = movieService.searchMovies(movieTitle)
  notionService.updateMoviePage(movie)

  movieToInput(movie: Movie) {
    return {
      Title: {
        title: [
          {
            type: "text",
            text: {
              content: movie.title,
            },
          },
        ],
      },
      Genres: {
        multi_select: movie.genres.map(genre => {
          return {
            name: genre,
          };
        }),
      },
      Overview: {
        rich_text: [
          {
            type: "text",
            text: {
              content: movie.overview,
            },
          },
        ],
      },
      "Release Date": {
        date: {
          start: movie.release_date,
        },
      },
      Reviews: {
        number: movie.reviews,
      },
      Watched: {
        checkbox: false,
      },
    };
  }
*/
