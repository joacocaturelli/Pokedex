import { Link } from "react-router";
import styles from './EvolutionChain.module.css'

function formatCondition(condition) {
  switch (condition.type) {
    case "level":
      return `Level ${condition.value}`;

    case "happiness":
      return `Happiness ${condition.value}`;

    case "affection":
      return `Affection ${condition.value}`;

    case "time":
      return condition.value === "day" ? "Day" : "Night";

    case "move-type":
      return `${capitalize(condition.value)}-type move`;

    case "trade":
      return "Trade";

    default:
      return condition.value;
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function EvolutionMethod({ method }) {
  if(!method) {
    return null
  }

  if(method.type === 'item' || method.type === 'held_item') {
    return (
      <div className={styles.method}>
        {method.item.image && (
          <img
            className={styles.itemImage} 
            src={method.item.image} 
            alt={method.item.name} 
          />
        )}

        <span>{method.item.name}</span>
      </div>
    )
  }

  if(method.type === 'conditions') {
    return(
      <div className={styles.method}>
        {method.conditions.map((condition, index) => (
          <span key={`${condition.type}-${index}`}>
            {formatCondition(condition)}
          </span>
        ))}
      </div>
    )
  }

  return null
}

function EvolutionPokemon ({ pokemon }) {
  return(
    <Link
      to={`/pokemon/${pokemon.id}`}
      className={styles.pokemon}
    >
      <img
        src={pokemon.image} 
        alt={pokemon.name}
        className={styles.pokemonImage} 
      />

      <span className={styles.pokemonName}> 
        {pokemon.name}
      </span>

      <span className={styles.pokemonId}> 
        #{pokemon.id} 
      </span>
    </Link>
  )
}

function EvolutionNode({ pokemon }) {
  return (
    <div className={styles.node}>
      <EvolutionPokemon pokemon={pokemon} />

      {pokemon.evolvesTo.map((evolution) => (
        <div 
          key={evolution.id}
          className={styles.evolution}
        >
          <div className={styles.arrow}>
            →
          </div>

          <EvolutionMethod method={evolution.evolutionMethod} />

          <EvolutionNode pokemon={evolution} />
        </div>
      ))}
    </div>
  );
}

function EvolutionChain({ evolutionChain }) {
  return(
    <section className={styles.container}>
      <h2>Evolution Chain</h2>

      <div className={styles.chain}>
        <EvolutionNode pokemon={evolutionChain}/>
      </div>
    </section>
  )
}

export default EvolutionChain