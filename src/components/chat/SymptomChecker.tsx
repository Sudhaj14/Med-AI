'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SymptomResult {
  symptoms: string[];
  analysis: string;
  suggestedConditions: string[];
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function SymptomChecker() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState('');

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError(t('pleaseEnterSymptoms', 'Please enter your symptoms'));
      return;
    }

    setIsAnalyzing(true);
    try {
      const symptomsArray = symptoms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomsArray }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        // Store symptoms for appointment booking
        localStorage.setItem('recentSymptoms', JSON.stringify(symptomsArray));
        
        // Store recommended doctor specialization
        if (data.suggestedConditions && data.suggestedConditions.length > 0) {
          let recommendedSpecialization = 'General Practitioner';
          
          // Simple mapping of conditions to specializations
          const conditionToSpecialization: { [key: string]: string } = {
            'heart': 'Cardiologist',
            'skin': 'Dermatologist',
            'brain': 'Neurologist',
            'child': 'Pediatrician',
            'stomach': 'Gastroenterologist',
            'bone': 'Orthopedic',
            'mental': 'Psychiatrist',
          };
          
          const conditions = data.suggestedConditions.join(' ').toLowerCase();
          for (const [key, specialization] of Object.entries(conditionToSpecialization)) {
            if (conditions.includes(key)) {
              recommendedSpecialization = specialization;
              break;
            }
          }
          
          localStorage.setItem('recommendedDoctor', recommendedSpecialization);
        }
        
        // Show appointment suggestion
        setTimeout(() => {
          if (confirm(t('bookAfterSymptomSuggestion', 'Based on your symptoms, would you like to book an appointment with a recommended doctor?'))) {
            window.location.href = '/book-appointment';
          }
        }, 2000);
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.error || t('failedToAnalyzeSymptoms', 'Failed to analyze symptoms. Please try again.'));
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setError(t('failedToAnalyzeSymptoms', 'Failed to analyze symptoms. Please try again.'));
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
      <h2 className="text-xl text-black font-semibold mb-4">{t('symptomChecker', 'Symptom Checker')}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-black  text-sm font-medium mb-2">
            {t('enterSymptomsCommaSeparated', 'Enter your symptoms (comma-separated)')}
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t('symptomsPlaceholder', 'e.g., headache, fever, nausea, fatigue')}
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
          {isAnalyzing ? t('analyzing', 'Analyzing...') : t('analyzeSymptoms', 'Analyze Symptoms')}
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
