"use client";

import { useState, useEffect, useRef } from 'react';
import { searchService } from '@/services/search';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EvidenceViewer } from '@/components/domain/EvidenceViewer';
import { useLanguage } from '@/context/LanguageContext';

export default function SearchPage() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalQuery, setOriginalQuery] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const token = localStorage.getItem('kisanvault_jwt');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/voice/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error("Failed to process audio");
      
      const data = await response.json();
      setQuery(data.originalText || data.original_text);
      setOriginalQuery(data.originalText || data.original_text);
      
      // Automatically search with the translated text
      await performSearch(data.englishText || data.english_text, data.originalText || data.original_text);
    } catch (err) {
      console.error(err);
      setError("Failed to process voice input.");
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const suggestedQuestions = [
    "How much did I spend on fertilizer for the North Parcel?",
    "When did I last irrigate the Soybean crop?",
    "What was the yield for Mustard last season?"
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    
    // User typed manually, so we don't have a guaranteed original_query vs english_query translation
    // We send query as is, original_query can be null.
    await performSearch(query, null);
  };

  const performSearch = async (searchQuery, nativeQuery) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Modify searchService.query to accept nativeQuery, or we can use fetch directly here for simplicity
      // but let's assume searchService passes it nicely. Since we can't edit searchService right now, we use apiClient.
      const token = localStorage.getItem('kisanvault_jwt');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/search/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: searchQuery, original_query: nativeQuery })
      });
      
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      
      // Convert snake_case to camelCase since apiClient does this normally
      const formattedData = {
        answer: data.answer,
        query: data.query,
        sourceRecords: data.source_records?.map(r => ({
          recordId: r.record_id,
          table: r.table,
          textPreview: r.text_preview,
          distance: r.distance,
          fullRecord: r.full_record
        }))
      };
      
      setResult(formattedData);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (q) => {
    setQuery(q);
    // Auto submit would go here if desired, but we let user click Search
  };

  return (
    <div className="flex flex-col gap-8 pb-8 max-w-4xl mx-auto w-full">
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 bg-primary-container px-4 py-2 rounded-full text-primary mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
          <span className="font-semibold text-sm">{t('agritechIntelligence')}</span>
        </div>
        <h1 className="font-newsreader text-4xl sm:text-5xl text-text font-semibold tracking-tight">{t('askKisanVault')}</h1>
        <p className="text-text-muted mt-4 text-lg">{t('askQuestionsPlainEnglish')}</p>
      </div>

      <form onSubmit={handleSearch} className="relative w-full shadow-sm rounded-2xl bg-surface-bright border border-border p-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative flex items-center">
          <Input 
            icon="search"
            placeholder={t('askAnything')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none bg-transparent shadow-none h-14 text-lg w-full pr-12"
          />
          <button
            type="button"
            onClick={toggleListen}
            className={`absolute right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isListening ? 'bg-error/10 text-error animate-pulse' : 'bg-surface-container text-text-muted hover:text-primary hover:bg-primary/10'
            }`}
            title="Voice Search"
          >
            <span className="material-symbols-outlined">{isListening ? 'mic' : 'mic_none'}</span>
          </button>
        </div>
        <Button type="submit" disabled={!query.trim() || loading} className="h-14 px-8 shrink-0">
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
          ) : (
            <>
              <span>{t('analyze')}</span>
              <span className="material-symbols-outlined">auto_awesome</span>
            </>
          )}
        </Button>
      </form>

      {!result && !loading && !error && (
        <div className="flex flex-col items-center gap-3 mt-4">
          <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">{t('suggestedQuestions')}</span>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedQuestions.map((q, i) => (
              <button 
                key={i}
                onClick={() => handleSuggestionClick(q)}
                className="px-4 py-2 bg-surface-container hover:bg-border transition-colors rounded-full text-sm text-text font-medium border border-border"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error/10 text-error p-6 rounded-2xl text-center">
          <span className="material-symbols-outlined text-3xl mb-2">error</span>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-surface-bright rounded-2xl p-6 sm:p-8 shadow-sm border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <h2 className="font-newsreader text-2xl font-semibold">{t('aiAnalysis')}</h2>
          </div>
          <p className="text-text text-lg leading-relaxed">{result.answer}</p>
          
          <EvidenceViewer sources={result.sourceRecords} />
        </div>
      )}
    </div>
  );
}
