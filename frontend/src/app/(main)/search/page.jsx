"use client";

import { useState } from 'react';
import { searchService } from '@/services/search';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EvidenceViewer } from '@/components/domain/EvidenceViewer';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const suggestedQuestions = [
    "How much did I spend on fertilizer for the North Parcel?",
    "When did I last irrigate the Soybean crop?",
    "What was the yield for Mustard last season?"
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await searchService.query(query);
      setResult(res);
    } catch (err) {
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
          <span className="font-semibold text-sm">Agritech Intelligence</span>
        </div>
        <h1 className="font-newsreader text-4xl sm:text-5xl text-text font-semibold tracking-tight">Ask KisanVault</h1>
        <p className="text-text-muted mt-4 text-lg">Ask questions about your farm history in plain English.</p>
      </div>

      <form onSubmit={handleSearch} className="relative w-full shadow-sm rounded-2xl bg-surface-bright border border-border p-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input 
            icon="search"
            placeholder="Ask anything about your farm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none bg-transparent shadow-none h-14 text-lg"
          />
        </div>
        <Button type="submit" disabled={!query.trim() || loading} className="h-14 px-8 shrink-0">
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
          ) : (
            <>
              <span>Analyze</span>
              <span className="material-symbols-outlined">auto_awesome</span>
            </>
          )}
        </Button>
      </form>

      {!result && !loading && !error && (
        <div className="flex flex-col items-center gap-3 mt-4">
          <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Suggested Questions</span>
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
            <h2 className="font-newsreader text-2xl font-semibold">AI Analysis</h2>
          </div>
          <p className="text-text text-lg leading-relaxed">{result.answer}</p>
          
          <EvidenceViewer sources={result.sources} />
        </div>
      )}
    </div>
  );
}
