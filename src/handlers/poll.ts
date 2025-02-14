import { Client } from "@notionhq/client";
import { configurationLoader } from "../configuration";
import { MovieService } from "../services/MovieService";
import { NotionService } from "../services/NotionService";

const configuration = configurationLoader();
const movieService = new MovieService(configuration.movieService);
const notionClient = new Client({ auth: configuration.notionService.apiKey });
const notionService = new NotionService({
  client: notionClient,
  databaseId: configuration.notionService.databaseId,
});

export const wait = async (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const populate = async () => {
  try {
    const page = await notionService.getPageToUpdate();

    if (page.title === null) {
      console.log("No page to update");
      return;
    }

    const movieDetails = await movieService.searchMovies(page.title);

    if (movieDetails.id === null) {
      console.log("No movie found");
    }

    const updateResponse = await notionService.updateMoviePage({
      id: page.id,
      movie: movieDetails,
    });

    console.log("Updated page");
  } catch (error) {
    console.log(error);
  }
};
