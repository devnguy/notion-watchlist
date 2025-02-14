type Configuration = {
  movieService: {
    apiKey: string;
    url: string;
    accessToken: string;
  };
  notionService: {
    apiKey: string;
    url: string;
    databaseId: string;
  };
};

export const configurationLoader = (): Configuration => {
  return {
    movieService: {
      apiKey: process.env.TMDB_API_KEY ?? "123",
      url: process.env.TMDB_URL ?? "http://localhost:9002",
      accessToken: process.env.TMDB_ACCESS_TOKEN ?? "123",
    },
    notionService: {
      apiKey: process.env.NOTION_API_KEY ?? "123",
      url: process.env.NOTION_SERVICE_URL ?? "http://localhost:9003",
      databaseId: process.env.NOTION_DATABASE_ID ?? "123",
    },
  };
};
