import { useEffect, useMemo, useState } from "react";
import {
  useGetPokemonByTypeQuery,
  useGetPokemonListQuery,
  useGetPokemonPageQuery,
} from "../../pokemonApi";
import PokemonCard from "../PokemonCard/PokemonCard";
import styles from "./PokemonGrid.module.css";

const POKEMON_PER_PAGE = 10;

const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const GENERATIONS = [
  { value: "1", label: "Generación I" },
  { value: "2", label: "Generación II" },
  { value: "3", label: "Generación III" },
  { value: "4", label: "Generación IV" },
  { value: "5", label: "Generación V" },
  { value: "6", label: "Generación VI" },
  { value: "7", label: "Generación VII" },
  { value: "8", label: "Generación VIII" },
  { value: "9", label: "Generación IX" },
];

function getGenerationFromId(id) {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;

  return 9;
}

function PokemonGrid() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [page, setPage] = useState(0);

  /*
   * Lista básica de todos los Pokémon.
   *
   * Se solicita una sola vez y RTK Query la mantiene en caché.
   */
  const {
    data: pokemonList = [],
    isLoading: isLoadingList,
    error: listError,
  } = useGetPokemonListQuery();

  /*
   * Solamente hacemos esta petición cuando hay un tipo seleccionado.
   */
  const {
    data: typePokemonIds = [],
    isLoading: isLoadingType,
    error: typeError,
  } = useGetPokemonByTypeQuery(selectedType, {
    skip: !selectedType,
  });

  /*
   * IDs que pertenecen al tipo seleccionado.
   *
   * Set permite hacer búsquedas O(1).
   */
  const typePokemonIdSet = useMemo(
    () => new Set(typePokemonIds),
    [typePokemonIds],
  );

  /*
   * Aplicamos todos los filtros sobre la lista local.
   *
   * Orden:
   * 1. búsqueda
   * 2. tipo
   * 3. generación
   */
  const filteredPokemon = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return pokemonList.filter((pokemon) => {
      const matchesSearch =
        normalizedSearch === "" ||
        pokemon.name.includes(normalizedSearch) ||
        pokemon.id.toString() === normalizedSearch;

      const matchesType =
        !selectedType || typePokemonIdSet.has(pokemon.id);

      const matchesGeneration =
        !selectedGeneration ||
        getGenerationFromId(pokemon.id) ===
          Number(selectedGeneration);

      return (
        matchesSearch &&
        matchesType &&
        matchesGeneration
      );
    });
  }, [
    pokemonList,
    search,
    selectedType,
    selectedGeneration,
    typePokemonIdSet,
  ]);

  const totalPokemon = filteredPokemon.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalPokemon / POKEMON_PER_PAGE),
  );

  /*
   * Evita que la página actual quede fuera de rango cuando
   * un filtro reduce la cantidad de resultados.
   */
  useEffect(() => {
    if (page >= totalPages) {
      setPage(0);
    }
  }, [page, totalPages]);

  /*
   * IDs correspondientes a los 10 Pokémon visibles.
   */
  const currentPokemonIds = useMemo(() => {
    const start = page * POKEMON_PER_PAGE;

    return filteredPokemon
      .slice(start, start + POKEMON_PER_PAGE)
      .map((pokemon) => pokemon.id);
  }, [filteredPokemon, page]);

  /*
   * Descarga solamente los detalles de los 10 Pokémon actuales.
   */
  const {
    data: pokemon = [],
    isLoading: isLoadingPage,
    error: pageError,
  } = useGetPokemonPageQuery(currentPokemonIds, {
    skip: currentPokemonIds.length === 0,
  });

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(0);
  }

  function handleTypeChange(event) {
    setSelectedType(event.target.value);
    setPage(0);
  }

  function handleGenerationChange(event) {
    setSelectedGeneration(event.target.value);
    setPage(0);
  }

  /*
   * Navegación circular:
   *
   * página 1 + anterior -> última página
   * última página + siguiente -> página 1
   */
  function handlePrevious() {
    if (totalPages <= 1) return;

    setPage((currentPage) =>
      currentPage === 0
        ? totalPages - 1
        : currentPage - 1,
    );
  }

  function handleNext() {
    if (totalPages <= 1) return;

    setPage((currentPage) =>
      currentPage === totalPages - 1
        ? 0
        : currentPage + 1,
    );
  }

  const isLoading =
    isLoadingList ||
    isLoadingType ||
    isLoadingPage;

  const error =
    listError ||
    typeError ||
    pageError;

  if (isLoadingList) {
    return <p>Cargando pokemon...</p>;
  }

  if (listError) {
    return <p>Ha ocurrido un error.</p>;
  }

  return (
    <section className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <label
            htmlFor="pokemon-search"
            className={styles.label}
          >
            Buscar Pokémon
          </label>

          <input
            id="pokemon-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Nombre o número..."
            className={styles.search}
          />
        </div>

        <div className={styles.filterWrapper}>
          <label
            htmlFor="pokemon-type"
            className={styles.label}
          >
            Tipo
          </label>

          <select
            id="pokemon-type"
            value={selectedType}
            onChange={handleTypeChange}
            className={styles.select}
          >
            <option value="">Todos los tipos</option>

            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterWrapper}>
          <label
            htmlFor="pokemon-generation"
            className={styles.label}
          >
            Generación
          </label>

          <select
            id="pokemon-generation"
            value={selectedGeneration}
            onChange={handleGenerationChange}
            className={styles.select}
          >
            <option value="">Todas las generaciones</option>

            {GENERATIONS.map((generation) => (
              <option
                key={generation.value}
                value={generation.value}
              >
                {generation.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.results}>
        {totalPokemon === 0 ? (
          <p>No se encontraron Pokémon.</p>
        ) : (
          <p>
            {totalPokemon}{" "}
            {totalPokemon === 1 ? "resultado" : "resultados"}
          </p>
        )}
      </div>

      <nav
        className={styles.pagination}
        aria-label="Navegación de Pokémon"
      >
        <button
          type="button"
          onClick={handlePrevious}
          disabled={totalPages <= 1}
          className={styles.paginationButton}
        >
          ← Anteriores 10
        </button>

        <span className={styles.pageInfo}>
          Página {totalPokemon === 0 ? 0 : page + 1} de{" "}
          {totalPokemon === 0 ? 0 : totalPages}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={totalPages <= 1}
          className={styles.paginationButton}
        >
          Siguientes 10 →
        </button>
      </nav>

      {error && !isLoading && (
        <p>Ha ocurrido un error al cargar los Pokémon.</p>
      )}

      {!error && totalPokemon > 0 && (
        <div className={styles.grid}>
          {pokemon.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PokemonGrid;