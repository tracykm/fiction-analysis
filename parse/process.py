import json
import os

import nltk

import books.his_dark_materials as his_dark_materials
import books.jane_austen as jane_austen
import books.the_expanse as the_expanse
import books.harry_potter as harry_potter
import books.war_and_peace as war_and_peace

from find_references import find_references
from split_sentences import split_sentences

nltk.download("punkt")
nltk.download("averaged_perceptron_tagger")
nltk.download("maxent_ne_chunker")
nltk.download("words")


def generate_data(book_title="his_dark_materials"):
    index_all_sentences = False
    if book_title == "his_dark_materials":
        people_data = his_dark_materials.people_data.characters
        chapter_names = his_dark_materials.chapter_data.chapter_names
    elif book_title == "jane_austen":
        people_data = jane_austen.people_data.characters
        index_all_sentences = True
        chapter_names = {}
    elif book_title == "the_expanse":
        people_data = the_expanse.people_data.characters
        chapter_names = {}
    elif book_title == "harry_potter":
        people_data = harry_potter.people_data.characters
        chapter_names = {}
    elif book_title == "war_and_peace":
        people_data = war_and_peace.people_data.characters
        index_all_sentences = True
        chapter_names = {}
    with open(f"./books/{book_title}/raw_text.txt", encoding="utf-8") as file:
        sentences = split_sentences(file.read())
        # with open(f"./books/{book_title}/sentences.json", "w") as f:
        #     f.write(json.dumps(sentences))
        # return
        (characters, chapters, relationships, relevant_indexed_sentences) = (
            find_references(
                sentences,
                people_data,
                chapter_names,
                index_all_sentences=index_all_sentences,
            )
        )

    # Ensure the directory exists
    directory_path = f"../frontend/src/data/{book_title}"
    os.makedirs(directory_path, exist_ok=True)
    with open(f"../frontend/src/data/{book_title}/characters.json", "w") as f:
        f.write(json.dumps(characters))
    with open(f"../frontend/src/data/{book_title}/chapters.json", "w") as f:
        f.write(json.dumps(chapters))
    with open(f"../frontend/src/data/{book_title}/relationships.json", "w") as f:
        f.write(json.dumps(relationships))
    with open(f"../frontend/src/data/{book_title}/indexedSentences.json", "w") as f:
        f.write(json.dumps(relevant_indexed_sentences))


# generate_data("jane_austen")
# generate_data("his_dark_materials")
# generate_data("the_expanse")
# generate_data("harry_potter")
generate_data("war_and_peace")
