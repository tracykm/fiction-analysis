import json
import os

import nltk

import books.his_dark_materials as his_dark_materials
import books.jane_austen as jane_austen

from find_references import find_references

nltk.download("punkt")
nltk.download("averaged_perceptron_tagger")
nltk.download("maxent_ne_chunker")
nltk.download("words")


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
        people_data = his_dark_materials.people_data.characters
        chapter_names = his_dark_materials.chapter_data.chapter_names
    elif book_title == "jane_austen":
        people_data = jane_austen.people_data.characters
        chapter_names = {}
    with open(f"./books/{book_title}/raw_text.txt", encoding="utf-8") as file:
        (characters, chapters) = find_references(file, people_data, chapter_names)
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
