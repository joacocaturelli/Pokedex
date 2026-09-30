function getpokemonId(url) {
  // Obtenemos el Id de la url
  // https://pokeapi.co/api/v2/pokemon-species/25/
  return url.split("/").at(-2);
}

function getEvolutionMethod(details, items) {
  const detail = details.find((evolutionDetail) => evolutionDetail.is_default) ?? details[0];

  if (!detail) {
    return null;
  }

  if (detail.item) {
    const item = items.find((item) => item.url === detail.item.url);

    return {
      type: "item",
      item: {
        name: item?.names.find((name) => name.language.name === "en")?.name,
        image: item?.sprites.default,
      },
    };
  }

  if (detail.held_item) {
    const item = items.find((item) => item.url === detail.held_item.url);

    return {
      type: "held_item",
      item: {
        name: item?.names.find((name) => name.language.name === "en")?.name,
        image: item?.sprites.default,
      },
    };
  }

  const conditions = [];

  if (detail.min_level) {
    conditions.push({
      type: "level",
      value: detail.min_level,
    });
  }

  if (detail.min_happinsess) {
    conditions.push({
      type: "happiness",
      value: detail.min_happinsess,
    });
  }

  if (detail.min_affection) {
    conditions.push({
      type: "affection",
      value: detail.min_affection,
    });
  }

  if (detail.time_of_day) {
    conditions.push({
      type: "time",
      value: detail.time_of_day,
    });
  }

  if (detail.known_move_type) {
    conditions.push({
      type: "move-type",
      value: detail.known_move_type.name,
    });
  }

  if (detail.trigger?.name === "trade") {
    conditions.push({
      type: "trade",
    });
  }

  return {
    type: "conditions",
    conditions,
  };
}

export function getEvolutionData(node, items) {
  return {
    name: node.species.name,
    id: getpokemonId(node.species.url),

    // Recursividad: Volvemos a llamar a la misma funcion
    // para buscar la data de la siguiente evolucion del pokemon
    evolvesTo: node.evolves_to.map((evolution) => ({
      ...getEvolutionData(evolution, items),

      evolutionMethod: getEvolutionMethod(evolution.evolution_details, items),
    })),
  };
}

export function getEvolutionItemUrls(node) {
  const urls = [];

  node.evolution_details.forEach((detail) => {
    if (detail.item) {
      urls.push(detail.item.url);
    }

    if (detail.held_item) {
      urls.push(detail.held_item);
    }
  });

  node.evolves_to.forEach((evolution) => {
    urls.push(...getEvolutionItemUrls(evolution));
  });

  return urls;
}

export function formatCondition(condition) {
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
