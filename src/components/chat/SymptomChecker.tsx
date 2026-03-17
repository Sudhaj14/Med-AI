'use client';

import { useState } from 'react';

interface SymptomResult {
  symptoms: string[];
  analysis: string;
  suggestedConditions: string[];
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState('');

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptomsArray }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Failed to analyze symptoms');
      }
    } catch (error) {
      setError('An error occurred while analyzing symptoms');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl text-black font-semibold mb-4">Symptom Checker</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-black  text-sm font-medium mb-2">
            Enter your symptoms (comma-separated)
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., headache, fever, nausea, fatigue"
            className="w-full px-3 py-2 text-black  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <button
          onClick={analyzeSymptoms}
          disabled={isAnalyzing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>

        {result && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Analysis</h3>
              <p className="text-gray-700">{result.analysis}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Severity</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                {result.severity.toUpperCase()}
              </span>
            </div>

            {result.suggestedConditions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Possible Conditions</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {result.suggestedConditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-4">
              <p>⚠️ This is not medical advice. Please consult a healthcare professional for proper diagnosis.</p>
              <p>Analyzed on: {new Date(result.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
