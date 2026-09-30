import pokemonLogo from '../../assets/img/Pokemon_logo.svg.png'
import styles from './Header.module.css'

function Header() {
  return (
    <header>
      <img 
        src={pokemonLogo} 
        alt="Logo Pokémon"
        className={styles.pokelogo}
      />
    </header>
  )
}

export default Header