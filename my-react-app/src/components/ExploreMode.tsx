import React, { useState, useEffect } from 'react';

interface GermanWord {
  German: string;
  English: string;
  Category: string;
  Frequency: number;
  German_Phrase?: string;
  English_Phrase?: string;
}

interface ExploreModeProps {
  onBack: () => void;
}

const ExploreMode: React.FC<ExploreModeProps> = ({ onBack }) => {
  const [vocabulary, setVocabulary] = useState<GermanWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredWords, setFilteredWords] = useState<GermanWord[]>([]);

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    if (vocabulary.length > 0) {
      filterWords();
    }
  }, [selectedCategory, vocabulary]);

  const loadVocabulary = async () => {
    try {
      const response = await fetch('/data/german_phrases_vocabulary.csv');
      const csvText = await response.text();
      
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
              Frequency: parseInt(values[3]) || i,
              German_Phrase: values[4] || '',
              English_Phrase: values[5] || ''
            });
          }
        }
      }
      
      setVocabulary(data);
      setFilteredWords(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading vocabulary:', err);
      setLoading(false);
    }
  };

  const filterWords = () => {
    if (selectedCategory === 'all') {
      setFilteredWords(vocabulary);
    } else {
      setFilteredWords(vocabulary.filter(word => word.Category === selectedCategory));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const shuffleCards = () => {
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    setFilteredWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  const currentWord = filteredWords[currentIndex];
  const categories = ['all', ...Array.from(new Set(vocabulary.map(w => w.Category)))];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1 sm:p-2 md:p-4 relative overflow-hidden overflow-y-auto">
      {/* Medieval Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 text-2xl sm:text-4xl md:text-8xl">🗡️</div>
        <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 text-xl sm:text-3xl md:text-6xl">📜</div>
        <div className="absolute top-1/2 left-5 sm:left-10 text-lg sm:text-2xl md:text-5xl">⚔️</div>
        <div className="absolute top-1/3 right-5 sm:right-10 text-lg sm:text-2xl md:text-4xl">🏰</div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <button
            onClick={onBack}
            className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 border border-amber-400 text-sm sm:text-base"
          >
            <span className="mr-2 text-lg sm:text-xl">←</span>
            <span className="font-serif">Return to Quest</span>
          </button>
          <div className="text-center order-first sm:order-none">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-200 font-serif">🗡️ EXPLORE Mode</h1>
            <div className="text-amber-300/80 text-xs sm:text-sm font-mono">
              Journey through the ancient lexicon
            </div>
          </div>
          <div className="text-amber-200 font-mono text-xs sm:text-sm bg-slate-800/50 px-3 sm:px-4 py-2 rounded-lg border border-amber-400/30">
            Scroll {currentIndex + 1} of {filteredWords.length}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg sm:text-xl text-amber-200 font-serif">Choose Your Path</h3>
            <p className="text-amber-300/70 text-xs sm:text-sm">Select a category to explore</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border-2 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg border-amber-400'
                    : 'bg-slate-800/50 text-amber-200 hover:bg-slate-700/50 border-amber-400/30 hover:border-amber-400/60'
                }`}
              >
                {category === 'all' ? '⚜️ All' : `📜 ${category}`}
              </button>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="flex justify-center mb-6 sm:mb-8 px-4">
          <div className="card-container w-full max-w-sm sm:max-w-lg">
            <div
              className={`card-flip w-full h-64 sm:h-80 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
              onClick={flipCard}
            >
              {/* Front of Card */}
              <div className="card-face">
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 h-full flex flex-col justify-center items-center border-4 border-amber-300 relative overflow-hidden">
                  {/* Medieval Card Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-lg sm:text-2xl">⚜️</div>
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-sm sm:text-xl">🗡️</div>
                    <div className="absolute top-1/2 left-2 sm:left-4 text-xs sm:text-lg">📜</div>
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <div className="mb-3 sm:mb-6">
                      <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-amber-200 text-amber-800 border border-amber-300">
                        📜 {currentWord?.Category}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-bold text-slate-800 mb-3 sm:mb-6 text-center font-serif">
                      {currentWord?.German}
                    </h2>
                    {currentWord?.German_Phrase && (
                      <div className="mb-3 sm:mb-4">
                        <p className="text-slate-700 text-center font-serif text-sm sm:text-base italic">
                          "{currentWord.German_Phrase}"
                        </p>
                      </div>
                    )}
                    <p className="text-slate-600 text-center mb-2 sm:mb-4 font-serif text-xs sm:text-base">
                      Touch the ancient scroll to reveal its secret
                    </p>
                    <div className="text-xs sm:text-sm text-amber-600 font-mono bg-amber-100 px-2 sm:px-3 py-1 rounded-full">
                      Scroll #{currentWord?.Frequency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div className="card-face card-back">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 h-full flex flex-col justify-center items-center text-white relative overflow-hidden">
                  {/* Medieval Card Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-lg sm:text-2xl">⚔️</div>
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-sm sm:text-xl">🏆</div>
                    <div className="absolute top-1/2 right-2 sm:right-4 text-xs sm:text-lg">👑</div>
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <div className="mb-3 sm:mb-6">
                      <span className="px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-white/20 text-white border border-white/30">
                        📜 {currentWord?.Category}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-6 text-center font-serif">
                      {currentWord?.English}
                    </h2>
                    <p className="text-white/90 text-center mb-3 sm:mb-6 font-serif text-sm sm:text-lg">
                      {currentWord?.German}
                    </p>
                    {currentWord?.English_Phrase && (
                      <div className="mb-3 sm:mb-4">
                        <p className="text-white/95 text-center font-serif text-sm sm:text-base italic">
                          "{currentWord.English_Phrase}"
                        </p>
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-white/70 font-mono bg-white/10 px-2 sm:px-3 py-1 rounded-full">
                      Ancient Scroll #{currentWord?.Frequency}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-6 sm:mb-8 px-4">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-slate-600 font-serif text-sm sm:text-base"
          >
            ← Previous Scroll
          </button>
          
          <button
            onClick={flipCard}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-bold text-base sm:text-lg border border-amber-400"
          >
            {isFlipped ? '🔍 Show German' : '📜 Reveal Secret'}
          </button>
          
          <button
            onClick={nextCard}
            disabled={currentIndex === filteredWords.length - 1}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-slate-600 font-serif text-sm sm:text-base"
          >
            Next Scroll →
          </button>
        </div>

        {/* Additional Controls */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8 px-4">
          <button
            onClick={shuffleCards}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-lg hover:from-purple-700 hover:to-violet-800 transition-all duration-300 border border-purple-400 font-serif text-sm sm:text-base"
          >
            🔀 Shuffle Scrolls
          </button>
          
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-600 to-slate-700 text-white rounded-lg hover:from-gray-700 hover:to-slate-800 transition-all duration-300 border border-gray-500 font-serif text-sm sm:text-base"
          >
            🔄 Return to Start
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <h3 className="text-lg text-amber-200 font-serif">Quest Progress</h3>
          </div>
          <div className="bg-slate-800/50 rounded-full h-3 shadow-inner border border-amber-400/30">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((currentIndex + 1) / filteredWords.length) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-3 text-amber-200 font-mono">
            {Math.round(((currentIndex + 1) / filteredWords.length) * 100)}% Complete • {filteredWords.length - currentIndex - 1} scrolls remaining
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreMode;
