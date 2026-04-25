"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const GRID_COLOR = "rgba(0,255,170,0.04)";

function GlitchText({ text }: { text: string }) {
  return (
    <span className="glitch" data-text={text}>
      {text}
    </span>
  );
}

function RadarRing({ score }: { score: number }) {
  const radius = 80;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Concentric rings */}
      {[40, 60, 80, 100].map((r) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgba(0,255,170,0.08)"
          strokeWidth="1"
        />
      ))}
      {/* Cross hairs */}
      <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(0,255,170,0.08)" strokeWidth="1" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(0,255,170,0.08)" strokeWidth="1" />
      {/* Background track */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="rgba(0,255,170,0.1)"
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
      />
      {/* Score arc */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={score >= 70 ? "#00ffaa" : score >= 40 ? "#f59e0b" : "#ef4444"}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
        filter="url(#glow)"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
      {/* Score text */}
      <text x="100" y="95" textAnchor="middle" fill="#00ffaa" fontSize="28" fontFamily="'Share Tech Mono', monospace" fontWeight="bold">
        {score}
      </text>
      <text x="100" y="115" textAnchor="middle" fill="rgba(0,255,170,0.5)" fontSize="11" fontFamily="'Share Tech Mono', monospace">
        MATCH SCORE
      </text>
    </svg>
  );
}

function ScanLine() {
  return (
    <div className="scanline-container" aria-hidden="true">
      <div className="scanline" />
    </div>
  );
}

function TerminalLoader() {
  const [dots, setDots] = useState("");
  const steps = [
    "PARSING PDF VECTORS",
    "EMBEDDING RESUME TOKENS",
    "RUNNING SEMANTIC DIFF",
    "SCORING SKILL ALIGNMENT",
    "GENERATING REPORT",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const d = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 400);
    const s = setInterval(() => setStep((p) => (p + 1) % steps.length), 1100);
    return () => { clearInterval(d); clearInterval(s); };
  }, []);

  return (
    <div className="terminal-loader">
      <div className="tl-header">
        <span className="tl-dot red" /><span className="tl-dot amber" /><span className="tl-dot green" />
        <span className="tl-title">sys://resume-analyzer/process</span>
      </div>
      <div className="tl-body">
        <p className="tl-line">$ INITIATING ANALYSIS SEQUENCE{dots}</p>
        <p className="tl-line active">&gt; {steps[step]}{dots}</p>
        <p className="tl-line muted">[ RAG pipeline active | model: llama 3.2 | mode: deep-scan ]</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState<{ score: number; rating: string; analysis: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!resume || !jobDesc) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_desc", jobDesc);
    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze", formData);
      setResult(response.data);
    } catch {
      setResult({ score: 0, rating: "ERROR", analysis: "Connection failed. Check your backend." });
    }
    setLoading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") setResume(file);
  };

  const ratingColor = (r: string) => {
    const map: Record<string, string> = { Excellent: "#00ffaa", Good: "#22d3ee", Average: "#f59e0b", Poor: "#ef4444", ERROR: "#ef4444" };
    return map[r] || "#00ffaa";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080b0f;
          color: #c8d8c8;
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Grid overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(${GRID_COLOR} 1px, transparent 1px),
            linear-gradient(90deg, ${GRID_COLOR} 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* Scanline */
        .scanline-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 999;
          overflow: hidden;
        }
        .scanline {
          position: absolute;
          top: -4px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(transparent, rgba(0,255,170,0.04), transparent);
          animation: scan 6s linear infinite;
        }
        @keyframes scan { from { top: -4px; } to { top: 100vh; } }

        /* Noise grain */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
          z-index: 1;
        }

        .wrap {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px 24px 80px;
        }

        /* Header */
        .header { text-align: center; margin-bottom: 64px; }
        .header-tag {
          display: inline-block;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.25em;
          color: #00ffaa;
          border: 1px solid rgba(0,255,170,0.25);
          padding: 4px 14px;
          margin-bottom: 22px;
          position: relative;
        }
        .header-tag::before, .header-tag::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: #00ffaa;
        }
        .header-tag::before { top: -3px; left: -3px; }
        .header-tag::after { bottom: -3px; right: -3px; }

        h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(42px, 7vw, 76px);
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1;
          color: #e8f0e8;
          text-transform: uppercase;
        }
        h1 em {
          font-style: normal;
          color: #00ffaa;
          text-shadow: 0 0 40px rgba(0,255,170,0.4);
        }
        .sub {
          margin-top: 16px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          color: rgba(200,216,200,0.4);
          letter-spacing: 0.1em;
        }

        /* Glitch */
        .glitch { position: relative; }
        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: #00ffaa;
        }
        .glitch::before { animation: gb 4s infinite; clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%); color: #f59e0b; opacity: 0.6; }
        .glitch::after { animation: ga 4s infinite; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); color: #22d3ee; opacity: 0.6; }
        @keyframes ga { 0%,90%,100%{transform:none;opacity:0} 91%{transform:translateX(2px);opacity:0.6} 93%{transform:translateX(-2px)} 95%{transform:none;opacity:0} }
        @keyframes gb { 0%,85%,100%{transform:none;opacity:0} 86%{transform:translateX(-3px);opacity:0.6} 89%{transform:translateX(1px)} 92%{transform:none;opacity:0} }

        /* Grid layout */
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        @media(max-width:680px) { .grid-2 { grid-template-columns: 1fr; } }

        /* Panel */
        .panel {
          background: rgba(10,16,12,0.85);
          border: 1px solid rgba(0,255,170,0.12);
          padding: 28px;
          position: relative;
          clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
          transition: border-color 0.3s;
        }
        .panel:hover { border-color: rgba(0,255,170,0.3); }
        .panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,255,170,0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        .panel-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #00ffaa;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .panel-label::before {
          content: '';
          width: 20px;
          height: 1px;
          background: #00ffaa;
          display: inline-block;
        }

        /* Drop zone */
        .dropzone {
          border: 1px dashed rgba(0,255,170,0.2);
          padding: 36px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'Share Tech Mono', monospace;
          position: relative;
          background: rgba(0,255,170,0.02);
        }
        .dropzone.active, .dropzone:hover { border-color: #00ffaa; background: rgba(0,255,170,0.06); }
        .dropzone input { display: none; }
        .dz-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.6; }
        .dz-text { font-size: 12px; color: rgba(200,216,200,0.5); margin-top: 6px; }
        .dz-file { font-size: 13px; color: #00ffaa; margin-top: 8px; }

        /* Textarea */
        textarea {
          width: 100%;
          height: 180px;
          background: rgba(0,255,170,0.02);
          border: 1px solid rgba(0,255,170,0.15);
          color: #c8d8c8;
          padding: 14px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          resize: none;
          outline: none;
          transition: border-color 0.25s;
          line-height: 1.7;
        }
        textarea::placeholder { color: rgba(200,216,200,0.25); }
        textarea:focus { border-color: rgba(0,255,170,0.4); }

        /* Button */
        .btn-analyze {
          width: 100%;
          background: transparent;
          border: 1px solid #00ffaa;
          color: #00ffaa;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          padding: 18px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
        }
        .btn-analyze::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #00ffaa;
          transform: translateX(-101%);
          transition: transform 0.3s ease;
          z-index: 0;
        }
        .btn-analyze:hover::before { transform: translateX(0); }
        .btn-analyze:hover { color: #080b0f; }
        .btn-analyze span { position: relative; z-index: 1; }
        .btn-analyze:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-analyze:disabled::before { display: none; }

        /* Terminal loader */
        .terminal-loader {
          background: #050805;
          border: 1px solid rgba(0,255,170,0.2);
          margin-top: 28px;
          overflow: hidden;
        }
        .tl-header {
          background: rgba(0,255,170,0.06);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid rgba(0,255,170,0.1);
        }
        .tl-dot { width: 10px; height: 10px; border-radius: 50%; }
        .tl-dot.red { background: #ef4444; }
        .tl-dot.amber { background: #f59e0b; }
        .tl-dot.green { background: #00ffaa; box-shadow: 0 0 8px #00ffaa; animation: blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .tl-title { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: rgba(0,255,170,0.4); margin-left: 8px; }
        .tl-body { padding: 20px 24px; }
        .tl-line { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: rgba(0,255,170,0.5); margin-bottom: 8px; }
        .tl-line.active { color: #00ffaa; }
        .tl-line.muted { font-size: 11px; color: rgba(0,255,170,0.25); margin-top: 12px; }

        /* Result panel */
        .result-wrap {
          margin-top: 28px;
          animation: fadeUp 0.5s ease forwards;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .result-grid {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 20px;
        }
        @media(max-width:680px) { .result-grid { grid-template-columns: 1fr; } }

        .result-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 20px;
        }

        .rating-box {
          text-align: center;
          font-family: 'Barlow Condensed', sans-serif;
        }
        .rating-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(200,216,200,0.3);
          display: block;
          margin-bottom: 4px;
        }
        .rating-val {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,170,0.2), transparent);
          margin: 0;
        }

        .analysis-panel {
          position: relative;
        }
        .analysis-content {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12.5px;
          line-height: 1.9;
          color: rgba(200,216,200,0.75);
          white-space: pre-wrap;
          max-height: 460px;
          overflow-y: auto;
          padding-right: 12px;
        }
        .analysis-content::-webkit-scrollbar { width: 4px; }
        .analysis-content::-webkit-scrollbar-track { background: transparent; }
        .analysis-content::-webkit-scrollbar-thumb { background: rgba(0,255,170,0.2); border-radius: 2px; }

        .corner-mark {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: rgba(0,255,170,0.4);
          border-style: solid;
        }
        .corner-mark.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .corner-mark.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
        .corner-mark.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
        .corner-mark.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        /* Stat bars */
        .stat-row { margin-top: 8px; }
        .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(0,255,170,0.4); margin-bottom: 4px; display: flex; justify-content: space-between; }
        .stat-bar { height: 2px; background: rgba(0,255,170,0.1); position: relative; }
        .stat-fill { height: 100%; background: #00ffaa; transition: width 1.5s ease; box-shadow: 0 0 6px #00ffaa; }
      `}</style>

      <ScanLine />

      <div className="wrap">
        {/* HEADER */}
        <header className="header">
          <div className="header-tag">RAG · SEMANTIC · AI-POWERED</div>
          <h1>
            <GlitchText text="RESUME" />{" "}
            <em>ANALYZER</em>
          </h1>
          <p className="sub">MATCH YOUR PROFILE AGAINST ANY JOB DESCRIPTION IN SECONDS</p>
        </header>

        {/* INPUTS */}
        <div className="grid-2">
          {/* Upload */}
          <div className="panel">
            <div className="corner-mark tl"/><div className="corner-mark tr"/>
            <div className="corner-mark bl"/><div className="corner-mark br"/>
            <p className="panel-label">RESUME PDF</p>
            <div
              className={`dropzone ${dragOver ? "active" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setResume(e.target.files?.[0] || null)} />
              <div className="dz-icon">📄</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: resume ? "#00ffaa" : "rgba(200,216,200,0.5)" }}>
                {resume ? "FILE LOADED" : "DROP PDF HERE"}
              </div>
              <div className="dz-text">{resume ? "" : "or click to select"}</div>
              {resume && <div className="dz-file">{resume.name}</div>}
            </div>
          </div>

          {/* Job desc */}
          <div className="panel">
            <div className="corner-mark tl"/><div className="corner-mark tr"/>
            <div className="corner-mark bl"/><div className="corner-mark br"/>
            <p className="panel-label">JOB DESCRIPTION</p>
            <textarea
              placeholder="PASTE TARGET JOB DESCRIPTION HERE..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          className="btn-analyze"
          onClick={handleAnalyze}
          disabled={loading || !resume || !jobDesc}
        >
          <span>{loading ? "PROCESSING..." : "▶  RUN ANALYSIS"}</span>
        </button>

        {/* LOADER */}
        {loading && <TerminalLoader />}

        {/* RESULT */}
        {result && !loading && (
          <div className="result-wrap">
            <div className="panel">
              <div className="corner-mark tl"/><div className="corner-mark tr"/>
              <div className="corner-mark bl"/><div className="corner-mark br"/>
              <p className="panel-label">OUTPUT / ANALYSIS REPORT</p>

              <div className="result-grid">
                <div className="result-left">
                  <RadarRing score={result.score} />

                  <div className="rating-box">
                    <span className="rating-label">CLASSIFICATION</span>
                    <span className="rating-val" style={{ color: ratingColor(result.rating) }}>
                      {result.rating}
                    </span>
                  </div>

                  <div className="divider" />

                  <div style={{ width: "100%" }}>
                    {[
                      { label: "SKILL MATCH", val: result.score },
                      { label: "KEYWORD DENSITY", val: Math.min(100, result.score + 8) },
                      { label: "ATS COMPAT", val: Math.max(0, result.score - 5) },
                    ].map((s) => (
                      <div className="stat-row" key={s.label}>
                        <div className="stat-label"><span>{s.label}</span><span>{s.val}%</span></div>
                        <div className="stat-bar">
                          <div className="stat-fill" style={{ width: `${s.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analysis-panel">
                  <div className="analysis-content">{result.analysis}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}