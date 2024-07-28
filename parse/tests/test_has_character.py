from ..find_references import has_character

lizzie_char_def = {
    "name": "Lizzie Bennet",
    "other_names": ["Lizzie", "Bennet"],
    "category": [],
    "disqualifiers": ["Mr. Bennet"],
}


class TestHasCharacter:
    def test_empty_sentence(self):
        """Test that an empty sentence returns an empty list."""
        sentence = ""
        assert not has_character({"name": "fake"}, sentence)

    def test_no_references(self):
        sentence = "This is a simple sentence."
        assert not has_character(lizzie_char_def, sentence)

    def test_single_reference(self):
        sentence = "Lizzie is a central character."
        assert has_character(lizzie_char_def, sentence)

    def test_apostrophe_references(self):
        sentence = "Lizzie's  a central character"
        assert has_character(lizzie_char_def, sentence)

    def test_false_references(self):
        sentence = "Lizzieiza a central character"
        assert not has_character(lizzie_char_def, sentence)

    def test_false_references(self):
        sentence = "Mr. Bennet a central character"
        assert not has_character(lizzie_char_def, sentence)
