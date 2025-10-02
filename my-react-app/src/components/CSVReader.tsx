import React, { useState, useEffect } from 'react';

interface GermanWord {
  German: string;
  English: string;
  Category: string;
  Frequency: number;
}

const CSVReader: React.FC = () => {
  const [vocabulary, setVocabulary] = useState<GermanWord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedWord, setSelectedWord] = useState<GermanWord | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadCSVData();
  }, []);

  const loadCSVData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/data/german_english_vocabulary.csv');
      const csvText = await response.text();
      
      // Parse CSV
      const lines = csvText.split('\n');
      const data: GermanWord[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(',');
          if (values.length >= 4) {
            data.push({
              German: values[0],
              English: values[1],
              Category: values[2],
              Frequency: parseInt(values[3]) || i
            });
          }
        }
      }
      
      setVocabulary(data);
      setLoading(false);
    } catch (err) {
      setError('Error loading CSV file: ' + (err as Error).message);
      setLoading(false);
    }
  };

  const filteredVocabulary = vocabulary.filter((word) => {
    if (!searchTerm) return true;
    return (
      word.German.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.English.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.Category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredVocabulary.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = filteredVocabulary.slice(startIndex, endIndex);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Article': 'bg-blue-100 text-blue-800',
      'Noun': 'bg-green-100 text-green-800',
      'Verb': 'bg-red-100 text-red-800',
      'Adjective': 'bg-purple-100 text-purple-800',
      'Adverb': 'bg-yellow-100 text-yellow-800',
      'Preposition': 'bg-indigo-100 text-indigo-800',
      'Conjunction': 'bg-pink-100 text-pink-800',
      'Pronoun': 'bg-orange-100 text-orange-800',
      'Number': 'bg-gray-100 text-gray-800',
      'Reflexive': 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading German vocabulary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🇩🇪 German Vocabulary
            </h1>
            <p className="text-gray-600 text-lg">
              500 Most Used German Words with English Translations
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search German or English words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-600">
              Showing {filteredVocabulary.length} of {vocabulary.length} words
            </div>
          </div>

          {/* Vocabulary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {currentWords.map((word, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedWord(word)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-gray-500 font-medium">#{word.Frequency}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(word.Category)}`}>
                    {word.Category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {word.German}
                </h3>
                <p className="text-gray-600 text-sm">
                  {word.English}
                </p>
                <div className="mt-3 text-xs text-blue-600 font-medium">
                  Click to view details
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mb-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                ← Previous
              </button>
              
              <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📊 Vocabulary Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{vocabulary.length}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{filteredVocabulary.length}</div>
                <div className="text-sm text-gray-600">Filtered Results</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{new Set(vocabulary.map(w => w.Category)).size}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Word Detail Modal */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedWord.Category)}`}>
                  {selectedWord.Category}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedWord.German}
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                {selectedWord.English}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Frequency Rank: #{selectedWord.Frequency}
              </p>
              <button
                onClick={() => setSelectedWord(null)}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVReader;

