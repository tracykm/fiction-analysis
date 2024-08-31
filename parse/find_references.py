import re


def has_word(text: str, word: str):
    return re.search(rf"\b{word}\b", text)


def has_character(
    character: dict, sentence: str, book: int | None = None, chapter: int | None = None
):
    if "~~~ CHAPTER " in sentence:
        return False
    if character.get("books") and book is not None:
        valid_book = book in character.get("books")
        if not valid_book:
            return False

    if character.get("chapters") and chapter is not None:
        valid_chapter = chapter in character.get("chapters")
        if not valid_chapter:
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


def format_relationships(relationships: dict[str, dict[str, dict[str, int]]]):
    formatted_rels: dict[str, dict[str, list[list[int]]]] = {}
    for name, val in relationships.items():
        formatted_rels[name] = {}
        for secondary_name, refs in val.items():
            formatted_rels[name][secondary_name] = []
            for idx_a, idx_b in refs.items():
                idx_a = int(idx_a)
                idx_b = int(idx_b)
                pair = []
                if idx_a == idx_b:
                    pair = [idx_a]
                else:
                    pair = [idx_a, idx_b]
                    pair.sort()
                formatted_rels[name][secondary_name].append(pair)
    return formatted_rels


def find_references(
    file: list[str],
    people_data: dict[str, dict],
    chapter_names: dict[list[str]] = None,
    index_all_sentences: bool = False,
    sentence_window=3,
):
    chapters = []
    books = []
    characters = people_data
    relationships: dict[str, dict[str, dict[str, int]]] = {}

    for name in characters:
        characters[name]["name"] = name
        characters[name]["count"] = 0
        characters[name]["refs"] = []

    letter_index = 0
    chapter = 0
    book = 0
    chapter_flat = 0
    relevant_indexed_sentences = {}
    recent_characters = []
    for line in file:
        if "~~~ CHAPTER" in line:
            chapter += 1
            chapter_flat += 1
            chapter_name = str(chapter)
            if ": " in line:
                chapter_name = line.split(": ")[1].strip()
            if chapter_names:
                chapter_name = chapter_names.get(str(book), [])[chapter - 1]
            if chapters:
                chapters[-1]["length"] = letter_index - chapters[-1]["letterIndex"]
            chapters.append(
                {
                    "chapter": chapter,
                    "book": book,
                    "letterIndex": letter_index,
                    "chapterFlat": chapter_flat,
                    "characterRefCount": 0,
                    "title": chapter_name,
                }
            )
        if "~~~ BOOK" in line:
            book += 1
            chapter = 0
            book_name = str(book)
            if ": " in line:
                book_name = line.split(": ")[1].strip()
            if books:
                books[-1]["chapters"] = chapter_flat - books[-1]["chapters"]
            books.append(
                {
                    "id": book,
                    "title": book_name,
                    "chapters": 0,
                }
            )
        sentence = line
        letter_index += len(sentence)
        recent_characters.append({"letter_index": letter_index, "characters": []})
        if index_all_sentences:
            relevant_indexed_sentences[letter_index] = {
                "sentence": sentence,
                "chapterFlat": chapter_flat,
            }
        if len(recent_characters) > sentence_window:
            recent_characters.pop(0)

        if "~~~ " in sentence:  # don't find names in chapter/book titles
            continue
        for name, character in characters.items():
            if has_character(character, sentence, book, chapter_flat):
                relevant_indexed_sentences[letter_index] = {
                    "sentence": sentence,
                    "chapterFlat": chapter_flat,
                }
                if chapters:
                    chapters[-1]["characterRefCount"] += 1
                character["count"] += 1
                character["refs"].append(letter_index)
                for i, recent in enumerate(recent_characters):
                    for recent_name in recent["characters"]:
                        if recent_name != name:
                            relationships[name] = relationships.get(name, {})
                            relationships[name][recent_name] = relationships[name].get(
                                recent_name, {}
                            )
                            relationships[name][recent_name][letter_index] = recent[
                                "letter_index"
                            ]
                            relationships[recent_name] = relationships.get(
                                recent_name, {}
                            )
                            relationships[recent_name][name] = relationships[
                                recent_name
                            ].get(name, {})
                            relationships[recent_name][name][letter_index] = recent[
                                "letter_index"
                            ]
                recent_characters[-1]["characters"].append(name)
    if chapters:
        chapters[-1]["length"] = letter_index - chapters[-1]["letterIndex"]

    print(books)
    return (
        characters,
        chapters,
        format_relationships(relationships),
        relevant_indexed_sentences,
    )
