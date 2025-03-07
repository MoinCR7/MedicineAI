import React, { useState, useEffect } from 'react';
import { Stethoscope, Loader2, SendHorizontal, AlertCircle, Pill, Utensils, Activity, ShieldAlert, FileText } from 'lucide-react';
import axios from 'axios';

interface DataInfo {
  [key: string]: {
    rows: number;
    columns: string[];
  };
}

interface PredictionResult {
  disease: string;
  description: string;
  precautions: string[];
  medications: string[];
  diet: string[];
  workouts: string[];
}

function App() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/predict', {
        input: symptoms
      });
      
      setResult(response.data.result);
    } catch (error) {
      console.error('Error processing symptoms:', error);
      setError('An error occurred while analyzing your symptoms. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-12">
          <Stethoscope className="w-12 h-12 text-teal-400 mr-4" />
          <h1 className="text-4xl font-bold">Medical Diagnosis Assistant</h1>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 shadow-xl border border-teal-700/30">
            {/* Input Form */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-teal-300">Symptom Analysis</h2>
              <p className="text-gray-300 mb-4">
                Enter your symptoms below, separated by commas (e.g., itching, skin_rash, nodal_skin_eruptions)
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-gray-700/50 border border-teal-600/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-white placeholder-gray-400"
                    placeholder="Enter your symptoms here..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading || !symptoms.trim()}
                    className="flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800/50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="w-5 h-5 mr-2" />
                        Analyze Symptoms
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-8 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="space-y-8">
                <div className="border-b border-teal-700/30 pb-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-teal-400 mr-2" />
                    <h3 className="text-xl font-semibold text-teal-300">Diagnosis</h3>
                  </div>
                  <h4 className="text-2xl font-bold mb-3 text-white">{result.disease}</h4>
                  <p className="text-gray-300">{result.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Precautions */}
                  <div className="bg-gray-800/30 rounded-lg p-6 border border-teal-700/20">
                    <div className="flex items-center mb-4">
                      <ShieldAlert className="w-5 h-5 text-teal-400 mr-2" />
                      <h3 className="text-lg font-semibold text-teal-300">Precautions</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.precautions.map((precaution, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="mr-2">•</span>
                          {precaution}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Medications */}
                  <div className="bg-gray-800/30 rounded-lg p-6 border border-teal-700/20">
                    <div className="flex items-center mb-4">
                      <Pill className="w-5 h-5 text-teal-400 mr-2" />
                      <h3 className="text-lg font-semibold text-teal-300">Medications</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.medications.map((medication, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="mr-2">•</span>
                          {medication}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Diet Recommendations */}
                  <div className="bg-gray-800/30 rounded-lg p-6 border border-teal-700/20">
                    <div className="flex items-center mb-4">
                      <Utensils className="w-5 h-5 text-teal-400 mr-2" />
                      <h3 className="text-lg font-semibold text-teal-300">Diet Recommendations</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.diet.map((diet, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="mr-2">•</span>
                          {diet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Workout Recommendations */}
                  <div className="bg-gray-800/30 rounded-lg p-6 border border-teal-700/20">
                    <div className="flex items-center mb-4">
                      <Activity className="w-5 h-5 text-teal-400 mr-2" />
                      <h3 className="text-lg font-semibold text-teal-300">Exercise Recommendations</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.workouts.map((workout, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="mr-2">•</span>
                          {workout}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-red-900/20 rounded-xl p-6 border border-red-700/30">
            <h2 className="text-xl font-semibold mb-4 text-red-300">Important Medical Disclaimer</h2>
            <p className="text-gray-300">
              This tool is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;