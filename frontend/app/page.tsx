"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState("");
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

      setResult(response.data.analysis);
    } catch (err) {
      setResult("Error analyzing resume.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            AI Resume Analyzer
          </h1>
          <p className="text-gray-400 text-lg">
            Analyze your resume against any job description using AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Upload Resume
            </h2>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setResume(e.target.files?.[0] || null)
              }
              className="w-full border border-gray-700 rounded-lg p-3 bg-gray-800"
            />
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Job Description
            </h2>

            <textarea
              placeholder="Paste the target job description..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full h-48 rounded-lg p-4 bg-gray-800 border border-gray-700 resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-4 text-lg font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {result && (
          <div className="mt-10 bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Analysis Result
            </h2>
            <pre className="whitespace-pre-wrap text-gray-300">
              {result}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}