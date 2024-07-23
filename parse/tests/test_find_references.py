import unittest


def find_references(sentence: str) -> list[str]:
    """Return a list of references found in the given sentence."""
    return []


class TestFindReferences:
    def test_empty_sentence(self):
        """Test that an empty sentence returns an empty list."""
        assert find_references("") == []

    def test_no_references(self):
        """Test that a sentence with no references returns an empty list."""
        sentence = "This is a simple sentence."
        assert find_references(sentence) == []

    def test_single_reference(self):
        """Test that a sentence with a single reference returns a list with that reference."""
        sentence = "Lyra is a central character."
        expected_references = ["Lyra"]
        assert find_references(sentence) == expected_references

    def test_multiple_references(self):
        """Test that a sentence with multiple references returns a list with all references."""
        sentence = "Lyra and Will are key characters."
        expected_references = ["Lyra", "Will"]
        assert find_references(sentence) == expected_references


if __name__ == "__main__":
    unittest.main()
