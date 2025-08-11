import json, re
from openai import OpenAI
client = OpenAI() # Need to get key from .env

BASE_INSTRUCTIONS = """You are a helpful assistant that creates quiz questions based on the given chapter content.  
Generate questions only of these three types:  
- MCQ (Multiple Choice Question) with exactly one correct choice  
- MRQ (Multi Response Question) with one or more correct choices  
- TF (True/False) with two choices: True and False, only one correct  

Output the result as a JSON object with this structure:

{
  "chapter": {
    "title": "<chapter title>",
    "content": "<chapter content>"
  },
  "questions": [
    {
      "question_text": "<question text>",
      "question_type": "<MCQ|MRQ|TF>",
      "choices": [
        {"text": "<choice text>", "is_correct": <true|false>},
        ...
      ]
    },
    ...
  ]
}

Make sure:  
- For MCQ, exactly one choice is marked correct.  
- For MRQ, one or more choices are marked correct.  
- For TF, only two choices: "True" and "False".  
- The JSON must be valid and well-formed.
"""

def build_user_prompt(chapter_title: str, chapter_content: str) -> str:
    return f"""{BASE_INSTRUCTIONS}

<chapter_title>
{chapter_title}
</chapter_title>

<chapter_content>
{chapter_content}
</chapter_content>
Return ONLY the JSON object described."""
    
def call_model(chapter_title: str, chapter_content: str) -> dict:
    prompt = build_user_prompt(chapter_title, chapter_content)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}],
        temperature=0.2
    )
    raw = resp.choices[0].message.content
    # Extract JSON
    match = re.search(r'\{.*\}\s*$', raw, re.DOTALL)
    if not match:
        raise ValueError("No JSON found")
    data = json.loads(match.group(0))
    return data