import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface GermanWord {
  german: string;
  english: string;
  frequency?: number;
}

const GermanVocabulary: React.FC = () => {
  const [vocabulary, setVocabulary] = useState<GermanWord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedWord, setSelectedWord] = useState<GermanWord | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/data/german-word-list-total.xls');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Convert the data to German-English pairs
      const vocabularyData: GermanWord[] = [];
      
      if (jsonData.length > 0) {
        const firstRow = jsonData[0] as any;
        const columns = Object.keys(firstRow);
        
        // Try to identify German and English columns
        let germanColumn = '';
        let englishColumn = '';
        
        // Look for common column names
        for (const col of columns) {
          const colLower = col.toLowerCase();
          if (colLower.includes('german') || colLower.includes('deutsch') || colLower.includes('word')) {
            germanColumn = col;
          }
          if (colLower.includes('english') || colLower.includes('translation') || colLower.includes('meaning')) {
            englishColumn = col;
          }
        }
        
        // If we can't find specific columns, use the first two columns
        if (!germanColumn || !englishColumn) {
          germanColumn = columns[0];
          englishColumn = columns[1] || columns[0];
        }
        
        // Extract vocabulary pairs
        jsonData.forEach((row: any, index: number) => {
          const german = String(row[germanColumn] || '').trim();
          const english = String(row[englishColumn] || '').trim();
          
          if (german && english && german !== english) {
            vocabularyData.push({
              german,
              english,
              frequency: index + 1
            });
          }
        });
      }
      
      // Limit to 500 words as requested
      setVocabulary(vocabularyData.slice(0, 500));
      setLoading(false);
    } catch (err) {
      setError('Error loading vocabulary: ' + (err as Error).message);
      setLoading(false);
    }
  };

  const filteredVocabulary = vocabulary.filter((word) => {
    if (!searchTerm) return true;
    return (
      word.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.english.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredVocabulary.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = filteredVocabulary.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading German vocabulary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🇩🇪 German Vocabulary - 500 Most Used Words
        </h1>
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search German or English words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredVocabulary.length} of {vocabulary.length} words
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentWords.map((word, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedWord(word)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500">#{word.frequency}</span>
                <span className="text-xs text-blue-600">Click to view</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {word.german}
              </h3>
              <p className="text-gray-600">
                {word.english}
              </p>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">📊 Vocabulary Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Words:</span> {vocabulary.length}
            </div>
            <div>
              <span className="font-medium">Filtered Results:</span> {filteredVocabulary.length}
            </div>
            <div>
              <span className="font-medium">Current Page:</span> {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Word Detail Modal */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedWord.german}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {selectedWord.english}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Frequency Rank: #{selectedWord.frequency}
              </p>
              <button
                onClick={() => setSelectedWord(null)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

export default GermanVocabulary;

