import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getEvolutionItemUrls, getEvolutionData } from "./utils/evolutionUtils";

function getEvolutionPokemonIds(node) {
  const ids = [node.species.url.split("/").at(-2)];

  node.evolves_to.forEach((evolution) => {
    ids.push(...getEvolutionPokemonIds(evolution));
  });

  return ids;
}

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://pokeapi.co/api/v2/",
  }),

  endpoints: (builder) => ({
    getPokemon: builder.query({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const listResult = await fetchWithBQ("pokemon?limit=10&offset=0");

        if (listResult.error) {
          return { error: listResult.error };
        }

        const pokemonList = listResult.data.results;

        const pokemonDetails = await Promise.all(
          pokemonList.map((pokemon) => fetchWithBQ(pokemon.url)),
        );

        const failedRequest = pokemonDetails.find((result) => result.error);

        if (failedRequest) {
          return { error: failedRequest.error };
        }

        return {
          data: pokemonDetails.map((result) => result.data),
        };
      },
    }),

    getPokemonById: builder.query({
      async queryFn(id, _queryApi, _extraOptions, fetchWithBQ) {
        const pokemonResult = await fetchWithBQ(`pokemon/${id}`);

        if (pokemonResult.error) {
          return { error: pokemonResult.error };
        }

        const speciesResult = await fetchWithBQ(`pokemon-species/${id}`);

        if (speciesResult.error) {
          return { error: speciesResult.error };
        }

        const evolutionChainResult = await fetchWithBQ(speciesResult.data.evolution_chain.url);

        if (evolutionChainResult.error) {
          return { error: evolutionChainResult.error };
        }

        const evolutionPokemonIds = getEvolutionPokemonIds(evolutionChainResult.data.chain);

        const evolutionPokemonResult = await Promise.all(
          evolutionPokemonIds.map((id) => fetchWithBQ(`pokemon/${id}`)),
        );

        const failedEvolutionPokemon = evolutionPokemonResult.find((result) => result.error);

        if (failedEvolutionPokemon) {
          return { error: failedEvolutionPokemon.error };
        }

        const evolutionPokemon = evolutionPokemonResult.reduce((acc, result) => {
          acc[result.data.id] = result.data;

          return acc;
        }, {});

        const itemsUrls = getEvolutionItemUrls(evolutionChainResult.data.chain);

        const itemResults = await Promise.all(itemsUrls.map((url) => fetchWithBQ(url)));

        const failedItemRequest = itemResults.find((result) => result.error);

        if (failedItemRequest) {
          return { error: failedItemRequest.error };
        }

        const items = itemResults.map((result, index) => ({
          ...result.data,
          url: itemsUrls[index],
        }));

        const evolutionData = getEvolutionData(
          evolutionChainResult.data.chain,
          items,
          evolutionPokemon,
        );

        // Obtener información completa de las habilidades
        const abilityResults = await Promise.all(
          pokemonResult.data.abilities.map(({ ability }) => fetchWithBQ(ability.url)),
        );

        const failedAbilityRequest = abilityResults.find((result) => result.error);

        if (failedAbilityRequest) {
          return { error: failedAbilityRequest.error };
        }

        const abilities = abilityResults.map((result, index) => {
          const ability = result.data;

          const effectEntry = ability.effect_entries.find((entry) => entry.language.name === "en");

          return {
            name: ability.name,
            description: effectEntry?.effect ?? "",
            is_hidden: pokemonResult.data.abilities[index].is_hidden,
          };
        });

        return {
          data: {
            pokemon: pokemonResult.data,
            species: speciesResult.data,
            evolutionChain: evolutionChainResult.data,
            evolutionData,
            items,
            abilities,
          },
        };
      },
    }),
  }),
});

export const { useGetPokemonQuery, useGetPokemonByIdQuery } = pokemonApi;
