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
      async queryFn(
        _arg, // argumento → no lo usamos
        _queryApi, // herramientas de RTK Query → no las usamos
        _extraOptions, // opciones adicionales → no las usamos
        fetchWithBQ, // función para hacer requests → SÍ la usamos
      ) {
        // Get de los 10 Pokemon
        const listResult = await fetchWithBQ("pokemon?limit=10&offset=0");

        if (listResult.error) {
          return { error: listResult.error };
        }

        // Data de los 10 pokemon
        const pokemonList = listResult.data.results;

        // Get de los detalles de cada pokemon
        const pokemonDetails = await Promise.all(
          pokemonList.map((pokemon) => fetchWithBQ(pokemon.url)),
        );

        // Buscamos si algun get dio error
        const failedRequest = pokemonDetails.find((result) => result.error);

        if (failedRequest) {
          return { error: failedRequest.error };
        }

        // Devolvemos la data de todos los pokemon como un array
        return {
          data: pokemonDetails.map((result) => result.data),
        };
      },
    }),

    getPokemonById: builder.query({
      async queryFn(id, _queryApi, _extraOptions, fetchWithBQ) {
        // Obtener datos del pokemon
        const pokemonResult = await fetchWithBQ(`pokemon/${id}`);

        if (pokemonResult.error) {
          return { error: pokemonResult.error };
        }

        // Obtener datos de la especie
        const speciesResult = await fetchWithBQ(`pokemon-species/${id}`);

        if (speciesResult.error) {
          return { error: speciesResult.error };
        }

        // Obtener la cadena evolutiva
        const evolutionChainResult = await fetchWithBQ(speciesResult.data.evolution_chain.url);

        if (evolutionChainResult.error) {
          return { error: evolutionChainResult.error };
        }

        // Obtener los ids de toda la cadena evolutiva
        const evolutionPokemonIds = getEvolutionPokemonIds(evolutionChainResult.data.chain);

        // Hacer la peticion a la API para traer los datos de cada pokemon de la cadena
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

        // Obtener las URLs de los objetos necesarios para las evoluciones
        const itemsUrls = getEvolutionItemUrls(evolutionChainResult.data.chain);

        // Obtener los datos de esos objetos
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

        return {
          data: {
            pokemon: pokemonResult.data,
            species: speciesResult.data,
            evolutionChain: evolutionChainResult.data,
            evolutionData,
            items,
          },
        };
      },
    }),
  }),
});

export const { useGetPokemonQuery, useGetPokemonByIdQuery } = pokemonApi;
