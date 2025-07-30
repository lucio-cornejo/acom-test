# %%
from src.logger import get_logger
from src.openai_client import openai_client

import pandas as pd
from pydantic import BaseModel

# %%
logger = get_logger()

# %%
class Post(BaseModel):
    # Nombre de la empresa, institución o centro comercial mencionado en la publicación,
    # si lo hubiera. Por ejemplo: "real plaza", "mall plaza". Si no se menciona ninguna,
    # se debe devolver None.
    institucion: str | None

    # Lista de palabras clave que describen el tipo de riesgo reputacional implicado en la publicación.
    # Estas keywords deben ser generales (por ejemplo: "accidente", "infraestructura", "extorsión", "clausura"),
    # y deben ayudar a clasificar el riesgo reputacional en categorías amplias.
    keywords: list[str]

# %%
SYSTEM_PROMPT = """
Eres un analista de riesgos en una consultoría de comunicaciones en Lima, Perú.
Tu objetivo es identificar los principales riesgos reputacionales a los que se expone el sector retail en el Perú.
Para ello, en cada publicación debes identificar keywords, respecto al riesgo reputacional,
que faciliten categorizarlo en pocas categorías genéricas; 
además, debes identificar la institucion a la que se hace mención en la publicación,
en caso se haga mención a una institucion en particular, sino asigna "None"

Solo responde en castellano y empleando únicamente minúsculas.
"""

EXTRACTION_EXAMPLES = """
- Ejemplo 1:
    - Publicación: "Trujillo amanece con un accidente de tránsito. Un seguidor de Sol Tv reportó un aparatoso choque de camioneta contra poste en la avenida Prolongación César Vallejo, cerca al centro comercial Real Plaza. Información en desarrollo."
    - institucion: "real plaza"
    - keywords: ["accidente"]

- Ejemplo 2:
    - Publicación: "SE ACABA DE CAER EL TECHO DE BEMBOS DEL MALL PLAZA"
    - institucion: "mall plaza"
    - keywords: ["infraestructura"]

- Ejemplo 3:
    - Publicación: "Delincuentes amenazaban con cortarle los dedos a su esposa e hija. La policía le pidió que cambie de chip tras los constantes mensajes intimidantes."
    - institucion: None
    - keywords: ["extorsión"]

- Ejemplo 4:
    - Publicación: "#HUACHO | PLAZA DEL SOL REABRE SUS PUERTAS Contra todo pronostico, el Centro Comercial Plaza Sol levanto sus observaciones de riesgos que existían en su infraestructura, en especial especial el centro de patio de comidas; motivo por el cual fue clausurado el pasadoo 25 de febrero.Vecinos huachanos mostraron su sorpresa, ya que la reapertura se da en un día domingo, donde normalmente personal de la comuna no labora; sin embargo, hoy habrían estado desde muy temprano, según comentaron."
    - institucion: "plaza del sol"
    - keywords: ["apertura", "clausura"]
"""

# %%
datos = pd.read_csv("data/01_Dataset-prueba.csv")
datos["institucion"] = None
datos["keywords"] = None

# %%
for idx, row in datos.iterrows():
    if idx % 10 == 0: print(idx)

    try:
        post = row["Post"]
        post_output = openai_client.chat.completions.create(
            model = "gpt-4o-mini",
            response_model = Post,
            messages = [
                { "role": "system", "content": SYSTEM_PROMPT },
                { 
                    "role": "user", 
                    "content": f"""
        Considera estos ejemplos exitosos de extracción: {EXTRACTION_EXAMPLES}

        Extrae: {post}
        """}
            ],
        )

        logger.info(f"Index: {idx}. Output: {post_output}")

        datos.loc[idx, "institucion"] = post_output.institucion
        datos.at[idx, "keywords"] = post_output.keywords

    except Exception as e:
        logger.warning(f"Failed extraction for index {idx} due to {e}")
        continue

# %%
datos.to_csv("data/02_Dataset-pueba.csv", index = False)
