import openai
from django.conf import settings
import json

# Ensure OPENAI_API_KEY is set in settings.py or environment
openai.api_key = getattr(settings, 'OPENAI_API_KEY', None)

def transcribe_audio(file_path):
    """
    Transcribes audio file using OpenAI Whisper model.
    """
    try:
        with open(file_path, "rb") as audio_file:
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

def analyze_meeting(transcript_text):
    """
    Analyzes meeting transcript using OpenAI GPT-4o to extract summary and action items.
    Returns a dict with 'summary' (str) and 'action_items' (list of str).
    """
    prompt = f"""
    You are an AI meeting assistant. Analyze the following meeting transcript.
    
    1. Provide a concise summary of the meeting.
    2. Extract clear, actionable items from the discussion.
    
    Transcript:
    {transcript_text}
    
    Return the result in valid JSON format with keys: "summary" and "action_items".
    """
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes meeting transcripts."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error analyzing meeting: {e}")
        return None
