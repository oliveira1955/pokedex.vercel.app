import { bySpecies, humanize } from "./pokemon";

const names = {
  item: ["Item", "Item", "Objeto"], gender: ["Sexo", "Gender", "Sexo"],
  held_item: ["Segurando", "Holding", "Con"],
  known_move: ["Conhecer golpe", "Know move", "Conocer movimiento"],
  known_move_type: ["Conhecer golpe do tipo", "Know a move of type", "Conocer un movimiento de tipo"],
  location: ["Local", "Location", "Lugar"], min_level: ["Nível mínimo", "Minimum level", "Nivel mínimo"],
  min_happiness: ["Amizade mínima", "Minimum friendship", "Amistad mínima"],
  min_beauty: ["Beleza mínima", "Minimum beauty", "Belleza mínima"],
  min_affection: ["Afeição mínima", "Minimum affection", "Afecto mínimo"],
  near_special_rock: ["Perto de uma rocha especial", "Near a special rock", "Cerca de una roca especial"],
  needs_multiplayer: ["Em modo multijogador", "In multiplayer", "En modo multijugador"],
  needs_overworld_rain: ["Com chuva", "In rain", "Con lluvia"],
  party_species: ["Pokémon na equipe", "Pokémon in party", "Pokémon en el equipo"],
  party_type: ["Tipo na equipe", "Type in party", "Tipo en el equipo"],
  time_of_day: ["Horário", "Time of day", "Hora del día"],
  trade_species: ["Trocar pelo Pokémon", "Trade for Pokémon", "Intercambiar por Pokémon"],
  turn_upside_down: ["Virar o console de cabeça para baixo", "Turn the console upside down", "Voltear la consola"],
  region: ["Região", "Region", "Región"],
  required_pokemon_form: ["Forma necessária", "Required form", "Forma requerida"],
  evolved_pokemon_form: ["Forma resultante", "Resulting form", "Forma resultante"],
  used_move: ["Usar golpe", "Use move", "Usar movimiento"],
  min_move_count: ["Usos mínimos", "Minimum uses", "Usos mínimos"],
  min_steps: ["Passos mínimos", "Minimum steps", "Pasos mínimos"],
  min_damage_taken: ["Dano mínimo recebido", "Minimum damage taken", "Daño mínimo recibido"],
  allowed_natures: ["Naturezas permitidas", "Allowed natures", "Naturalezas permitidas"],
  condition_expression: ["Regra adicional", "Additional rule", "Regla adicional"],
};
const gender = {
  1: ["Fêmea", "Female", "Hembra"],
  2: ["Macho", "Male", "Macho"],
};
const physical = {
  "-1": ["Ataque < Defesa", "Attack < Defense", "Ataque < Defensa"],
  0: ["Ataque = Defesa", "Attack = Defense", "Ataque = Defensa"],
  1: ["Ataque > Defesa", "Attack > Defense", "Ataque > Defensa"],
};

export function conditions(details, { language, t, typeLabel, nameOf }) {
  const index = ["pt-BR", "en", "es"].indexOf(language);
  const valueOf = (key, value) => {
    if (key === "gender") return gender[value]?.[index] ?? value;
    if (key === "time_of_day") return t(value);
    if (key === "known_move_type" || key === "party_type") return typeLabel(value.name);
    if (key === "party_species" || key === "trade_species") {
      const entry = bySpecies.get(value.name);
      if (entry) return nameOf(entry);
    }
    if (Array.isArray(value)) return value.map(item => humanize(item.name ?? item)).join(", ");
    return typeof value === "object" ? humanize(value.name ?? "") : value;
  };
  return details.map(detail => {
    const parts = [t(detail.trigger?.name)];
    for (const [key, label] of Object.entries(names)) {
      const value = detail[key];
      if (value === null || value === undefined || value === false || value === "" || value?.length === 0) continue;
      parts.push(value === true ? label[index] : label[index] + " " + valueOf(key, value));
    }
    if (detail.relative_physical_stats != null) parts.push(physical[detail.relative_physical_stats]?.[index]);
    return { text: parts.filter(Boolean).join(" · "), game: detail.version_group?.name };
  });
}
