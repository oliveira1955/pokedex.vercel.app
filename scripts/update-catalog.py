"""Build the Pokédex indexes from the public PokéAPI CSV data."""
import csv
import io
import json
import sys
from collections import defaultdict
from pathlib import Path
from urllib.request import urlopen

BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/"
OUT = Path(__file__).resolve().parents[1] / "src/data"
LANG = {"7": "es", "9": "en", "13": "pt-BR"}


def table(name):
    source = f"{name}.csv"
    if len(sys.argv) > 1:
        content = (Path(sys.argv[1]) / source).read_text(encoding="utf-8")
    else:
        with urlopen(BASE + source, timeout=25) as response:
            content = response.read().decode("utf-8")
    return list(csv.DictReader(io.StringIO(content)))


def localized(name, key):
    result = defaultdict(dict)
    for row in table(name):
        lang = LANG.get(row["local_language_id"])
        if lang and row["name"]:
            result[row[key]][lang] = row["name"]
    return result


def save(name, data):
    (OUT / f"{name}.json").write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
    )


types = {row["id"]: row["identifier"] for row in table("types")}
species = {row["id"]: row for row in table("pokemon_species")}
names = localized("pokemon_species_names", "pokemon_species_id")
pokemon_types = defaultdict(list)
for row in sorted(table("pokemon_types"), key=lambda row: int(row["slot"])):
    if row["type_id"] in types:
        pokemon_types[row["pokemon_id"]].append(types[row["type_id"]])

catalog = []
for row in table("pokemon"):
    if row["is_default"] != "1":
        continue
    number = row["species_id"]
    entry = species[number]
    catalog.append({
        "id": int(row["id"]), "number": int(number), "slug": row["identifier"],
        "species": entry["identifier"], "generation": int(entry["generation_id"]),
        "types": pokemon_types[row["id"]], "names": names[number],
    })
save("catalog", sorted(catalog, key=lambda entry: entry["number"]))

damage_classes = {row["id"]: row["identifier"] for row in table("move_damage_classes")}
move_names = localized("move_names", "move_id")
save("moves", {
    row["identifier"]: {
        "type": types.get(row["type_id"]), "category": damage_classes.get(row["damage_class_id"]),
        "power": row["power"] or None, "accuracy": row["accuracy"] or None,
        "pp": row["pp"] or None, "names": move_names[row["id"]],
    }
    for row in table("moves")
})
efficacy = defaultdict(dict)
for row in table("type_efficacy"):
    efficacy[types[row["damage_type_id"]]][types[row["target_type_id"]]] = int(row["damage_factor"]) / 100
save("efficacy", efficacy)
groups = {row["id"]: row["identifier"] for row in table("version_groups")}
version_names = localized("version_names", "version_id")
versions = defaultdict(list)
for row in table("versions"):
    versions[groups[row["version_group_id"]]].append(version_names[row["id"]])
save("versions", versions)
