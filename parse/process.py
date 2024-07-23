import json
import re
import os

import nltk

import books.his_dark_materials.people_data as his_dark_materials
import books.jane_austen.people_data as jane_austen

nltk.download("punkt")
nltk.download("averaged_perceptron_tagger")
nltk.download("maxent_ne_chunker")
nltk.download("words")


def has_word(text: str, word: str):
    return re.search(rf"\b{word}\b", text)


def combine_short_sentences(sentences_raw: list[str]):
    sentences = []
    for sentence in sentences_raw:

        if sentences and (
            sentences[-1].endswith("Mr.")
            or sentences[-1].endswith("Mrs.")
            or sentences[-1].endswith("Ms.")
            or sentences[-1].endswith("Dr.")
            or len(sentence) < 30
        ):
            sentences[-1] += " " + sentence
        else:
            sentences.append(sentence)
    return sentences


def has_character(character: dict, sentence: str, book: int):
    if character.get("books"):
        valid_book = book in character.get("books")
        if not valid_book:
            return False

    all_names = [character["name"]] + character.get("other_names", [])
    in_sentence = any(name for name in all_names if has_word(sentence, name))
    if not in_sentence:
        return False

    disqualifiers = any(
        name for name in character.get("disqualifiers", []) if has_word(sentence, name)
    )
    if disqualifiers:
        return False
    return True


def find_references(file: list[str], people_data: dict[str, dict]):
    chapters = []
    characters = people_data

    for name in characters:
        characters[name]["name"] = name
        characters[name]["count"] = 0
        characters[name]["refs"] = []

    letter_index = 0
    chapter = 0
    book = 0
    chapter_flat = 0
    for line in file:
        if "~~~ CHAPTER" in line:
            chapter += 1
            chapter_flat += 1
            if chapters:
                chapters[-1]["length"] = letter_index - chapters[-1]["letterIndex"]
            chapters.append(
                {
                    "chapter": chapter,
                    "book": book,
                    "letterIndex": letter_index,
                    "chapterFlat": chapter_flat,
                    "characterRefCount": 0,
                }
            )
        if "~~~ BOOK" in line:
            book += 1
            chapter = 0

        sentences = combine_short_sentences(nltk.tokenize.sent_tokenize(line))

        for sentence in sentences:
            letter_index += len(sentence)
            for name, character in characters.items():
                if has_character(character, sentence, book):
                    if chapters:
                        chapters[-1]["characterRefCount"] += 1
                    character["count"] += 1
                    character["refs"].append(
                        {
                            "letterIndex": letter_index,
                            "sentence": sentence,
                            "chapterFlat": chapter_flat,
                        }
                    )
    chapters[-1]["length"] = letter_index - chapters[-1]["letterIndex"]
    return characters, chapters


# Function to group references by chapter
def group_by_chapter(refs):
    grouped = {}
    for ref in refs:
        chapter = ref["chapterFlat"]
        if chapter not in grouped:
            grouped[chapter] = []
        grouped[chapter].append(ref)
    return grouped


def generate_data(book_title="his_dark_materials"):
    if book_title == "his_dark_materials":
        people_data = his_dark_materials.characters
    elif book_title == "jane_austen":
        people_data = jane_austen.characters
    with open(f"./books/{book_title}/raw_text.txt", encoding="utf-8") as file:
        (characters, chapters) = find_references(file, people_data)
        characters = {
            k: {**v, "refs": group_by_chapter(v["refs"])} for k, v in characters.items()
        }

    # Ensure the directory exists
    directory_path = f"../frontend/src/data/{book_title}"
    os.makedirs(directory_path, exist_ok=True)
    with open(f"../frontend/src/data/{book_title}/characters.json", "w") as f:
        f.write(json.dumps(characters))
    with open(f"../frontend/src/data/{book_title}/chapters.json", "w") as f:
        f.write(json.dumps(chapters))


generate_data("his_dark_materials")
generate_data("jane_austen")
