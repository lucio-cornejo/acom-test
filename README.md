# Evaluación para puesto en ACOM

## Reu with Diego

- More important: Pipeline

- usar gpt-4o mini

- system prompt """
Eres un ... de apoyo
solo responden en español, solo en minuscula, 
"""

- no es necesario simplify y eliminar noise words (preposiciones, etc)
Pero, antes de mandar a openai, **quitar emojis**, 
no necesario quitar tildes,
no necesario todo minuscula.

- En cada query al LLM darle uno o dos ejemplos al LLM, 
de posts y cómo detectarlo. Decirle que razone para las asignaciones.

- how define comments para los atributos de la clase.

- detectar institucion mencionada
- columna si es sentimiento negativo o positivo
- keywords en base a sentimiento

- include en la clase algunos de los atributos con los 
que se cuenta para la row.


- como parte del pipeline, include validators, retrials y 
valores default (null) si todo falla


- en slides mostrar cuánto costó el uso de chatgpt para este trabajo

no saldra más de 5 usd

sumar input tokens y outputtokens, tras convertirlo  u pricinng

- maybe ask frecuencia de scraping, para setear frecuencia del procesamiento


nube de palabras (maybe peso para keywords based on number of interactions or sth)
horizontal barplot, keywords en frecuencia posi a left, nega to right
timechart de positivo negativo


## Python deps

```
python-dotenv==1.0.1
pydantic==2.11.7
instructor==1.10.0
pandas==2.2.3
numpy==2.2.1
openpyxl==3.1.5
```
