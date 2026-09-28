import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

        return {
          data: {
            pokemon: pokemonResult.data,
            species: speciesResult.data,
            evolutionChain: evolutionChainResult.data,
          },
        };
      },
    }),
  }),
});

export const { useGetPokemonQuery, useGetPokemonByIdQuery } = pokemonApi;
