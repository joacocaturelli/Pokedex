import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getEvolutionItemUrls, getEvolutionData } from "./utils/evolutionUtils";

function getEvolutionPokemonIds(node) {
  const ids = [node.species.url.split("/").at(-2)];

  node.evolves_to.forEach((evolution) => {
    ids.push(...getEvolutionPokemonIds(evolution));
  });

  return ids;
}

function getPokemonIdFromUrl(url) {
  return Number(url.split("/").at(-2));
}

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://pokeapi.co/api/v2/",
  }),

  endpoints: (builder) => ({
    /*
     * Lista básica de todos los Pokémon.
     *
     * Solamente necesitamos id + name para realizar:
     * - búsqueda
     * - filtro por generación
     * - paginación
     *
     * RTK Query cachea este resultado, por lo que no se vuelve
     * a solicitar cada vez que cambia un filtro.
     */
    getPokemonList: builder.query({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ("pokemon?limit=1025&offset=0");

        if (result.error) {
          return { error: result.error };
        }

        const pokemon = result.data.results.map((item) => ({
          id: getPokemonIdFromUrl(item.url),
          name: item.name,
        }));

        return {
          data: pokemon,
        };
      },

      keepUnusedDataFor: 3600,
    }),

    /*
     * Devuelve los Pokémon pertenecientes al tipo seleccionado.
     *
     * Ejemplo:
     * type = "fire"
     *
     * No descargamos los detalles completos aquí.
     * Solamente necesitamos sus IDs para aplicar el filtro.
     */
    getPokemonByType: builder.query({
      async queryFn(type, _queryApi, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ(`type/${type}`);

        if (result.error) {
          return { error: result.error };
        }

        const ids = result.data.pokemon.map(({ pokemon }) => getPokemonIdFromUrl(pokemon.url));

        return {
          data: ids,
        };
      },

      keepUnusedDataFor: 3600,
    }),

    /*
     * Obtiene los detalles completos solamente de los Pokémon
     * que actualmente se muestran en la página.
     */
    getPokemonPage: builder.query({
      async queryFn(ids, _queryApi, _extraOptions, fetchWithBQ) {
        if (!ids?.length) {
          return { data: [] };
        }

        const pokemonResults = await Promise.all(ids.map((id) => fetchWithBQ(`pokemon/${id}`)));

        const failedRequest = pokemonResults.find((result) => result.error);

        if (failedRequest) {
          return { error: failedRequest.error };
        }

        return {
          data: pokemonResults.map((result) => result.data).sort((a, b) => a.id - b.id),
        };
      },

      keepUnusedDataFor: 300,
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

export const {
  useGetPokemonListQuery,
  useGetPokemonByTypeQuery,
  useGetPokemonPageQuery,
  useGetPokemonByIdQuery,
} = pokemonApi;
