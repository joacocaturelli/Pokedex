import { Link } from 'react-router'
import styles from './PokemonCard.module.css'

function PokemonCard({ pokemon }) {
  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      className={styles.card}
    >
      <span className={styles.number}>
        #{String(pokemon.id).padStart(3, '0')}
      </span>

      <div className={styles.imageWrapper}>
        <img
          className={styles.image}
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          loading="lazy"
        />
      </div>

      <h2 className={styles.name}>{pokemon.name}</h2>

      <div className={styles.types}>
        {pokemon.types.map((type) => (
          <span
            className={`${styles.type} ${styles[type.type.name] || ''}`}
            key={type.slot}
          >
            {type.type.name}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default PokemonCard
