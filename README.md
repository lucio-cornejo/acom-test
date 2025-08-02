# Evaluación para puesto en ACOM

## Etapa **procesamiento** pipeline

### Preprocesamiento 

- Código: `/scripts/pre_processing.py`
- **Objetivo**: De la columna `Post` del conjunto de datos
planteado, remover los emojis de los textos.

### Procesamiento

- Código: `/scripts/processing.py`
- **Objetivo**: A partir del texto *limpieado* de cada publicación
(columna/atributo `Post`), extraer sus atributos de *institución*,
*temáticas* y *temática principal*. 
Esta extracción se realizó por medio de las librerías de Python `pydantic` e `instructor`,
con el fin que el API de OpenAI produzca respuestas de una estructura
que facilite en gran medida la extracción de los atributos deseados.

Aquella estructura de las respuestas es en base a la siguiente clase de Python:

```python
class Post(BaseModel):
    # Nombre de la empresa, institución o centro comercial mencionado en la publicación,
    # si lo hubiera. Por ejemplo: "real plaza", "mall plaza". Si no se menciona ninguna,
    # se debe devolver None.
    institution: str | None

    # Lista de palabras clave que describen el tipo de riesgo reputacional implicado en la publicación.
    # Estas keywords deben ser generales (por ejemplo: "accidente", "infraestructura", "extorsión", "clausura"),
    # y deben ayudar a clasificar el riesgo reputacional en categorías amplias.
    keywords: list[str]

    # La keyword principal (main_keyword) debe ser una de las palabras listadas en el campo keywords.
    # Esta main_keyword debe ser la más representativa entre las temáticas (keywords) asociadas a la publicación.
    main_keyword: str 
```

### Postprocesamiento

- Se definió funciones validadoras para verificar que los atributos extraídos
por ChatGPT cumplan las restricciones definidas en la previamente mencionada
clase `Post` de Python.

- Resaltó que no fueron tan genéricos los valores de temática general de publicación
que se solicitó a ChatGPT. Entonces, se ejecutó otra serie de pedidos,
por medio del API de OpenAI, para recategorizar en **menos categorías**
todas las temáticas extraídas en el procesamiento. 
De esa manera, contando con temáticas más generales, el análisis resulta más claro,
evitando situaciones como temáticas *robo* y *asalto*, sino una sola categoría que
las engloba (por ejemplo, categoría *delincuencia*).
El código de este proceso se encuentra en `scripts/post_processing/generalize_main_keyword.py`.

- Después, en los datos de este ejercicio,
se asignó como temática principal a la nueva
recategorización obtenida. Además, se solucionó
que el atributo `main_keyword` este siempre presente
en la lista definida según el atributo `keywords`.
De esa manera, todas las funciones de validación
resultaron exitosas para la base de datos construída
finalmente: `data/03_Dataset-prueba.csv`.


## Python dependencies

- Versión empleada de Python: `3.11.0`

- Librerías de Python principalmente empleadas:
    - python-dotenv==1.0.1
    - pydantic==2.11.7
    - instructor==1.10.0
    - pandas==2.2.3
    - numpy==2.2.1
    - openpyxl==3.1.5
