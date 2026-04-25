"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resume || !jobDesc) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_desc", jobDesc);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/analyze",
        formData
      );

      setResult(response.data); // 🔥 store full object
    } catch (err) {
      setResult({
        score: 0,
        rating: "Error",
        analysis: "Error analyzing resume."
      });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* TITLE */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
            AI Resume Analyzer
          </h1>
          <p className="text-gray-400 text-lg">
            Analyze your resume against any job description using AI - RAG
          </p>
        </div>

        {/* INPUT SECTION */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* UPLOAD RESUME */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-500">
              UPLOAD RESUME
            </h2>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800"
            />
          </div>

          {/* JOB DESCRIPTION */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-500">
              JOB DESCRIPTION
            </h2>

            <textarea
              placeholder="Paste the target job description..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full h-48 rounded-lg p-4 bg-gray-800 border border-gray-700 resize-none"
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-4 text-lg font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {/* RESULT SECTION */}
        {result && (
          <div className="mt-10 bg-gray-900 rounded-2xl p-6 shadow-lg">

            <h2 className="text-2xl font-semibold mb-6">
              Analysis Result
            </h2>

            {/* SCORE BAR */}
            <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
              <div
                className="h-3 rounded-full bg-green-500"
                style={{ width: `${result.score}%` }}
              />
            </div>

            {/* SCORE */}
            <p className="text-lg mb-2">
              <span className="text-gray-400">Score:</span>{" "}
              <span className="text-green-400 font-bold">
                {result.score}/100
              </span>
            </p>

            {/* RATING */}
            <p className="text-lg mb-4">
              <span className="text-gray-400">Rating:</span>{" "}
              <span className="text-blue-400 font-bold">
                {result.rating}
              </span>
            </p>

            {/* ANALYSIS */}
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {result.analysis}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}