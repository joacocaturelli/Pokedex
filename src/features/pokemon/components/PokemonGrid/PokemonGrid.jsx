import { useGetPokemonQuery } from '../../pokemonApi'
import PokemonCard from '../PokemonCard/PokemonCard'
import styles from './PokemonGrid.module.css'

function PokemonGrid() {
  const { data, isLoading, error } = useGetPokemonQuery()

  if (isLoading) {
    return <p>Cargando pokemon...</p>
  }

  if (error) {
    return <p>Ha ocurrido un error.</p>
  }

  return (
    <section>

      <div className={styles.grid}>
        {data.map((pokemon) => (
          <PokemonCard 
            key={pokemon.id}
            pokemon={pokemon}
          />
        ))}
      </div>

    </section>
  )
}

export default PokemonGrid