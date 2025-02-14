import express, { Express } from "express";
import Path from "path";
import { configurationLoader } from "./configuration";
import { MovieService } from "./services/MovieService";
import { NotionService } from "./services/NotionService";
import { middleware } from "./middleware/middleware";
import { Client } from "@notionhq/client";

export default async function appFactory() {
  const app = express();
  app.use(express.static("public"));
  app.use(express.json());

  const configuration = await configurationLoader();
  const movieService = new MovieService(configuration.movieService);
  const notionClient = new Client({ auth: configuration.notionService.apiKey });
  const notionService = new NotionService({
    client: notionClient,
    databaseId: configuration.notionService.databaseId,
  });

  // Send error responses as json
  app.use((err: Error, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: err.message });
  });

  app.get("/", middleware);

  app.get("/search", async (req, res) => {
    const title = req.query.title as string;
    const movie = await movieService.searchMovies(title);
    res.send(movie);
  });

  app.get("/update", async (req, res, next) => {
    try {
      const page = await notionService.getPageToUpdate();

      if (page.title === null) {
        res.send({ result: "No page to update" });
        return;
      }

      const movieDetails = await movieService.searchMovies(page.title);

      if (movieDetails === null) {
        res.send({ result: "No movie found" });
        return;
      }

      const updateResponse = await notionService.updateMoviePage({
        id: page.id,
        movie: movieDetails,
      });

      res.send(updateResponse);
    } catch (error) {
      next(error);
    }
  });

  return {
    expressApp: app,
    shutdown: async () => {
      console.log("Shutting down...");
    },
  };
}
