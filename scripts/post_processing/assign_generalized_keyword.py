# %%
from src.json_loader import load_json

from src.data_parser import parse_data
from src.data_cleaner import clean_institution

from src.validators import (
    validate_attribute_institution,
    validate_attribute_keywords,
    validate_attribute_main_keyword,
)

import pandas as pd

# %%
datos = (pd
    .read_csv("data/02_Dataset-pueba.csv")
    .pipe(parse_data)
    .pipe(clean_institution)
)
datos

# %%
KEYWORDS_MAPPING = load_json("data/keywords_mapping.json")
KEYWORDS_MAPPING

# %%
assert(
    set(datos["main_keyword"].drop_duplicates().values)
        .issubset(set(KEYWORDS_MAPPING.keys()))
)

# %%
# Map main_keyword to its generalization
datos["main_keyword"] = datos["main_keyword"].map(KEYWORDS_MAPPING)

# Make sure lists in keywords contains its respective main_keyword
datos["keywords"] = (datos
    .loc[:, ["main_keyword", "keywords"]]
    .apply(
        lambda row: row["keywords"]
            if row["main_keyword"] in row["keywords"]
            else [*row["keywords"], row["main_keyword"]],

        axis = 1
    )
)

# %%
validate_attribute_institution(datos)
validate_attribute_keywords(datos)
validate_attribute_main_keyword(datos)

# %%
datos.to_csv("data/03_Dataset-prueba.csv", index = False)
