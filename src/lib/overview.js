import { formatNumber } from "./pokemon";
import { locale, localized, typeLabel } from "./i18n";

const bulbasaur = {
  description: "Bulbasaur nasce com uma semente nas costas. A planta se desenvolve junto com ele.",
  classification: "Pokémon Semente",
};

export function overview(pokemon, species) {
  const language = locale.value;
  const types = pokemon.types.map(record => typeLabel(record.type.name).toLocaleLowerCase(language));
  const typeList = new Intl.ListFormat(language).format(types);
  const indexed = formatNumber(species.id);
  const localizedDescription = localized(species.flavor_text_entries, "flavor_text", { preferVersion: "red" });
  const localizedClass = localized(species.genera, "genus");
  const generated = {
    "pt-BR": [`Na Pokédex Nacional, esta espécie é a ${indexed}. Seus tipos nesta forma são ${typeList}.`, `Pokémon de tipo ${typeList}`],
    en: [`This species is ${indexed} in the National Pokédex. Its types in this form are ${typeList}.`, `Pokémon of type ${typeList}`],
    es: [`Esta especie es la ${indexed} de la Pokédex Nacional. Sus tipos en esta forma son ${typeList}.`, `Pokémon de tipo ${typeList}`],
  }[language];
  const editorial = language === "pt-BR" && species.name === "bulbasaur" ? bulbasaur : {};
  return {
    description: (!localizedDescription.english && localizedDescription.text) || editorial.description || generated[0],
    classification: (!localizedClass.english && localizedClass.text) || editorial.classification || generated[1],
  };
}

const portugueseAbilities = {
  overgrow: { name: "Supercrescimento", description: "Fortalece os golpes do tipo Planta quando resta um terço dos PS ou menos." },
  chlorophyll: { name: "Clorofila", description: "Dobra a velocidade durante o sol forte." },
};

export function abilityLabel(name, data) {
  const label = localized(data?.names, "name");
  return (!label.english && label.text) || (locale.value === "pt-BR" && portugueseAbilities[name]?.name) || label.text;
}

export function abilityEffect(name, data) {
  const flavor = localized(data?.flavor_text_entries, "flavor_text");
  const effect = localized(data?.effect_entries, "short_effect");
  return (!flavor.english && flavor.text) || (!effect.english && effect.text) ||
    (locale.value === "pt-BR" && portugueseAbilities[name]?.description) || flavor.text || effect.text;
}
