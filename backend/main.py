
import os
import re
import time
import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq
from google import genai


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("launchai")

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


# --------------------------------------------------
# FASTAPI APP
# --------------------------------------------------

app = FastAPI(
    title="LaunchAI API",
    description="AI-powered landing page generator",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class WebsiteRequest(BaseModel):
    prompt: str = Field(min_length=5, max_length=3000)


# --------------------------------------------------
# WEBSITE GENERATION PROMPT
# --------------------------------------------------

def create_prompt(user_prompt: str) -> str:
    return f"""
You are LaunchAI, an expert website designer and frontend developer.

Create a complete, professional, visually attractive, responsive
landing page based on the user's request.

USER REQUEST:
{user_prompt}

REQUIREMENTS:
1. Return a complete HTML document.
2. Put all CSS inside a <style> tag.
3. Put JavaScript inside a <script> tag only when needed.
4. Do not use React, JSX, Tailwind, or build tools.
5. Make the website responsive for mobile and desktop.
6. Use modern typography, spacing, colors, and layouts.
7. Include relevant sections based on the business.
8. Use realistic sample text and content.
9. Make buttons and navigation links functional where practical.
10. Avoid unnecessary animations and huge SVG graphics.
11. Do not explain your work.
12. Do not use Markdown code fences.

Return ONLY the HTML code, starting with <!DOCTYPE html>.
"""


# --------------------------------------------------
# CLEAN MODEL OUTPUT
# --------------------------------------------------

def clean_html(html: str) -> str:
    html = html.strip()

    # Remove Markdown code fences if the model adds them
    html = re.sub(r"^```(?:html)?\s*", "", html, flags=re.IGNORECASE)
    html = re.sub(r"\s*```$", "", html)

    html = html.strip()

    if "<html" not in html.lower():
        raise ValueError("The AI response did not contain a valid HTML document.")

    return html


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "LaunchAI backend is running!",
        "primary_provider": "Groq",
        "fallback_provider": "Gemini"
    }


# --------------------------------------------------
# GENERATE WEBSITE
# --------------------------------------------------

@app.post("/generate")
def generate_website(request: WebsiteRequest):

    prompt = create_prompt(request.prompt)

    errors = []

    # ==============================================
    # 1. TRY GROQ FIRST
    # ==============================================

    if groq_client:

        try:
            logger.info("Sending website generation request to Groq...")
            start_time = time.perf_counter()

            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert frontend developer. "
                            "Generate complete, clean, responsive HTML websites. "
                            "Return HTML only."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_completion_tokens=4096,
                reasoning_effort="low",
                temperature=0.3,
                timeout=90
            )

            elapsed = time.perf_counter() - start_time

            html = completion.choices[0].message.content

            if not html:
                raise ValueError("Groq returned an empty response.")

            html = clean_html(html)

            logger.info(
                "Groq generated the website in %.2f seconds",
                elapsed
            )

            return {
                "success": True,
                "html": html,
                "provider": "Groq",
                "model": GROQ_MODEL,
                "generation_time_seconds": round(elapsed, 2)
            }

        except Exception as error:
            logger.exception("Groq generation failed")
            errors.append(f"Groq: {str(error)}")

    else:
        errors.append("Groq: API key is missing.")

    # ==============================================
    # 2. FALL BACK TO GEMINI
    # ==============================================

    if gemini_client:

        try:
            logger.warning("Trying Gemini fallback...")
            start_time = time.perf_counter()

            response = gemini_client.interactions.create(
                model=GEMINI_MODEL,
                input=prompt,
                generation_config={
                    "max_output_tokens": 4096,
                    "thinking_level": "low"
                },
                timeout=120
            )

            elapsed = time.perf_counter() - start_time

            html = response.output_text

            if not html:
                raise ValueError("Gemini returned an empty response.")

            html = clean_html(html)

            logger.info(
                "Gemini generated the website in %.2f seconds",
                elapsed
            )

            return {
                "success": True,
                "html": html,
                "provider": "Gemini",
                "model": GEMINI_MODEL,
                "generation_time_seconds": round(elapsed, 2)
            }

        except Exception as error:
            logger.exception("Gemini fallback failed")
            errors.append(f"Gemini: {str(error)}")

    else:
        errors.append("Gemini: API key is missing.")

    # ==============================================
    # 3. BOTH PROVIDERS FAILED
    # ==============================================

    logger.error("All AI providers failed: %s", errors)

    raise HTTPException(
        status_code=502,
        detail={
            "message": "Website generation failed. Both AI providers were unsuccessful.",
            "errors": errors
        }
    )
