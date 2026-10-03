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

function EvolutionPokemon ({ pokemon, showShiny }) {
  return(
    <Link
      to={`/pokemon/${pokemon.id}`}
      className={styles.pokemon}
    >
      <img
        src={showShiny ? pokemon.imageShiny : pokemon.image} 
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

function EvolutionArrow() {
  return (
    <img
      className={styles.arrow}
      src="/arrow.png"
      alt=""
      aria-hidden="true"
    />
  )
}

function EvolutionNode({ pokemon, showShiny }) {
  const evolutionCount = pokemon.evolvesTo.length

  if (evolutionCount === 0) {
    return <EvolutionPokemon pokemon={pokemon} showShiny={showShiny} />
  }

  const isBranching = evolutionCount > 1

  let layoutClass = styles.linear

  if (evolutionCount === 2) {
    layoutClass = styles.branches
  }

  if (evolutionCount >= 3) {
    layoutClass = styles.grid
  }

  return (
    <div className={styles.node}>
      <EvolutionPokemon pokemon={pokemon} showShiny={showShiny} />

      {isBranching ? (
        <div className={styles.branch}>
          {evolutionCount >= 3 && <EvolutionArrow />}

          <div className={`${styles.evolutions} ${layoutClass}`}>
            {pokemon.evolvesTo.map((evolution) => (
              <div
                key={evolution.id}
                className={styles.evolution}
              >
                {evolutionCount === 2 ? (
                  <div className={styles.branchTransition}>
                    <EvolutionArrow />

                    <EvolutionMethod
                      method={evolution.evolutionMethod}
                    />
                  </div>
                ) : null}

                <EvolutionNode pokemon={evolution} showShiny={showShiny} />

                {evolutionCount >= 3 && (
                  <EvolutionMethod
                    method={evolution.evolutionMethod}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.evolutions}>
          {pokemon.evolvesTo.map((evolution) => (
            <div
              key={evolution.id}
              className={styles.evolution}
            >
              <div className={styles.transition}>
                <EvolutionArrow />

                <EvolutionMethod
                  method={evolution.evolutionMethod}
                />
              </div>

              <EvolutionNode pokemon={evolution} showShiny={showShiny} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EvolutionChain({ evolutionChain, showShiny }) {
  return(
    <section className={styles.container}>
      <div className={styles.chain}>  
        <EvolutionNode pokemon={evolutionChain} showShiny={showShiny}/>
      </div>
    </section>
  )
}

export default EvolutionChain