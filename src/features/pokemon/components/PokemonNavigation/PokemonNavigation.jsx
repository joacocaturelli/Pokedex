import { Link } from "react-router";
import styles from "./PokemonNavigation.module.css";

const TOTAL_POKEMON = 1025;

function PokemonNavigation({ pokemonId }) {
  const previousId =
    pokemonId === 1 ? TOTAL_POKEMON : pokemonId - 1;

  const nextId =
    pokemonId === TOTAL_POKEMON ? 1 : pokemonId + 1;

  return (
    <nav className={styles.navigation} aria-label="Pokémon navigation">

      <Link
        to="/"
        className={styles.back}
      >
        ← Back to Pokédex
      </Link>

      <div className={styles.pokemonNavigation}>
        <Link
          to={`/pokemon/${previousId}`}
          className={styles.previous}
          aria-label={`Previous Pokémon: #${previousId}`}
        >
          ← Previous
        </Link>

        <span className={styles.current}>
          #{pokemonId}
        </span>

        <Link
          to={`/pokemon/${nextId}`}
          className={styles.next}
          aria-label={`Next Pokémon: #${nextId}`}
        >
          Next →
        </Link>
      </div>

    </nav>
  );
}

export default PokemonNavigation;