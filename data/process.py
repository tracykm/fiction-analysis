import json

lyra_count = 0

characters = {
    "Lyra": {"count": 0, "char_count": []},
    "Asriel": {"count": 0, "char_count": []},
    "Pantalaimon": {"count": 0, "char_count": []},
    "Roger": {"count": 0, "char_count": []},
    "Coulter": {"count": 0, "char_count": []},
    "Lord Faa": {"count": 0, "char_count": []},
    "Farder Coram": {"count": 0, "char_count": []},
    "Ma Costa": {"count": 0, "char_count": []},
    "Billy": {"count": 0, "char_count": []},
    "Scoresby": {"count": 0, "char_count": []},
    "Serafina": {"count": 0, "char_count": []},
    "Byrnison": {"count": 0, "char_count": []},
}

with open("./raw_text/golden_compass.txt", encoding="utf-8") as f:
    char_count = 0
    for line in f:
        sentences = line.split(".")
        for sentence in sentences:
            char_count += len(sentence)
            sentence_lower = sentence.lower()
            for character in characters:
                if character.lower() in sentence_lower:
                    characters[character]["count"] += 1
                    characters[character]["char_count"].append(
                        {"char_count": char_count, "sentence": sentence}
                    )

with open("../app/src/data/characters.json", "w") as f:
    f.write(json.dumps(characters))
