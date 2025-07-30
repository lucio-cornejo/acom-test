import json
import pandas as pd


def parse_data(datos: pd.DataFrame) -> pd.DataFrame:
    assert(datos["keywords"].notna().all()), "Found row with missing 'keywords' value"

    df = datos.copy()
    df["keywords"] = (datos
        .loc[:, "keywords"]
        .apply(lambda kws: json.loads(kws.replace("'", '"')))
    )

    return df
