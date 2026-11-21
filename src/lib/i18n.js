import { ref, watch } from "vue";
import { humanize } from "./pokemon";
import { readStorage, writeStorage } from "./storage";

export const languages = { "pt-BR": "Português (Brasil)", en: "English", es: "Español" };
const preferred = readStorage("pokedex:locale", "pt-BR");
export const locale = ref(Object.hasOwn(languages, preferred) ? preferred : "pt-BR");
watch(locale, value => {
  document.documentElement.lang = value;
  writeStorage("pokedex:locale", value);
}, { immediate: true });

const strings = {
  close: ["Fechar ficha", "Close profile", "Cerrar ficha"],
  skip: ["Pular para o conteúdo", "Skip to content", "Saltar al contenido"],
  catalog: ["Catálogo", "Catalog", "Catálogo"],
  favorites: ["Favoritos", "Favorites", "Favoritos"],
  compare: ["Comparar", "Compare", "Comparar"],
  team: ["Equipe", "Team", "Equipo"],
  search: ["Buscar por nome ou número", "Search by name or number", "Buscar por nombre o número"],
  searchExample: ["Ex. Bulbasaur ou #001", "E.g. Bulbasaur or #001", "P. ej. Bulbasaur o #001"],
  language: ["Idioma", "Language", "Idioma"],
  heading: ["Explore a Pokédex", "Explore the Pokédex", "Explora la Pokédex"],
  intro: ["Descubra Pokémon de Kanto e de outras gerações.", "Discover Pokémon from Kanto and other generations.", "Descubre Pokémon de Kanto y de otras generaciones."],
  generation: ["Geração", "Generation", "Generación"],
  allGenerations: ["Todas as gerações", "All generations", "Todas las generaciones"],
  type: ["Tipo", "Type", "Tipo"],
  allTypes: ["Todos os tipos", "All types", "Todos los tipos"],
  sort: ["Ordenar por", "Sort by", "Ordenar por"],
  number: ["Número", "Number", "Número"],
  name: ["Nome", "Name", "Nombre"],
  clear: ["Limpar filtros", "Clear filters", "Borrar filtros"],
  results: ["resultados", "results", "resultados"],
  shown: ["Exibindo", "Showing", "Mostrando"],
  loadMore: ["Carregar mais", "Load more", "Cargar más"],
  noResults: ["Nenhum Pokémon encontrado com esses filtros.", "No Pokémon match these filters.", "Ningún Pokémon coincide con estos filtros."],
  noFavorites: ["Você ainda não salvou favoritos.", "You haven’t saved any favorites yet.", "Todavía no has guardado favoritos."],
  favorite: ["Adicionar aos favoritos", "Add to favorites", "Añadir a favoritos"],
  unfavorite: ["Remover dos favoritos", "Remove from favorites", "Quitar de favoritos"],
  retro: ["Sprites retrô", "Retro sprites", "Sprites retro"],
  unavailableImage: ["Imagem indisponível", "Image unavailable", "Imagen no disponible"],
  retry: ["Tentar novamente", "Try again", "Reintentar"],
  loading: ["Carregando…", "Loading…", "Cargando…"],
  error: ["Não foi possível carregar os dados.", "Could not load the data.", "No se pudieron cargar los datos."],
  missing: ["Pokémon não encontrado.", "Pokémon not found.", "Pokémon no encontrado."],
  back: ["Voltar à Pokédex", "Back to the Pokédex", "Volver a la Pokédex"],
  previous: ["Anterior", "Previous", "Anterior"],
  next: ["Próximo", "Next", "Siguiente"],
  helpAbout: ["Entenda", "Learn about", "Más sobre"],
  statsHelp: ["Valores que descrevem as características do Pokémon em batalha. PS indica a capacidade de aguentar dano. A velocidade costuma definir quem age primeiro.", "Base values describe how a Pokémon performs in battle. HP measures how much damage it can take. Speed usually determines who moves first.", "Los valores base describen el rendimiento en combate. Los PS indican cuánto daño puede soportar. La velocidad suele determinar quién actúa primero."],
  abilityHelp: ["Habilidades são efeitos que o Pokémon possui. Uma habilidade oculta é uma opção menos comum da espécie.", "Abilities provide effects a Pokémon can have. A hidden ability is a less common option for the species.", "Las habilidades son efectos que un Pokémon puede tener. Una habilidad oculta es una opción menos común de la especie."],
  defenseHelp: ["Mostra quanto dano o Pokémon recebe de cada tipo de golpe. ×2 indica o dobro do dano, ×0,5 indica metade e ×0 é imunidade. O cálculo considera os tipos e exclui habilidades, itens e outros efeitos.", "Shows incoming damage by attack type. ×2 means double damage, ×0.5 means half damage and ×0 is immunity. The calculation uses types and excludes abilities, items and other effects.", "Muestra el daño recibido según el tipo de ataque. ×2 significa daño doble, ×0,5 es la mitad y ×0 es inmunidad. El cálculo se basa en los tipos, sin habilidades, objetos ni otros efectos."],
  moveHelp: ["O poder indica a força base do golpe. A precisão indica a chance base de acertar. A categoria distingue golpes físicos, especiais e de status, que geralmente aplicam um efeito.", "Power measures a move’s base strength. Accuracy is its base chance to hit. Moves can be physical, special or status, which usually applies an effect.", "La potencia indica la fuerza base. La precisión indica la probabilidad base de acertar. Un movimiento puede ser físico, especial o de estado, que normalmente aplica un efecto."],
  evolutionHelp: ["Evoluir muda a espécie do Pokémon. A mesma espécie pode ter caminhos diferentes, com condições como nível, troca ou uso de item.", "Evolution changes a Pokémon’s species. One species can have multiple paths with conditions such as reaching a level, trading or using an item.", "Evolucionar cambia la especie del Pokémon. Una especie puede tener varias rutas con condiciones como nivel, intercambio o uso de objeto."],
  appearanceHelp: ["Shiny é uma variação rara de cor. Os sprites retrô mostram a arte em pixels, e as formas alternativas pertencem à mesma espécie.", "Shiny is a rare color variation. Retro sprites show pixel artwork, and alternate forms belong to the same species.", "Variocolor es una variante de color poco común. Los sprites retro muestran arte en píxeles, y las formas alternativas pertenecen a la misma especie."],
  evolutionRequirements: ["Condições", "Requirements", "Condiciones"],
  captureRate: ["Taxa de captura", "Catch rate", "Ratio de captura"],
  baseExperience: ["Experiência base", "Base experience", "Experiencia base"],
  statTotal: ["Total (BST)", "Total (BST)", "Total (BST)"],
  showNeutral: ["Mostrar danos neutros (×1)", "Show neutral damage (×1)", "Mostrar daño neutro (×1)"],
  hideNeutral: ["Ocultar danos neutros (×1)", "Hide neutral damage (×1)", "Ocultar daño neutro (×1)"],
  officialArt: ["Arte oficial", "Official artwork", "Arte oficial"],
  profileTabs: ["Seções da ficha", "Profile sections", "Secciones de la ficha"],
  neutralDefense: ["Todos os tipos de golpe causam dano neutro nesta forma.", "All attack types deal neutral damage to this form.", "Todos los tipos de ataque causan daño neutro a esta forma."],
  overview: ["Visão geral", "Overview", "Resumen"],
  height: ["Altura", "Height", "Altura"],
  weight: ["Peso", "Weight", "Peso"],
  classification: ["Classificação", "Classification", "Clasificación"],
  abilities: ["Habilidades", "Abilities", "Habilidades"],
  hidden: ["Oculta", "Hidden", "Oculta"],
  englishFallback: ["Conteúdo em inglês", "English content", "Contenido en inglés"],
  missingData: ["Informação indisponível", "Information unavailable", "Información no disponible"],
  stats: ["Atributos", "Base stats", "Estadísticas base"],
  evolutions: ["Evoluções", "Evolutions", "Evoluciones"],
  noEvolutions: ["Não há evoluções registradas.", "No evolutions are recorded.", "No hay evoluciones registradas."],
  moves: ["Golpes", "Moves", "Movimientos"],
  moveSearch: ["Buscar golpe", "Search moves", "Buscar movimiento"],
  noMoves: ["Nenhum golpe encontrado.", "No moves found.", "No se encontraron movimientos."],
  category: ["Categoria", "Category", "Categoría"],
  allCategories: ["Todas as categorias", "All categories", "Todas las categorías"],
  game: ["Jogo", "Game", "Juego"],
  power: ["Poder", "Power", "Potencia"],
  accuracy: ["Precisão", "Accuracy", "Precisión"],
  method: ["Aprendizado", "Learn method", "Método de aprendizaje"],
  level: ["Nível", "Level", "Nivel"],
  forms: ["Formas e aparência", "Forms and appearance", "Formas y apariencia"],
  appearance: ["Aparência", "Appearance", "Apariencia"],
  normal: ["Normal", "Standard", "Normal"],
  shiny: ["Shiny", "Shiny", "Variocolor"],
  alternativeForm: ["Forma alternativa", "Alternate form", "Forma alternativa"],
  mega: ["Mega Evolução", "Mega Evolution", "Megaevolución"],
  addCompare: ["Adicionar à comparação", "Add to comparison", "Añadir a la comparación"],
  removeTeam: ["Remover da equipe", "Remove from team", "Quitar del equipo"],
  inComparison: ["Na comparação", "In comparison", "En comparación"],
  addTeam: ["Adicionar à equipe", "Add to team", "Añadir al equipo"],
  remove: ["Remover", "Remove", "Quitar"],
  selectPokemon: ["Escolher Pokémon", "Choose Pokémon", "Elegir Pokémon"],
  compareEmpty: ["Escolha dois Pokémon para comparar seus atributos.", "Choose two Pokémon to compare their base stats.", "Elige dos Pokémon para comparar sus estadísticas."],
  teamEmpty: ["Monte uma equipe com até seis Pokémon.", "Build a team of up to six Pokémon.", "Forma un equipo de hasta seis Pokémon."],
  difference: ["Diferença", "Difference", "Diferencia"],
  coverage: ["Cobertura defensiva", "Defensive coverage", "Cobertura defensiva"],
  coverageNote: ["Multiplicadores calculados pelos tipos atuais. Habilidades, itens e outros efeitos de batalha ficam fora da análise.", "Multipliers use current types. Abilities, items and other battle effects are outside this calculation.", "Los multiplicadores usan los tipos actuales. El cálculo excluye habilidades, objetos y otros efectos de combate."],
  weak: ["Fracos", "Weak", "Débiles"],
  resist: ["Resistentes", "Resistant", "Resistentes"],
  immune: ["Imunes", "Immune", "Inmunes"],
  neutral: ["Neutros", "Neutral", "Neutros"],
  anyOf: ["ou", "or", "o"],
  allOf: ["e", "and", "y"],
  compareFull: ["A comparação já tem dois Pokémon.", "The comparison already has two Pokémon.", "La comparación ya tiene dos Pokémon."],
  teamFull: ["A equipe já tem seis Pokémon.", "The team already has six Pokémon.", "El equipo ya tiene seis Pokémon."],
};

const types = {
  normal: ["Normal", "Normal", "Normal"], fighting: ["Lutador", "Fighting", "Lucha"],
  flying: ["Voador", "Flying", "Volador"], poison: ["Venenoso", "Poison", "Veneno"],
  ground: ["Terrestre", "Ground", "Tierra"], rock: ["Pedra", "Rock", "Roca"],
  bug: ["Inseto", "Bug", "Bicho"], ghost: ["Fantasma", "Ghost", "Fantasma"],
  steel: ["Aço", "Steel", "Acero"], fire: ["Fogo", "Fire", "Fuego"],
  water: ["Água", "Water", "Agua"], grass: ["Planta", "Grass", "Planta"],
  electric: ["Elétrico", "Electric", "Eléctrico"], psychic: ["Psíquico", "Psychic", "Psíquico"],
  ice: ["Gelo", "Ice", "Hielo"], dragon: ["Dragão", "Dragon", "Dragón"],
  dark: ["Sombrio", "Dark", "Siniestro"], fairy: ["Fada", "Fairy", "Hada"],
  stellar: ["Estelar", "Stellar", "Astral"],
};
const terms = {
  hp: ["PS", "HP", "PS"], attack: ["Ataque", "Attack", "Ataque"],
  defense: ["Defesa", "Defense", "Defensa"], speed: ["Velocidade", "Speed", "Velocidad"],
  "special-attack": ["Ataque especial", "Special attack", "Ataque especial"],
  "special-defense": ["Defesa especial", "Special defense", "Defensa especial"],
  physical: ["Físico", "Physical", "Físico"], special: ["Especial", "Special", "Especial"],
  status: ["Status", "Status", "Estado"], "level-up": ["Subir de nível", "Level up", "Subir de nivel"],
  egg: ["Ovo", "Egg", "Huevo"], tutor: ["Tutor", "Tutor", "Tutor"],
  machine: ["Máquina", "Machine", "Máquina"], trade: ["Troca", "Trade", "Intercambio"],
  "use-item": ["Usar item", "Use an item", "Usar objeto"], shed: ["Evolução especial", "Special evolution", "Evolución especial"],
  day: ["Dia", "Day", "Día"], night: ["Noite", "Night", "Noche"],
};
const index = () => Object.keys(languages).indexOf(locale.value);
export const t = key => strings[key]?.[index()] ?? terms[key]?.[index()] ?? humanize(key);
export const typeLabel = type => types[type]?.[index()] ?? humanize(type);
export const nameOf = entry => entry.names?.[locale.value] || entry.names?.en || humanize(entry.slug);
export const format = (value, options) => new Intl.NumberFormat(locale.value, options).format(value);

export function localized(rows, field, { preferVersion } = {}) {
  const matching = language => rows?.filter(row => row.language?.name === language && row[field]?.trim()) ?? [];
  const best = items => (items.find(row => row.version?.name === preferVersion) ?? items[0])?.[field].replace(/\s+/g, " ").trim();
  const requested = best(matching(locale.value));
  return { text: requested || best(matching("en")), english: !requested && locale.value !== "en" };
}
