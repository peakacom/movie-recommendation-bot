import { PeakaService } from "@/service/peaka.service";
import { UpstashService } from "@/service/upstash.service";
import { Film } from "@/types/types";
import _ from "lodash";

export async function GET() {
  const peakaService = PeakaService.instance;
  const upstashService = UpstashService.instance;

  const data = await peakaService.getAllMovies();

  const films: Film[] = [];
  for (const queryData of data) {
    const film: Film = {
      filmId: queryData[0],
      filmTitle: queryData[1],
      filmDescription: queryData[2],
      languageId: queryData[3],
      rentalDuration: queryData[4],
      rentalRate: queryData[5],
      length: queryData[6],
      rating: queryData[8],
    };
    films.push(film);
  }

  const promises = [];
  for (const film of films) {
    promises.push(
      upstashService.upsert(
        film.filmId,
        `${film.filmTitle}, ${film.filmDescription}`,
        _.omit(film, [
          "filmDescription",
          "languageId",
          "rentalDuration",
          "rentalRate",
          "length",
          "rating",
        ])
      )
    );
  }

  await Promise.all(promises);

  return Response.json({ succes: true });
}
