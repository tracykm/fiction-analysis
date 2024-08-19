import re
import nltk

MIN_SENTENCE_CUTOFF = 40


def combine_short_sentences(sentences_raw: list[str]) -> list[str]:
    combined_sentences = []
    i = 0

    while i < len(sentences_raw):
        current_sentence = sentences_raw[i]

        if len(current_sentence) < MIN_SENTENCE_CUTOFF:
            next_sentence = ""
            try:
                next_sentence = sentences_raw[i + 1]
            except IndexError:
                pass
            prev_sentence = ""
            try:
                prev_sentence = sentences_raw[i - 1]
            except IndexError:
                pass

            if (
                next_sentence
                and not current_sentence.strip()[0].islower()
                and len(next_sentence) < len(prev_sentence)
            ):
                current_sentence += " " + next_sentence
                i += 1
            elif prev_sentence and combined_sentences:
                combined_sentences[-1] += " " + current_sentence
                i += 1
                continue
            elif current_sentence and combined_sentences:
                combined_sentences[-1] += " " + current_sentence
                i += 1
                continue

        combined_sentences.append(current_sentence)
        i += 1

    return combined_sentences


def split_chapters(text):
    # Regular expression to match the delimiter "~~~ CHAPTER" and keep it as its own line
    chapter_delimiter = re.compile(r"(?=~~~ CHAPTER)")
    # Split the text while keeping the delimiter
    chapters = chapter_delimiter.split(text)
    return chapters


def split_sentences(file: str):
    lines = []

    # Split the file content while keeping the delimiter
    chapters = split_chapters(file)

    for chapter_str in chapters:
        # Ensure the chapter delimiter is its own line
        chapter_lines = chapter_str.split("\n")
        for line in chapter_lines:
            if not line:
                continue

            if line.startswith("~~~ CHAPTER"):
                lines.append(line)
            else:
                lines.extend(combine_short_sentences(nltk.tokenize.sent_tokenize(line)))

    return lines


# Example usage
# file_content = """
# “Remember that whatever your conjectures may be, you have no right to repeat them.”

# “I never had any conjectures about it,” replied Margaret; “it was you who told me of it yourself.”

# This increased the mirth of the company, and Margaret was eagerly pressed to say something more.

# “Oh! pray, Miss Margaret, let us know all about it,” said Mrs. Jennings. “What is the gentleman’s name?”

# “I must not tell, ma’am. But I know very well what it is; and I know where he is too.”

# “Yes, yes, we can guess where he is; at his own house at Norland to be sure. He is the curate of the parish I dare say.”

# “No, _that_ he is not. He is of no profession at all.”
# """

# split_lines = split_sentences(file_content)
# for line in split_lines:
#     print(line)

sen = [
    # "\u201cI would not wish to do any thing mean,\u201d",
    # " he replied.",
    # "\u201cOne had rather, on such occasions, do too much than too little. No one, at least, can think I have not done enough for them: even themselves, they can hardly expect more.\u201d",
    # "She was sensible and clever; but eager in everything: her sorrows, her joys, could have no moderation.",
    # "She was generous, amiable, interesting:",
    # "she was everything but prudent.",
    "They will be much more able to give _you_ something.\u201d",
    "\u201cUpon my word,\u201d",
    " said Mr. Dashwood,",
    "\u201cI believe you are perfectly right.",
]

split_lines = combine_short_sentences(sen)
for line in split_lines:
    print(line)
