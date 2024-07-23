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
