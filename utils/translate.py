import os
from google import genai
from dotenv import load_dotenv

load_dotenv()  # Load GOOGLE_API_KEY from .env

def translate_text(text: str, target_language: str, model_name="gemini-2.5-flash") -> str:
    """
    Translates text into the specified target language using Google Generative AI (Gemini).
    This version simplifies the API call structure.

    Args:
        text (str): The text to translate.
        target_language (str): Target language (e.g., 'Spanish', 'Tagalog', etc.)
        model_name (str): Gemini model to use (default: 'gemini-2.5-flash')

    Returns:
        str: The translated text only (no explanation or formatting).
    """

    try:
        # Initialize the client using the API key from environment variables
        client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

        # Construct the prompt directly as a string
        prompt = (
            f"Translate the following sentence to {target_language}. "
            f"Only return the translated text, nothing else:\n\n{text}"
        )

        # Make the API call using the simplified structure
        # The 'contents' argument can directly take a string for simple text inputs
        response = client.models.generate_content(
            model=model_name,
            contents=prompt, # Pass the prompt string directly
        )

        # The response.text typically contains the generated content
        return response.text.strip()

    except Exception as e:
        # You might want to log the full error for debugging, not just return it
        print(f"An error occurred: {e}")
        return f"[Translation failed: {str(e)}]"
