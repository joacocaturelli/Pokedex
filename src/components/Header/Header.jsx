import pokemonLogo from '../../assets/img/Pokemon_logo.svg.png'
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.pokeball} aria-hidden="true" />
        <img
          src={pokemonLogo}
          alt="Pokémon"
          className={styles.pokelogo}
        />
        <span className={styles.subtitle}>Pokédex</span>
      </div>
    </header>
  )
}

export default Header
