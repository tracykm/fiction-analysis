import re


def find_possible_people(book: str):
    people = {}

    def add_people(sentence):
        for l in re.findall(r"\w\s[A-Z][a-z]+", sentence):
            people[l[2:]] = True

    with open(f"./raw_text/{book}", encoding="utf-8") as f:
        for line in f:
            add_people(line)

    people_list = [*people.keys()]
    people_list.sort()
    print(people_list)


find_possible_people("jane_austen.txt")
