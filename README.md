# his-dark-materials-analysis

[see analysis](https://tracykm.github.io/his-dark-materials-analysis/)

## to re-deploy

- add a file parse/raw_text.full_text.txt
- install

`python -m venv env`
`source env/bin/activate`
`pip install -r parse/requirements.txt`

- make updates to `parser/people_data.py`
- run parser

`cd parse`
`python process.py && npx prettier -w ../frontend/src/data`

re-deploy frontend

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
