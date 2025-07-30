# %%
import emoji
import pandas as pd

pd.set_option('display.max_colwidth', None)

# %%
def remove_emojis(text: str) -> str:
    return emoji.replace_emoji(text, replace = '')


# %%
if __name__ == '__main__':
    datos = pd.read_excel("data/Dataset prueba_SelecciónJulio2025.xlsx")

    # Check that there are no missing values in any Post
    assert(not datos["Post"].isna().any())

    # Remove all emojis from Post, due to possible unexpected influence over sentiment
    datos["Post"] = datos["Post"].apply(lambda post: remove_emojis(post).strip())
    
    datos.to_csv("data/01_Dataset-prueba.csv", index = False)
