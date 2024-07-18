import _ from "lodash";

export const MOVIE_RECOMMENDATION_CHATBOT_INSTRUCTION = `You are a helpful film recommendation chatbot who can extract search criteria from a given sentence from the user.
This search criteria will be used to fetch relevant film recommendations from a database. Your response must only include json. Do not put any invalid json

Films can be searched based on the following criteria:
- Ratings given by the users. It is a decimal number between 1 and 5. The database column for this criteria is rental_rate
- Length of the film in minutes. The database column for this criteria is length.
- Language of the film. The database column for this criteria is language_id. For English return language_id as 1, for Italian return language_id as 2, for Japanese return language_id is 3, for Mandarin language_id return as 4, for French return language_id as 5, for German return language_id is 6
- Ratings classified by the Motion Picture Association of America (MPAA). These ratings are G,PG,PG-13,R,NC-17. The database column for this criteria is rating.
`;

export const MOVIE_RECOMMENDATION_CHATBOT_FEW_SHOT_PROMPT = `query: I want to watch a popular short movie with my children tonight.
response: {"rental_rate":"4.0", "length":60,"language_id":1,"rating":"G"}
`;

export const MOVIE_RECOMMENDATION_CHATBOT_SYSTEM_PROMPT =
  _.template(`You are a helpful film recommendation chatbot. I will provide you the list of films rented by the user Mary Smith and
a list of films recommended by a recommendation engine. I want you choose a film from the list of recommended films that the user has not rented yet. And try to explain the film
to the user. These are the list of films that the user has rented:
<%= rentedFilms %>
These are the list of films recommended by the recommendation engine:
<%= recommendedFilms %>
Only choose a film from the list of recommended films that the user has not rented yet. And try to explain the film to the user. Also try to choose from the top of the list. The recommended film list 
ordered by relevancy.
`);

export const MOVIE_RECOMMENDATION_CHATBOT_PARAMS = {
  temperature: 0,
  modelName: "gpt-4o",
  max_tokens: 2000,
};

export const GET_RENTED_MOVIES_OF_USER_SQL_TEMPLATE = _.template(
  `SELECT DISTINCT(f."film_id"), f."title",f."description", f."language_id",f."rental_duration", f."rental_rate", f."length", f."rating", 
  c."name" AS category_name
  FROM "postgresql"."public"."customer" cu
  JOIN "postgresql"."public"."rental" r ON cu."customer_id" = r."customer_id"
  JOIN "postgresql"."public"."inventory" i ON r."inventory_id" = i."inventory_id"
  JOIN "postgresql"."public"."film" f ON i."film_id" = f."film_id"
  JOIN "postgresql"."public"."film_category" fc ON f."film_id" = fc."film_id"
  JOIN "postgresql"."public"."category" c ON fc."category_id" = c."category_id"
  WHERE cu."email" = '<%= email %>'`
);

export const VECTOR_RECOMMENDED_MOVIES_SQL_TEMPLATE =
  _.template(`WITH vector_query AS (
    SELECT CAST(JSON_EXTRACT(metadata, '$.filmId') AS INT) AS film_id FROM "upstash_vector"."main"."default" 
    WHERE "_q_search" ='query_data(data="<%= query %>"; topK=<%= topK %>;)'
  )

  SELECT * FROM "vector_query" AS vq, "postgresql"."public"."film" AS f WHERE f.film_id = vq.film_id
`);

export const USER_EMAIL = "mary.smith@sakilacustomer.org";
