# %%
import pandas as pd


def validate_attribute_institution(datos: pd.DataFrame) -> None:
    """
    Validate nullable string type for attribute institution
    """
    is_validation_successful = (datos
        .dropna(subset = ["institution"])
        .loc[:, "institution"]
        .apply(lambda inst: isinstance(inst, str))
        .all()
    )

    if not is_validation_successful:
        raise Exception("Found some non missing value not of string type")
    

def validate_attribute_keywords(datos: pd.DataFrame) -> None:
    """
    Validate list of strings type for attribute keywords
    """
    assert(datos
        .loc[:, "keywords"]
        .apply(lambda kws: isinstance(kws, list))
        .all()
    ), "Found some non list type in attribute keywords values"


    is_validation_successful = (datos
        .loc[:, "keywords"]
        .apply(lambda kws: all(list(map(lambda kw: isinstance(kw, str), kws))))
        .all()
    )

    if not is_validation_successful:
        raise Exception("Found keywords value not of type list of string")

# %%
def validate_attribute_main_keyword(datos: pd.DataFrame) -> None:
    """
    Validate string type for attribute main_keyword and that 
    such value is present in list corresponding to attribute keywords
    """
    is_type_valid = (datos
        .loc[:, "main_keyword"]
        .apply(lambda inst: isinstance(inst, str))
        .all()
    )
    assert(is_type_valid), "Found some main_keyword value not of type string"

    # Validate that each main_keyword must be one of its corresponding keywords
    is_main_kw_contained = (datos
        .loc[:, ["main_keyword", "keywords"]]
        .apply(
            lambda row: 
                isinstance(row["keywords"], list) and row["main_keyword"] in row["keywords"],
            axis = 1
        )
    )

    if not is_main_kw_contained.all():
        failed_cases = datos.loc[~is_main_kw_contained]
        print(failed_cases
            .loc[:, ["Post", "main_keyword", "keywords"]]
            .to_dict(orient = 'records')
        )

        raise Exception("Found some main_keyword not contained in its corresponding keywords list")
