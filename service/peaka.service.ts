import {
  GET_RENTED_MOVIES_OF_USER_SQL_TEMPLATE,
  VECTOR_RECOMMENDED_MOVIES_SQL_TEMPLATE,
} from "@/config/config";
import { Film } from "@/types/types";
import { connectToPeaka, Peaka, QueryData } from "@peaka/client";

export class PeakaService {
  private connection: Peaka;

  private constructor() {
    this.connection = connectToPeaka(process.env.PEAKA_API_KEY ?? "");
  }

  static #instance: PeakaService;

  public static get instance(): PeakaService {
    if (!PeakaService.#instance) {
      PeakaService.#instance = new PeakaService();
    }

    return PeakaService.#instance;
  }

  public async getRentedMoviesOfUser(email: string): Promise<Film[]> {
    const iter = await this.connection.query(
      GET_RENTED_MOVIES_OF_USER_SQL_TEMPLATE({ email })
    );

    const data: QueryData[] = await iter
      .map((r) => r.data ?? [])
      .fold<QueryData[]>([], (row, acc) => [...acc, ...row]);

    const rentedFilms: Film[] = [];

    for (const queryData of data) {
      const film: Film = {
        filmId: queryData[0],
        filmTitle: queryData[1],
        filmDescription: queryData[2],
        languageId: queryData[3],
        rentalDuration: queryData[4],
        rentalRate: queryData[5],
        length: queryData[6],
        rating: queryData[7],
        filmCategory: queryData[8],
      };
      rentedFilms.push(film);
    }

    return rentedFilms;
  }

  public async getAllMovies() {
    const iter = await this.connection.query(
      `SELECT * FROM "postgresql"."public"."film"`
    );

    const data: QueryData[] = await iter
      .map((r) => r.data ?? [])
      .fold<QueryData[]>([], (row, acc) => [...acc, ...row]);

    return data;
  }

  public async getMovieRecommendationFromVectorDatabase(
    query: string,
    topK: number
  ) {
    const iter = await this.connection.query(
      VECTOR_RECOMMENDED_MOVIES_SQL_TEMPLATE({ query, topK }).trim()
    );

    const data: QueryData[] = await iter
      .map((r) => r.data ?? [])
      .fold<QueryData[]>([], (row, acc) => [...acc, ...row]);

    const recommendedFilms: Film[] = [];

    for (const queryData of data) {
      const film: Film = {
        filmId: queryData[1],
        filmTitle: queryData[2],
        filmDescription: queryData[3],
        languageId: queryData[4],
        rentalDuration: queryData[5],
        rentalRate: queryData[6],
        length: queryData[7],
        rating: queryData[9],
        filmCategory: undefined,
      };
      recommendedFilms.push(film);
    }

    return recommendedFilms;
  }
}
