import instructor
from openai import OpenAI

from dotenv import load_dotenv
load_dotenv()


openai_client = instructor.from_openai(OpenAI())
