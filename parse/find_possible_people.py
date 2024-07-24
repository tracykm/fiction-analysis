import re
import os
import json


def find_possible_people(book_title: str):
    people = {}
    people_books = {}
    book = 0

    with open(f"./books/{book_title}/raw_text.txt", encoding="utf-8") as f:
        for line in f:
            if "~~~ BOOK" in line:
                book += 1
            for l in re.findall(r"\w\s[A-Z][a-z]+", line):
                name = l[2:]
                people[name] = people.get(name, 0) + 1
                people_books[name] = people_books.get(name, {})
                people_books[name][book] = True

    people_list = [*people.keys()]
    people_list.sort(key=lambda x: people[x], reverse=True)
    # print(people_books)
    return people_list, people_books


def generate_people_data(book_title: str, books_dont_share_characters=False):
    (people, people_books) = find_possible_people(book_title)

    people_dict = {}
    for name in people:
        if books_dont_share_characters:
            for book in people_books[name].keys():
                update_name = f"{name}({book})"
                people_dict[update_name] = {
                    "name": update_name,
                    "category": [],
                    "disqualifiers": [],
                    "books": [book],
                    "other_names": [name],
                }
        else:
            people_dict[name] = {
                "name": name,
                "category": [],
                "disqualifiers": [],
                "books": list(people_books[name].keys()),
                "other_names": [name],
            }

    with open(f"./books/{book_title}/people_data.py", "w") as f:
        f.write(json.dumps(f"characters = {people_dict}"))


generate_people_data("jane_austen", books_dont_share_characters=True)
