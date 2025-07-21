import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // 1. Fetch raw HTML from the provided URL
    const pageRes = await fetch(url);
    const html = await pageRes.text();

    // 2. Load HTML into Cheerio
    const $ = cheerio.load(html);

    // 3. Extract meaningful text (you can refine this selector)
    const scrapedText = $('body').text().replace(/\s+/g, ' ').trim();

    if (!scrapedText || scrapedText.length < 50) {
      return NextResponse.json({ error: 'Failed to extract enough text.' }, { status: 400 });
    }

    // 4. Summarize using HuggingFace
    const summaryRes = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({ inputs: scrapedText }),
    });

    const summaryData = await summaryRes.json();
    const englishSummary = summaryData?.[0]?.summary_text || 'Failed to summarize.';

    // 5. Translate to Urdu using LibreTranslate
    const urduRes = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: englishSummary,
        source: 'en',
        target: 'ur',
        format: 'text',
      }),
    });

    const urduData = await urduRes.json();
    const urduSummary = urduData?.translatedText || 'ترجمہ ناکام۔';

    return NextResponse.json({
      english: englishSummary,
      urdu: urduSummary,
    });
  } catch (error) {
    console.error('Error in summarization:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
