import { useParams } from "react-router";
import { useGetPokemonByIdQuery } from "../../pokemonApi";
import { getEvolutionData } from "../../utils/evolutionUtils";
import EvolutionChain from "../../components/EvolutionChain/EvolutionChain";

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

  const evolutionChain = getEvolutionData(
    data.evolutionChain.chain,
    data.items
  )

  return (
    <section>
      <h2>{data.pokemon.name}</h2>

      <p>{description}</p>

      <EvolutionChain 
        evolutionChain={evolutionChain}
      />
    </section>
  )
}

export default PokemonDetails