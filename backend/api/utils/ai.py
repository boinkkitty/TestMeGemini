import json
from openai import OpenAI
from google import genai
from django.conf import settings
from typing import List, Literal
from pydantic import BaseModel

# Models for the AI response
class Choice(BaseModel):
    text: str
    is_correct: bool

class Question(BaseModel):
    question_text: str
    question_type: Literal["MCQ", "MRQ", "TF"]
    choices: List[Choice]

class ChapterContent(BaseModel):
    title: str
    description: str

class ChapterSchema(BaseModel):
    chapter: ChapterContent
    questions: List[Question]

BASE_INSTRUCTIONS = """
You are a helpful assistant that creates quiz questions from lecture or textbook content.

Your tasks:
1. Write a concise summary (3–5 sentences) of the chapter content.  
2. Generate **at least 20 quiz questions** based strictly on the core learning material (definitions, key concepts, formulas, processes, examples, and comparisons).  

Ignore:  
- Administrative info (exam dates, office hours, announcements)  
- Section dividers like "Summary" or "Questions?"  
- References, citations, URLs, or image captions without context  
- **Course descriptions, motivations, learning objectives**  

Question format:
- **MCQ (Multiple Choice Question)** → Exactly one correct answer, 3–4 choices  
- **MRQ (Multi Response Question)** → One or more correct answers, 3–4 choices  
- **TF (True/False)** → Exactly two options: True and False, one correct  

Constraints:
- Focus only on the course content itself, not its meta-information  
- Questions should be clear, self-contained, and unambiguous  
- Choices should be plausible (no trivial or joke options)  
- Avoid duplicating questions that test the same point  
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
            "response_schema": ChapterSchema
        },
    )
    print(response)
    generated_text = response.candidates[0].content.parts[0].text
    print("Generated text:", generated_text)
    data = json.loads(generated_text)
    return data