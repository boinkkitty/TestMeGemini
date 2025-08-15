from openai import OpenAI
from google import genai
from django.conf import settings
from typing import List, Literal
from pydantic import BaseModel

class Choice(BaseModel):
    text: str
    is_correct: bool

class Question(BaseModel):
    question_text: str
    question_type: Literal["MCQ", "MRQ", "TF"]
    choices: List[Choice]

class ChapterContent(BaseModel):
    title: str
    content: str

class ChapterSchema(BaseModel):
    chapter: ChapterContent
    questions: List[Question]

# client = OpenAI() # Need to get key from .env

BASE_INSTRUCTIONS = """You are a helpful assistant that creates quiz questions based on the given chapter content. Generate at least 20 questions based on the content provided.  
Generate questions only of these three types:  
- MCQ (Multiple Choice Question) with exactly one correct choice. 3 to 4 choices are allowed.
- MRQ (Multi Response Question) with one or more correct choices. 3 to 4 choices are allowed.
- TF (True/False) with two choices: True and False, only one correct. Only two options, True and False.
"""

def build_user_prompt(chapter_title: str, chapter_content: str) -> str:
    """
    Build content to send to the AI model
    """
    return f"""
      <chapter_title>
      {chapter_title}
      </chapter_title>

      <chapter_content>
      {chapter_content}
      </chapter_content>
      """
    
def call_gpt_model(chapter_title: str, chapter_content: str) -> dict:
    prompt = build_user_prompt(chapter_title, chapter_content)
    client = OpenAI(api_key = settings.OPENAI_API_KEY)
    response = client.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": BASE_INSTRUCTIONS},
            {"role": "user", "content": prompt}
        ],
        response_format=ChapterSchema,
    )
    return response.choices[0].message.parsed.dict()

def call_gemini_model(chapter_title: str, chapter_content: str) -> dict:
    prompt = build_user_prompt(chapter_title, chapter_content)
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema": ChapterSchema
        },
    )
    print(response)
    return response