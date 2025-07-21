'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ english: string; urdu: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSummary(null);

    try {
      // 1. Scrape content on the server side (optional future enhancement)
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }), // send the blog URL
      });

      const data = await res.json();
      if (res.ok) {
        setSummary(data);
      } else {
        setError(data.error || 'Failed to summarize.');
      }
    } catch (err) {
      setError('Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <main className="max-w-xl mx-auto mt-16 space-y-6">
      <h1 className="text-3xl font-semibold text-center">Blog Summarizer</h1>

      <Label htmlFor="blog-url">Paste Blog URL:</Label>
      <Input
        id="blog-url"
        placeholder="https://example.com/article"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </Button>

      {error && <p className="text-red-500">{error}</p>}

      {summary && (
        <Card>
          <CardContent className="space-y-4 mt-4">
            <div>
              <h2 className="font-semibold">English Summary:</h2>
              <p>{summary.english}</p>
            </div>
            <div>
              <h2 className="font-semibold">Urdu Summary:</h2>
              <p className="font-noto text-right">{summary.urdu}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
