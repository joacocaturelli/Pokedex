import { useParams } from "react-router";
import { useGetPokemonByIdQuery } from "../../pokemonApi";

function PokemonDetails() {
  const {id} = useParams()

  const { data, isLoading, error } = useGetPokemonByIdQuery(id)

  if(isLoading) {
    return <p>Cargando pokémon...</p>
  }

  if(error) {
    return <p>Ha ocurrido un error</p>
  }

  const description = data.species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  )?.flavor_text

  return (
    <section>
      <h2>{data.pokemon.name}</h2>

      <p>{description}</p>
    </section>
  )
}

export default PokemonDetails