'use client';

import { useState } from 'react';

interface UploadTabProps {
  enableXAI: boolean;
  includeReferences: boolean;
  setActiveTab: (tab: number) => void;
}

// Renders markdown the same way Streamlit does
function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="prose prose-sm max-w-none text-gray-800 space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith('### '))
          return <h3 key={i} className="text-base font-bold text-purple-800 mt-4 mb-1 border-b border-purple-100 pb-1">{line.slice(4)}</h3>;
        if (line.startsWith('## '))
          return <h2 key={i} className="text-lg font-bold text-gray-900 mt-5 mb-2">{line.slice(3)}</h2>;
        if (line.startsWith('# '))
          return <h1 key={i} className="text-xl font-bold text-gray-900 mt-5 mb-2">{line.slice(2)}</h1>;
        // Bold-only lines act as section headers (Streamlit response style)
        if (/^\*\*[^*]+\*\*:?\s*$/.test(line.trim()))
          return <h4 key={i} className="text-sm font-bold text-purple-800 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: fmt(line) }} />;
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <div key={i} className="flex gap-2 ml-4 my-0.5">
              <span className="text-purple-500 mt-1 text-xs">●</span>
              <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: fmt(line.slice(2)) }} />
            </div>
          );
        if (/^\d+\.\s/.test(line)) {
          const m = line.match(/^(\d+)\.\s(.*)$/);
          if (m)
            return (
              <div key={i} className="flex gap-2 ml-4 my-0.5">
                <span className="text-purple-600 font-semibold min-w-[1.4rem]">{m[1]}.</span>
                <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: fmt(m[2]) }} />
              </div>
            );
        }
        if (line.trim() === '') return <div key={i} className="h-1.5" />;
        return <p key={i} className="my-0.5 leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: fmt(line) }} />;
      })}
    </div>
  );
}

function fmt(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');
}

export default function UploadTab({ enableXAI, includeReferences, setActiveTab }: UploadTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<{ overlay: string; heatmap: string } | null>(null);
  const [references, setReferences] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setAnalysis(null);
    setHeatmap(null);
    setReferences([]);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleAnalyze = async () => {
    if (!file || !preview) return;
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setHeatmap(null);
    setReferences([]);

    try {
      // 1. Analyze image (heatmap included in response when enableXAI is true)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: preview, filename: file.name, enableXAI }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.data);

      // 2. Set heatmap from analyze response
      if (enableXAI && data.data.overlay && data.data.heatmap) {
        setHeatmap({ overlay: data.data.overlay, heatmap: data.data.heatmap });
      }

      // 3. Fetch PubMed references if enabled
      if (includeReferences && data.data.keywords?.length) {
        const refRes = await fetch('/api/pubmed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: data.data.keywords }),
        });
        const refData = await refRes.json();
        if (refData.success) setReferences(refData.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartDiscussion = async () => {
    if (!analysis) return;
    const desc = analysis.findings?.[0] || file?.name || 'Case discussion';
    const fileType = file?.name.split('.').pop()?.toUpperCase() || 'CASE';
    await fetch('/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseDescription: desc, fileType }),
    });
    setActiveTab(2);
  };

  const handleStartQA = async () => {
    if (!file) return;
    await fetch('/api/qa/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName: `Q&A for ${file.name}` }),
    });
    setActiveTab(3);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">📤 Upload & Analyze Medical Image</h2>

      {/* Upload area */}
      <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-purple-50 hover:bg-purple-100 transition">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.dcm,.nii,.nii.gz"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-4xl mb-3">🏥</div>
          <p className="text-purple-700 font-semibold text-lg">
            {file ? file.name : 'Click to upload a medical image'}
          </p>
          <p className="text-sm text-gray-500 mt-1">JPEG, PNG, DICOM, NIfTI — max 50MB</p>
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <img src={preview} alt="Preview" className="w-full max-h-80 object-contain bg-black" />
        </div>
      )}

      {/* Analyze button */}
      {file && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analyzing image...
            </>
          ) : '🔍 Analyze Image'}
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Analysis Results - matches Streamlit layout */}
      {analysis && (
        <div className="space-y-6">
          {/* Main analysis */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🔬 Analysis Results
            </h3>
            <MarkdownContent text={analysis.analysis} />
          </div>

          {/* Key Findings */}
          {analysis.findings?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Key Findings</h3>
              <ol className="space-y-2">
                {analysis.findings.map((f: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-purple-600 font-bold min-w-[1.5rem]">{i + 1}.</span>
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Keywords */}
          {analysis.keywords?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">🏷️ Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((k: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* XAI Heatmap - matches Streamlit col1/col2 layout */}
          {enableXAI && heatmap && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🔬 Explainable AI Visualization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2 text-center">Heatmap Overlay</p>
                  <img src={heatmap.overlay} alt="Heatmap Overlay" className="w-full rounded-lg border border-gray-200" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2 text-center">Raw Heatmap</p>
                  <img src={heatmap.heatmap} alt="Raw Heatmap" className="w-full rounded-lg border border-gray-200" />
                </div>
              </div>
            </div>
          )}

          {/* Medical References */}
          {includeReferences && references.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📚 Relevant Medical Literature</h3>
              <ul className="space-y-3">
                {references.map((ref: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-purple-500 mt-1">•</span>
                    <div>
                      <span className="font-semibold text-gray-800">{ref.title}</span>
                      <span className="text-gray-500 text-sm ml-2">{ref.journal}, {ref.year}</span>
                      {ref.id && <span className="text-xs text-purple-500 ml-2">(PMID: {ref.id})</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Collaborate buttons - matches Streamlit col1/col2 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🤝 Collaborate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleStartDiscussion}
                className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                💬 Start Case Discussion
              </button>
              <button
                onClick={handleStartQA}
                className="py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                ❓ Start Q&A Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
