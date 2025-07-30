import re
import pandas as pd


def clean_institution(datos: pd.DataFrame) -> pd.DataFrame:
    df = datos.copy()
    is_institution_null_but_string = (datos
        .loc[:, "institution"]
        .apply(lambda inst: 
            pd.notna(inst) and 'none' == re.sub(r"\s", '', inst.lower())
        )
    )
    df.loc[is_institution_null_but_string, "institution"] = None
    return df
