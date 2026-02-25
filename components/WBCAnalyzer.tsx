'use client';

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Loader2, Download, BookOpen, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function WBCAnalyzer() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API Key is not configured.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Act as a biblical scholar writing for the Word Biblical Commentary (WBC) series. Analyze the following text: "${inputText}".

Structure your response exactly as follows, using Markdown headers:

# Bibliography
(List relevant scholarly works, commentaries, and articles related to this passage. If specific real-world citations are not available, generate plausible scholarly references in standard format.)

# Translation
(Provide the text from the **Korean Revised Version (개역개정)**. Insert textual note markers (e.g., [a], [b], [c]) into the text to correspond with the Notes section. Do NOT use HTML tags like <sup>; use brackets like [a] instead.)

# Notes
(Provide textual criticism notes, philological analysis of key Hebrew/Greek words. Use standard critical apparatus notation where appropriate. Match the markers [a], [b], etc. from the Translation.)

# Form/Structure/Setting
(Analyze the literary form, structure, and historical setting of the passage.)

# Comment
(Provide a detailed verse-by-verse exegesis.)

# Explanation
(Provide a theological summary and broader context.)

Ensure the tone is academic, critical, and evangelical. Use Hebrew/Greek words where relevant (transliterated or original script).
IMPORTANT: The entire output must be in Korean (except for the bibliography which can be in English/original language). Format the output in Markdown.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      
      const text = result.text;
      if (!text) throw new Error('No content generated.');
      setResult(text);
    } catch (err: any) {
      console.error('Error analyzing text:', err);
      setError(err.message || 'An error occurred while analyzing the text.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocx = async () => {
    if (!result) return;

    // Simple markdown parser for docx generation
    // This is a basic implementation. For complex markdown, a library might be better,
    // but for this specific structure, we can parse it manually.

    const lines = result.split('\n');
    const children = [];

    // Add Title
    children.push(
      new Paragraph({
        text: "WBC Style Commentary",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    children.push(
      new Paragraph({
        text: `Text: ${inputText.substring(0, 50)}${inputText.length > 50 ? '...' : ''}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    );


    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('# ')) {
        children.push(
          new Paragraph({
            text: line.replace('# ', ''),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
      } else if (line.startsWith('## ')) {
        children.push(
          new Paragraph({
            text: line.replace('## ', ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          })
        );
      } else if (line.startsWith('### ')) {
        children.push(
          new Paragraph({
            text: line.replace('### ', ''),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
         children.push(
          new Paragraph({
            text: line.replace(/^[-*]\s+/, ''),
            bullet: {
              level: 0
            }
          })
        );
      } else if (line.length > 0) {
        // Regular paragraph
        // Handle bold/italic simply (stripping markdown for now or basic handling)
        // A robust parser handles bold/italic, but for MVP we just dump text.
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
              }),
            ],
            spacing: { after: 120 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'WBC_Commentary.docx');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8"
      >
        <div className="space-y-4">
          <label htmlFor="bible-text" className="block text-sm font-medium text-stone-700">
            Enter Bible Text or Reference
          </label>
          <textarea
            id="bible-text"
            rows={6}
            className="w-full rounded-xl border-stone-300 shadow-sm focus:border-stone-500 focus:ring-stone-500 sm:text-sm p-4 bg-stone-50 font-serif"
            placeholder="e.g., John 1:1-14 or paste the text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setInputText('');
                setResult('');
                setError('');
              }}
              disabled={isLoading || (!inputText && !result)}
              className="inline-flex items-center px-4 py-2 border border-stone-300 shadow-sm text-sm font-medium rounded-xl text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
            <button
              onClick={analyzeText}
              disabled={isLoading || !inputText.trim()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BookOpen className="-ml-1 mr-2 h-5 w-5" />
                  Generate Commentary
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
            {error}
          </div>
        )}
      </motion.div>

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
        >
          <div className="border-b border-stone-100 bg-stone-50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-stone-500" />
              Commentary Result
            </h2>
            <button
              onClick={downloadDocx}
              className="inline-flex items-center px-4 py-2 border border-stone-300 shadow-sm text-sm font-medium rounded-lg text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors"
            >
              <Download className="-ml-1 mr-2 h-4 w-4" />
              Download Word (.docx)
            </button>
          </div>
          <div className="p-8 prose prose-stone max-w-none font-serif">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
