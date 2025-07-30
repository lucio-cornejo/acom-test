# %%
from src.logger import get_logger

from src.data_parser import parse_data
from src.data_cleaner import clean_institution

from src.validators import (
    validate_attribute_institution,
    validate_attribute_keywords,
    validate_attribute_main_keyword,
)

from src.openai_client import openai_client

import json
import pandas as pd
from pydantic import BaseModel

# %%
logger = get_logger()

# %%
class GeneralizedKeyword(BaseModel):
    # Nombre de la categoría más general asociada a una keyword que se extrajo
    # a partir del texto de una publicación de red social, cuya temática
    # está asociada al riesgo reputacional de una tienda
    general_keyword: str 

# %%
datos = (pd
    .read_csv("data/02_Dataset-pueba.csv")
    .pipe(parse_data)
    .pipe(clean_institution)
)
datos

# %%
validate_attribute_institution(datos)
validate_attribute_keywords(datos)
validate_attribute_main_keyword(datos)

# %%
# Homogenize main keywords, due to similar words, not too generic,
# being used as main_keyword. For example, in order to map
# "robo" and "asalto" to "delincuencia"

unique_kws = (datos
    .loc[:, "keywords"]
    .explode()
    .dropna()
    .unique()
    .tolist()
)

unique_kw = (datos
    .loc[:, "main_keyword"]
    .dropna()
    .unique()
    .tolist()
)

unique_categories = list(set([*unique_kws, *unique_kw]))
unique_categories, len(unique_categories)

# %%
# A baseline unique categories mapping was constructed, with very few
# examples, as input for Chat-GPT to complete the mapping.
# Such mapping has been stored in path "data/partial_keywords_mapping.json" .
with open("data/partial_keywords_mapping.json", "r", encoding="utf-8") as f:
    PARTIAL_KEYWORDS_MAPPING = json.load(f)

keywords_mapping = pd.DataFrame.from_records([
    { 
        "keyword" : kw, 
        "general_keyword" : None 
            if not (kw in PARTIAL_KEYWORDS_MAPPING.keys())
            else PARTIAL_KEYWORDS_MAPPING[kw]
    }
    for kw in unique_categories
])
keywords_mapping

# %%
for idx, row in keywords_mapping.iterrows():
    if pd.notna(row["general_keyword"]): continue

    if idx % 10 == 0: print(idx)

    stringified_successful_mapping = json.dumps(
        keywords_mapping
            .dropna(subset = ["general_keyword"])
            .to_json(orient = 'records'),

        ensure_ascii = False
    )

    try:
        keyword = row["keyword"]
        kw_map_reponse = openai_client.chat.completions.create(
            model = "gpt-4o-mini",
            response_model = GeneralizedKeyword,
            messages = [
                { "role": "system", "content": "Eres un analista de riesgo para retails de Lima, Perú" },
                { 
                    "role": "user", 
                    "content": f"""
    En el siguiente diccionario, cada clave representa una palabra clave extraída de una publicación sobre tiendas de retail en Lima, Perú. 
    Muchas de estas palabras clave (llaves del diccionario) son similares,
    pero han sido categorizadas en función de una categoría más general:

    {stringified_successful_mapping}

    Manteniendo consistencia con el diccionario proporcionado (misma generalización para misma llave de diccionario),
    asigna una categoría más general para la siguiente keyword: "{keyword}"
    """}
        ],
    )
        logger.info(f"Index: {idx}. Output: {kw_map_reponse}")
        keywords_mapping.loc[idx, "general_keyword"] = kw_map_reponse.general_keyword

    except Exception as e:
        logger.warning(f"Failed extraction for index {idx} due to {e}")
        continue
    
# %%
with open("data/keywords_mapping.json", "w", encoding="utf-8") as f:
    json.dump(
        {
            row["keyword"] : row["general_keyword"]
            for _, row in keywords_mapping.iterrows()
        },
        f, 
        ensure_ascii = False,  
        indent = 2
    )
