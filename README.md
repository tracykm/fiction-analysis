# fiction analysis
see analysis
- [his dark materials](https://tracykm.github.io/fiction-analysis/)
- [jane austen](https://tracykm.github.io/fiction-analysis/?book=&series=jane_austen)
- [the expanse](https://tracykm.github.io/fiction-analysis/?book=&series=the_expanse)
- [harry potter](https://tracykm.github.io/fiction-analysis/?book=&series=harry_potter)
- [middlemarch](https://tracykm.github.io/fiction-analysis/?book=&series=middlemarch)
- [little women](https://tracykm.github.io/fiction-analysis/?book=&series=little_women)


## to re-generate data

- ensure there is a file at `parse/books/MY_BOOK_NAME/raw_text.txt` (copyrighted works are not checked into git)
- install

`python -m venv env`

`source env/bin/activate`

`pip install -r parse/requirements.txt`

- make updates to `parser/people_data.py`
- run parser

`cd parse`

`python process.py && npx prettier -w ../frontend/src/data`

## run frontend locally
`cd ../frontend`

`yarn && yarn start`

open http://localhost:5173/fiction-analysis/

## re-deploy frontend

`cd ../frontend`

`yarn && yarn deploy`

## to set up a new book series

add the folder and the people_data.py and raw_text.txt in same format as jane_austen

- all books in one file
- books start ~~~ BOOK
- chapters start ~~~ CHAPTER

from pdfs update chapters first with new line after
then `(\w)\n\s*([a-z])` -> `$1 $2` to remove line breaks from page wrapping
undo to double check
