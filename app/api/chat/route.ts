import {
  MOVIE_RECOMMENDATION_CHATBOT_FEW_SHOT_PROMPT,
  MOVIE_RECOMMENDATION_CHATBOT_INSTRUCTION,
  MOVIE_RECOMMENDATION_CHATBOT_PARAMS,
  MOVIE_RECOMMENDATION_CHATBOT_SYSTEM_PROMPT,
  USER_EMAIL,
} from "@/config/config";
import { PeakaService } from "@/service/peaka.service";
import { Film, SearchCriteria } from "@/types/types";
import { openai } from "@ai-sdk/openai";
import { ChatOpenAI } from "@langchain/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const request = await req.json();

  if (!request.prompt) return new Response("Missing query", { status: 400 });

  const prompt = request.prompt;
  const peakaService = PeakaService.instance;

  const promises = [];

  promises.push(peakaService.getRentedMoviesOfUser(USER_EMAIL));

  promises.push(
    peakaService.getMovieRecommendationFromVectorDatabase(prompt, 20)
  );

  const structuredRecommendationPrompt =
    MOVIE_RECOMMENDATION_CHATBOT_INSTRUCTION +
    "Return you response in the following format: " +
    MOVIE_RECOMMENDATION_CHATBOT_FEW_SHOT_PROMPT +
    "query: " +
    prompt +
    "response:";

  const llm = new ChatOpenAI(MOVIE_RECOMMENDATION_CHATBOT_PARAMS);
  promises.push(llm.predict(structuredRecommendationPrompt));

  let [rentedFilms, recommendedFilms, llmResponse] = await Promise.all(
    promises
  );

  const rentedFilmIds = (rentedFilms as Film[]).map((film) => film.filmId);

  // Filter already rented films from recommended films
  recommendedFilms = (recommendedFilms as Film[]).filter(
    (film) => !rentedFilmIds.includes(film.filmId)
  );

  try {
    let resp = (llmResponse as string).replace("response:", "");
    resp = resp.replaceAll("```json", "");
    resp = resp.replaceAll("```", "");

    const criteria: SearchCriteria = JSON.parse(resp);
    // Filter correct rating
    recommendedFilms = recommendedFilms.filter(
      (film) => film.rating === criteria.rating
    );
  } catch (e) {
    console.log("Could not parse llm response skipping extra filter", e);
  }

  console.log(
    MOVIE_RECOMMENDATION_CHATBOT_SYSTEM_PROMPT({
      recommendedFilms: JSON.stringify(recommendedFilms),
      rentedFilms: JSON.stringify(rentedFilms),
    })
  );

  const result = await streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: MOVIE_RECOMMENDATION_CHATBOT_SYSTEM_PROMPT({
          recommendedFilms: JSON.stringify(recommendedFilms),
          rentedFilms: JSON.stringify(rentedFilms),
        }),
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return result.toTextStreamResponse();
}
