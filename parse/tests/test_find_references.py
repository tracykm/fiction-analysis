from ..find_references import find_references

lizzie_char_def = {
    "name": "Lizzie",
    "other_names": [],
    "category": [],
    "disqualifiers": [],
}
jane_char_def = {
    "name": "Jane",
    "other_names": [],
    "category": [],
    "disqualifiers": [],
}

characters = {
    "Lizzie": lizzie_char_def,
    "Jane": jane_char_def,
}


class TestFindReferences:
    def test_simple_sentence(self):
        sentence = "Lizzie is a central character."
        assert find_references([sentence], characters)[0]["Lizzie"]["count"] == 1

    def test_no_relationship_sentence(self):
        sentence = "Lizzie is a central character. A sister."
        assert find_references([sentence], characters)[2] == {}

    def test_relationship_sentence(self):
        sentence = "Lizzie is a central character. Jane is her sister."
        assert find_references([sentence], characters)[2] == {
            "Jane": {"Lizzie": 1},
            "Lizzie": {"Jane": 1},
        }

    def test_too_far_relationship_sentence(self):
        sentence = "Lizzie is a central character. She was very tall and other people like her a lot. Jane was her even taller sister."
        assert find_references([sentence], characters, sentence_window=1)[2] == {}

    def test_too_far_relationship_big_window_sentence(self):
        sentence = "Lizzie is a central character. She was very tall and other people like her a lot. Jane was her even taller sister."
        assert find_references([sentence], characters, sentence_window=4)[2] == {
            "Jane": {"Lizzie": 1},
            "Lizzie": {"Jane": 1},
        }
