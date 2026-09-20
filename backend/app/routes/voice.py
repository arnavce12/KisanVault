from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
import os
import aiofiles
from app.config import settings

router = APIRouter(prefix="/api/voice", tags=["Voice"])

class VoiceResponse(BaseModel):
    original_text: str
    english_text: str

@router.post("/transcribe", response_model=VoiceResponse)
async def process_voice(audio: UploadFile = File(...)):
    """
    Takes an audio file, transcribes it in the original language using Groq Whisper,
    and then translates the transcript to English via ChatGroq (Llama3).
    """
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GROQ_API_KEY is not set."
        )

    try:
        content = await audio.read()

        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)

        # 1. Transcribe the audio in its original language
        transcription = client.audio.transcriptions.create(
            file=(audio.filename, content, audio.content_type),
            model="whisper-large-v3",
            prompt="Specify context if needed, otherwise this will auto-detect language.",
        )
        original_text = transcription.text.strip()
        
        if not original_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not transcribe audio."
            )

        # 2. Translate the transcript to English using Llama 3
        translation_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional translator. Translate the given text to English. Respond ONLY with the English translation, without any quotes, explanations, or additional text."
                },
                {
                    "role": "user",
                    "content": original_text
                }
            ],
            model="openai/gpt-oss-20b",
            temperature=0,
        )
        english_text = translation_completion.choices[0].message.content.strip()

        return VoiceResponse(
            original_text=original_text,
            english_text=english_text
        )

    except Exception as e:
        print(f"Voice processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing voice input: {str(e)}"
        )
