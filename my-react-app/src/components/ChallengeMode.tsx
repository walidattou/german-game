import React, { useState, useEffect, useCallback } from 'react';

interface GermanWord {
  German: string;
  English: string;
  Category: string;
  Frequency: number;
  German_Phrase?: string;
  English_Phrase?: string;
}

interface ChallengeModeProps {
  onBack: () => void;
}

interface PerformanceData {
  word: GermanWord;
  attempts: number;
  correct: number;
  wrong: number;
  consecutiveWrong: number;
  lastSeen: number;
  priority: number; // Higher priority = more likely to appear
}

const ChallengeMode: React.FC<ChallengeModeProps> = ({ onBack }) => {
  const [vocabulary, setVocabulary] = useState<GermanWord[]>([]);
  const [currentWord, setCurrentWord] = useState<GermanWord | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [performance, setPerformance] = useState<Map<string, PerformanceData>>(new Map());
  const [selectedSet, setSelectedSet] = useState<string>('all');
  const [filteredWords, setFilteredWords] = useState<GermanWord[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongWords, setWrongWords] = useState<GermanWord[]>([]);
  const [correctWords, setCorrectWords] = useState<GermanWord[]>([]);
  const [currentWordQueue, setCurrentWordQueue] = useState<GermanWord[]>([]);
  const [loading, setLoading] = useState(true);

  const wordSets = [
    { id: 'all', name: 'All Words', description: 'Complete vocabulary challenge (500 words)' },
    { id: 'set1', name: 'Set 1', description: 'Words 1-25 (Most Common)' },
    { id: 'set2', name: 'Set 2', description: 'Words 26-50 (High Frequency)' },
    { id: 'set3', name: 'Set 3', description: 'Words 51-75 (Essential)' },
    { id: 'set4', name: 'Set 4', description: 'Words 76-100 (Important)' },
    { id: 'set5', name: 'Set 5', description: 'Words 101-125 (Common)' },
    { id: 'set6', name: 'Set 6', description: 'Words 126-150 (Useful)' },
    { id: 'set7', name: 'Set 7', description: 'Words 151-175 (Practical)' },
    { id: 'set8', name: 'Set 8', description: 'Words 176-200 (Everyday)' },
    { id: 'set9', name: 'Set 9', description: 'Words 201-225 (Basic)' },
    { id: 'set10', name: 'Set 10', description: 'Words 226-250 (Standard)' },
    { id: 'set11', name: 'Set 11', description: 'Words 251-275 (Regular)' },
    { id: 'set12', name: 'Set 12', description: 'Words 276-300 (Typical)' },
    { id: 'set13', name: 'Set 13', description: 'Words 301-325 (Normal)' },
    { id: 'set14', name: 'Set 14', description: 'Words 326-350 (Standard)' },
    { id: 'set15', name: 'Set 15', description: 'Words 351-375 (Common)' },
    { id: 'set16', name: 'Set 16', description: 'Words 376-400 (Useful)' },
    { id: 'set17', name: 'Set 17', description: 'Words 401-425 (Practical)' },
    { id: 'set18', name: 'Set 18', description: 'Words 426-450 (Everyday)' },
    { id: 'set19', name: 'Set 19', description: 'Words 451-475 (Basic)' },
    { id: 'set20', name: 'Set 20', description: 'Words 476-500 (Complete)' }
  ];

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    if (vocabulary.length > 0) {
      filterWords();
    }
  }, [selectedSet, vocabulary]);

  const loadVocabulary = async () => {
    try {
      const response = await fetch('/data/german_english_vocabulary.csv');
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
      setLoading(false);
      console.log(`Loaded ${data.length} words from vocabulary`);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      setLoading(false);
    }
  };

  const filterWords = () => {
    let filtered: GermanWord[] = [];
    
    if (selectedSet === 'all') {
      filtered = vocabulary;
    } else {
      // Get words by frequency order (sets of 25)
      const sortedVocabulary = [...vocabulary].sort((a, b) => a.Frequency - b.Frequency);
      
      // Extract set number from selectedSet (e.g., 'set5' -> 5)
      const setNumber = parseInt(selectedSet.replace('set', ''));
      
      if (setNumber >= 1 && setNumber <= 20) {
        const startIndex = (setNumber - 1) * 25;
        const endIndex = startIndex + 25;
        filtered = sortedVocabulary.slice(startIndex, endIndex);
      } else {
        filtered = vocabulary;
      }
    }
    
    console.log(`Filtered ${filtered.length} words for set: ${selectedSet}`);
    setFilteredWords(filtered);
  };

  const createWeightedWordQueue = () => {
    const weightedWords: GermanWord[] = [];
    
    // Add each word multiple times based on its priority
    filteredWords.forEach(word => {
      const wordKey = word.German;
      const perf = performance.get(wordKey);
      
      if (perf) {
        // Calculate priority based on consecutive wrong answers
        const priority = Math.max(1, perf.consecutiveWrong * 2 + 1);
        
        // Add the word multiple times to the queue based on priority
        for (let i = 0; i < priority; i++) {
          weightedWords.push(word);
        }
      } else {
        // New words get base priority
        weightedWords.push(word);
      }
    });
    
    // Shuffle the weighted queue
    const shuffled = weightedWords.sort(() => Math.random() - 0.5);
    setCurrentWordQueue(shuffled);
    
    return shuffled;
  };

  const startChallenge = () => {
    console.log(`Starting challenge with ${filteredWords.length} words`);
    
    if (filteredWords.length === 0) {
      console.error('No words available for challenge');
      alert('No words available for this set. Please select a different set.');
      return;
    }
    
    setGameActive(true);
    setGameFinished(false);
    setCurrentIndex(0);
    setWrongWords([]);
    setCorrectWords([]);
    
    // Create weighted queue and start with first word
    const queue = createWeightedWordQueue();
    console.log(`Created queue with ${queue.length} words`);
    
    if (queue.length > 0) {
      setCurrentWord(queue[0]);
      setIsFlipped(false);
    } else {
      console.error('Failed to create word queue');
      alert('Failed to start challenge. Please try again.');
      setGameActive(false);
    }
  };

  const checkAnswer = useCallback(() => {
    if (!currentWord || !userAnswer.trim()) return;

    const userAnswerLower = userAnswer.toLowerCase().trim();
    const correctAnswerLower = currentWord.English.toLowerCase().trim();
    
    const correct = userAnswerLower === correctAnswerLower;
    setIsCorrect(correct);
    setShowResult(true);

    // Update performance tracking
    const wordKey = currentWord.German;
    const currentPerf = performance.get(wordKey) || {
      word: currentWord,
      attempts: 0,
      correct: 0,
      wrong: 0,
      consecutiveWrong: 0,
      lastSeen: Date.now(),
      priority: 1
    };

    currentPerf.attempts++;
    if (correct) {
      currentPerf.correct++;
      currentPerf.consecutiveWrong = 0; // Reset consecutive wrong count
      currentPerf.priority = 1; // Reset priority
      setCorrectWords(prev => [...prev, currentWord]);
    } else {
      currentPerf.wrong++;
      currentPerf.consecutiveWrong++; // Increment consecutive wrong count
      currentPerf.priority = Math.max(1, currentPerf.consecutiveWrong * 2 + 1); // Increase priority
      setWrongWords(prev => [...prev, currentWord]);
    }
    currentPerf.lastSeen = Date.now();

    setPerformance(prev => new Map(prev.set(wordKey, currentPerf)));

    // Only auto-advance if correct, wrong answers stay on screen
    if (correct) {
      setTimeout(() => {
        nextCard();
      }, 1500);
    }
  }, [currentWord, userAnswer, performance]);

  const nextCard = () => {
    setShowResult(false);
    setUserAnswer('');
    
    if (currentIndex < currentWordQueue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentWord(currentWordQueue[nextIndex]);
      setIsFlipped(false);
    } else {
      // Regenerate queue with updated priorities and continue
      const newQueue = createWeightedWordQueue();
      if (newQueue.length > 0) {
        setCurrentIndex(0);
        setCurrentWord(newQueue[0]);
        setIsFlipped(false);
      } else {
        finishChallenge();
      }
    }
  };

  const finishChallenge = () => {
    setGameActive(false);
    setGameFinished(true);
    setCurrentWord(null);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // No timer needed - unlimited time mode

  const getMostMissedWords = () => {
    const missedWords = Array.from(performance.values())
      .filter(perf => perf.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 5);
    
    return missedWords;
  };

  if (gameFinished) {
    const mostMissed = getMostMissedWords();
    
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1 sm:p-2 md:p-4 relative overflow-hidden overflow-y-auto">
        {/* Medieval Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 sm:top-20 sm:left-20 text-2xl sm:text-4xl md:text-8xl">🏆</div>
          <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 text-xl sm:text-3xl md:text-6xl">⚔️</div>
          <div className="absolute top-1/2 left-5 sm:left-10 text-lg sm:text-2xl md:text-5xl">👑</div>
          <div className="absolute top-1/3 right-5 sm:right-10 text-lg sm:text-2xl md:text-4xl">📜</div>
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
            
             <div className="text-center">
               <h1 className="text-2xl sm:text-4xl font-bold text-amber-400 font-serif">
                 🏆 Training Complete! 🏆
               </h1>
               <p className="text-amber-200 text-sm sm:text-base">
                 Your training session results
               </p>
             </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-4 sm:p-6 text-white text-center">
              <div className="text-3xl sm:text-4xl mb-2">✅</div>
              <div className="text-2xl sm:text-3xl font-bold">{correctWords.length}</div>
              <div className="text-sm sm:text-base">Correct</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-xl p-4 sm:p-6 text-white text-center">
              <div className="text-3xl sm:text-4xl mb-2">❌</div>
              <div className="text-2xl sm:text-3xl font-bold">{wrongWords.length}</div>
              <div className="text-sm sm:text-base">Missed</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white text-center">
              <div className="text-3xl sm:text-4xl mb-2">📊</div>
              <div className="text-2xl sm:text-3xl font-bold">
                {filteredWords.length > 0 ? Math.round((correctWords.length / filteredWords.length) * 100) : 0}%
              </div>
              <div className="text-sm sm:text-base">Accuracy</div>
            </div>
          </div>

          {/* Most Missed Words */}
          {mostMissed.length > 0 && (
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-8">
               <h3 className="text-xl sm:text-2xl font-bold text-amber-200 mb-4 text-center font-serif">
                 🎯 Words to Train More
               </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {mostMissed.map((perf, index) => (
                  <div key={index} className="bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg p-3 sm:p-4 border border-red-400/30">
                    <div className="text-white font-bold text-sm sm:text-base">{perf.word.German}</div>
                    <div className="text-amber-200 text-xs sm:text-sm">{perf.word.English}</div>
                    <div className="text-red-300 text-xs">Missed {perf.wrong} times</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button
               onClick={startChallenge}
               className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-bold text-base sm:text-lg border border-amber-400"
             >
               🔄 Train Again
             </button>
            
            <button
              onClick={onBack}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-bold text-base sm:text-lg border border-slate-500"
            >
              🏰 Back to Quest
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-amber-200 text-xl font-serif">Loading vocabulary...</div>
        </div>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1 sm:p-2 md:p-4 relative overflow-hidden overflow-y-auto">
        {/* Subtle Medieval Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-4xl sm:text-6xl">🏰</div>
          <div className="absolute top-10 right-10 text-4xl sm:text-6xl">🏰</div>
          <div className="absolute bottom-10 left-10 text-3xl sm:text-5xl">🏰</div>
          <div className="absolute bottom-10 right-10 text-3xl sm:text-5xl">🏰</div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
          {/* Clean Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-6">
            <button
              onClick={onBack}
              className="flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl shadow-xl hover:shadow-2xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 border-2 border-amber-400 text-sm sm:text-base font-serif"
            >
              <span className="mr-2">←</span>
              <span>Back to Menu</span>
            </button>
            
            <div className="text-center flex-1">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent text-4xl sm:text-6xl font-bold mb-2 font-serif">
                TRAINING GROUND
              </div>
              <div className="text-amber-200 text-lg sm:text-xl font-serif">
                German Vocabulary Practice
              </div>
              <div className="text-amber-300/80 text-sm sm:text-base mt-1">
                Master German words through focused training
              </div>
            </div>
            
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Word Set Selection */}
          <div className="mb-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl text-amber-200 font-serif mb-2">Choose Your Training Set</h3>
              <p className="text-amber-300/70 text-sm sm:text-base">Select the vocabulary range you want to train with</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {wordSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSet(set.id)}
                  className={`group relative p-4 sm:p-5 rounded-xl text-left transition-all duration-300 border-2 ${
                    selectedSet === set.id
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl border-amber-400'
                      : 'bg-gradient-to-br from-slate-800/60 to-slate-700/60 text-amber-200 hover:bg-gradient-to-br hover:from-slate-700/60 hover:to-slate-600/60 border-amber-400/40 hover:border-amber-400/70 hover:shadow-lg'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="font-bold text-sm sm:text-base font-serif mb-2">{set.name}</div>
                    <div className="text-xs sm:text-sm opacity-80 leading-relaxed">{set.description}</div>
                    {selectedSet === set.id && (
                      <div className="mt-2 text-xs font-bold text-amber-100">
                        SELECTED
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Info */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-10 shadow-2xl border border-amber-400/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-200 font-serif mb-2">
                Training Features
              </h3>
              <p className="text-amber-300/70 text-sm sm:text-base">Master German vocabulary with these training methods</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl border border-green-400/30">
                <div className="text-2xl sm:text-3xl">⏰</div>
                <div>
                  <div className="text-green-200 font-bold text-sm sm:text-base mb-1">Unlimited Time</div>
                  <div className="text-green-300/80 text-xs sm:text-sm">Take your time to learn without pressure</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-400/30">
                <div className="text-2xl sm:text-3xl">✍️</div>
                <div>
                  <div className="text-blue-200 font-bold text-sm sm:text-base mb-1">Type Translation</div>
                  <div className="text-blue-300/80 text-xs sm:text-sm">Enter the English meaning for each German word</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-xl border border-purple-400/30">
                <div className="text-2xl sm:text-3xl">🎯</div>
                <div>
                  <div className="text-purple-200 font-bold text-sm sm:text-base mb-1">Smart Focus</div>
                  <div className="text-purple-300/80 text-xs sm:text-sm">Difficult words appear more frequently</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl border border-amber-400/30">
                <div className="text-2xl sm:text-3xl">🧠</div>
                <div>
                  <div className="text-amber-200 font-bold text-sm sm:text-base mb-1">Spaced Repetition</div>
                  <div className="text-amber-300/80 text-xs sm:text-sm">Advanced learning algorithm for better retention</div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startChallenge}
              disabled={filteredWords.length === 0}
              className="px-12 sm:px-16 py-6 sm:py-8 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 font-bold text-xl sm:text-2xl border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {filteredWords.length === 0 ? 'No Words Available' : 'Start Training'}
            </button>
            
            {filteredWords.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl border border-amber-400/30">
                <div className="text-amber-200 text-lg sm:text-xl font-bold mb-1">
                  {filteredWords.length} Words Ready
                </div>
                <div className="text-amber-300/80 text-sm sm:text-base">
                  Your vocabulary set is ready for training
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1 sm:p-2 md:p-4 relative overflow-hidden overflow-y-auto">
      {/* Medieval Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 text-2xl sm:text-4xl md:text-8xl">⚔️</div>
        <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 text-xl sm:text-3xl md:text-6xl">⏰</div>
        <div className="absolute top-1/2 left-5 sm:left-10 text-lg sm:text-2xl md:text-5xl">🏆</div>
        <div className="absolute top-1/3 right-5 sm:right-10 text-lg sm:text-2xl md:text-4xl">📜</div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <div className="text-amber-400 font-bold text-lg sm:text-xl">
              Word {currentIndex + 1} of {currentWordQueue.length}
            </div>
            <div className="text-amber-200 text-sm sm:text-base">
              {selectedSet === 'all' ? 'All Words' : wordSets.find(s => s.id === selectedSet)?.name}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-green-400">
              ♾️ Unlimited
            </div>
            <div className="text-amber-200 text-sm">Focus on Learning</div>
          </div>
        </div>

        {/* Main Card */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-lg card-container">
            <div
              className={`relative w-full h-80 cursor-pointer card-flip ${
                isFlipped ? 'flipped' : ''
              }`}
              onClick={flipCard}
            >
              {/* Front of Card */}
              <div className={`card-face ${isFlipped ? 'hidden' : 'block'}`}>
                <div className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 h-full flex flex-col justify-center items-center text-slate-800 relative overflow-hidden">
                  {/* Medieval Card Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-lg sm:text-2xl">⚔️</div>
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
                      Type the English translation below
                    </p>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div className={`card-face card-back ${isFlipped ? 'block' : 'hidden'}`}>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Input */}
        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder="Type English translation..."
            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-800/50 text-white rounded-lg border-2 border-amber-400/50 focus:border-amber-400 focus:outline-none text-center text-lg sm:text-xl font-serif"
            disabled={showResult}
          />
        </div>

        {/* Result Display */}
        {showResult && (
          <div className="text-center mb-6">
            <div className={`text-2xl sm:text-3xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '✅ Correct!' : '❌ Wrong!'}
            </div>
            {!isCorrect && (
              <div className="text-amber-200 text-sm sm:text-base">
                Correct answer: <span className="font-bold">{currentWord?.English}</span>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={checkAnswer}
            disabled={!userAnswer.trim() || showResult}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-bold text-base sm:text-lg border border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
          
          <button
            onClick={flipCard}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-violet-800 transition-all duration-300 font-bold text-base sm:text-lg border border-purple-400"
          >
            {isFlipped ? '🔍 Show German' : '📜 Reveal Answer'}
          </button>
          
          <button
            onClick={nextCard}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 font-bold text-base sm:text-lg border border-blue-400"
          >
            ⏭️ Skip Card
          </button>
          
          <button
            onClick={finishChallenge}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-800 transition-all duration-300 font-bold text-base sm:text-lg border border-red-400"
          >
            🏁 Finish Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeMode;
