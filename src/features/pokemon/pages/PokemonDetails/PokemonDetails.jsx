import { useState } from "react";
import { useParams } from "react-router";
import { useGetPokemonByIdQuery } from "../../pokemonApi";
import EvolutionChain from "../../components/EvolutionChain/EvolutionChain";
import PokemonNavigation from "../../components/PokemonNavigation/PokemonNavigation";
import styles from "./PokemonDetails.module.css";

function PokemonDetails() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetPokemonByIdQuery(id);

  const [showShiny, setShowShiny] = useState(false);

  if (isLoading) {
    return <p>Cargando pokémon...</p>;
  }

  if (error) {
    return <p>Ha ocurrido un error</p>;
  }

  const pokemon = data.pokemon;
  const species = data.species;

  const description = species.flavor_text_entries.find(
    (entry) => entry.language.name === "en"
  )?.flavor_text.replace(/\f|\n/g, " ");

  const generation = species.generation.name
    .replace("generation-", "")
    .toUpperCase();

  const height = pokemon.height / 10;
  const weight = pokemon.weight / 10;

  const statNames = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };

  return (
    <section className={styles.pokemonDetails}>

      <PokemonNavigation pokemonId={pokemon.id} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.imageContainer}>
          <img
            src={
              showShiny
                ? pokemon.sprites.other["official-artwork"].front_shiny
                : pokemon.sprites.other["official-artwork"].front_default
            }
            alt={pokemon.name}
          />

          <button
            className={styles.shinyToggle}
            onClick={() => setShowShiny((value) => !value)}
          >
            {showShiny ? "Normal" : "Shiny"}
          </button>
        </div>

        <div className={styles.heroInfo}>
          <h1>{pokemon.name}</h1>

          <p className={styles.generation}>
            Generation {generation}
          </p>

          <div className={styles.types}>
            {pokemon.types.map(({ type }) => (
              <span
                key={type.name}
                className={`${styles.type} ${styles[type.name]}`}
              >
                {type.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Information */}
      <section className={styles.info}>

        {/* Description */}
        <div className={styles.description}>
          <h2>Description</h2>
          <p>{description}</p>
        </div>

        {/* Abilities + Stats */}
        <div className={styles.detailsGrid}>

          {/* Abilities */}
          <div className={styles.abilities}>
            <h2>Abilities</h2>

            {data.abilities.map((ability) => (
              <div
                key={ability.name}
                className={styles.ability}
              >
                <span>
                  {ability.is_hidden
                    ? "Hidden Ability"
                    : "Ability"}
                </span>

                <strong>{ability.name}</strong>

                <p>{ability.description}</p>
              </div>
            ))}

            {/* Height / Weight */}
            <div className={styles.measurements}>
              <div>
                <span>Height</span>
                <strong>{height} m</strong>
              </div>

              <div>
                <span>Weight</span>
                <strong>{weight} kg</strong>
              </div>
            </div>
          </div>

          {/* Base Stats */}
          <div className={styles.stats}>
            <h2>Base Stats</h2>

            <div className={styles.statsList}>
              {pokemon.stats.map(({ base_stat, stat }) => (
                <div
                  className={styles.stat}
                  key={stat.name}
                >
                  <div className={styles.statHeader}>
                    <span>{statNames[stat.name]}</span>
                    <strong>{base_stat}</strong>
                  </div>

                  <div className={styles.statBar}>
                    <div
                      className={styles.statBarFill}
                      style={{
                        width: `${(base_stat / 255) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Evolution Chain */}
      <section className={styles.evolution}>
        <h2>Evolution Chain</h2>

        <EvolutionChain
          evolutionChain={data.evolutionData}
          showShiny={showShiny}
        />
      </section>

    </section>
  );
}

export default PokemonDetails;