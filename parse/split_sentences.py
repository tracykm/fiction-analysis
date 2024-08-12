import re
import nltk

MIN_SENTENCE_CUTOFF = 40


def combine_short_sentences(sentences_raw: list[str]) -> list[str]:
    combined_sentences = []
    i = 0

    while i < len(sentences_raw):
        current_sentence = sentences_raw[i]

        if len(current_sentence) < MIN_SENTENCE_CUTOFF:
            if i + 1 < len(sentences_raw) and len(sentences_raw[i + 1]) < len(
                current_sentence
            ):
                current_sentence += " " + sentences_raw[i + 1]
                i += 1
            elif i > 0 and len(sentences_raw[i - 1]) < len(current_sentence):
                combined_sentences[-1] += " " + current_sentence
                i += 1
                continue

        combined_sentences.append(current_sentence)
        i += 1

    return combined_sentences


def split_sentences(file: str):
    lines = []
    # Regular expression to match the delimiter "~~~ CHAPTER"
    chapter_delimiter = re.compile(r"(?=~~~ CHAPTER)")

    # Split the file content while keeping the delimiter
    chapters = chapter_delimiter.split(file)

    for chapter_str in chapters:
        # Ensure the chapter delimiter is its own line
        chapter_lines = chapter_str.split("\n")
        for line in chapter_lines:
            if not line:
                continue
            lines.extend(nltk.tokenize.sent_tokenize(line))

            # if line.startswith("~~~ CHAPTER"):
            #     lines.append(line)
            # else:
            #     # Handle quotes to avoid splitting them
            #     quote_pattern = re.compile(r"“[^”]*”")
            #     parts = quote_pattern.split(line)
            #     quotes = quote_pattern.findall(line)

            #     chap_sentences = []
            #     for i, part in enumerate(parts):
            #         if part:
            #             sentences = nltk.tokenize.sent_tokenize(part)
            #             chap_sentences.extend(sentences)
            #         if i < len(quotes):
            #             chap_sentences.append(quotes[i])
            #     lines.extend(combine_short_sentences(chap_sentences))

    return lines


# Example usage
file_content = """
“Remember that whatever your conjectures may be, you have no right to repeat them.”

“I never had any conjectures about it,” replied Margaret; “it was you who told me of it yourself.”

This increased the mirth of the company, and Margaret was eagerly pressed to say something more.

“Oh! pray, Miss Margaret, let us know all about it,” said Mrs. Jennings. “What is the gentleman’s name?”

“I must not tell, ma’am. But I know very well what it is; and I know where he is too.”

“Yes, yes, we can guess where he is; at his own house at Norland to be sure. He is the curate of the parish I dare say.”

“No, _that_ he is not. He is of no profession at all.”
"""

split_lines = split_sentences(file_content)
for line in split_lines:
    print(line)
