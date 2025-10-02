import React, { useState, useEffect, useCallback } from 'react';

interface GermanWord {
  German: string;
  English: string;
  Category: string;
  Frequency: number;
  German_Phrase?: string;
  English_Phrase?: string;
}

interface BattleFieldModeProps {
  onBack: () => void;
}

interface BattleResult {
  word: GermanWord;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

const BattleFieldMode: React.FC<BattleFieldModeProps> = ({ onBack }) => {
  const [vocabulary, setVocabulary] = useState<GermanWord[]>([]);
  const [currentWord, setCurrentWord] = useState<GermanWord | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedSet, setSelectedSet] = useState<string>('all');
  const [filteredWords, setFilteredWords] = useState<GermanWord[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [wordStartTime, setWordStartTime] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [spawnedKnights, setSpawnedKnights] = useState<Array<{id: number, x: number, y: number, isDead: boolean, isMoving: boolean, isFighting: boolean, isRagdoll: boolean, ragdollX: number, ragdollY: number, fightStartTime: number, dialogue: string, dialogueTime: number, hasDamaged: boolean}>>([]);
  const [dragonHealth, setDragonHealth] = useState(40);
  const [dragonDead, setDragonDead] = useState(false);
  const [princessDialogue, setPrincessDialogue] = useState('');
  const [dragonDialogue, setDragonDialogue] = useState('');

  // Knight movement animation
  useEffect(() => {
        const moveKnights = () => {
          setSpawnedKnights(prev => prev.map(knight => {
            if (knight.isDead) return knight;
            
            // Clear dialogue if time is up
            let updatedKnight = { ...knight };
            if (knight.dialogue && Date.now() - knight.dialogueTime > 3000) {
              updatedKnight.dialogue = '';
            }
        
            // Flung to right border - dramatic exit
            if (updatedKnight.isRagdoll) {
              // Knights get flung to the right border
              const flingSpeed = 5; // Speed going right
              const newRagdollX = updatedKnight.ragdollX + flingSpeed; // Fly right
              
              // Remove knight when they reach the right border
              if (newRagdollX > window.innerWidth + 100) {
                return null; // Knight has been flung off screen
              }
              
              return {
                ...updatedKnight,
                x: newRagdollX,
                y: updatedKnight.ragdollY, // Stay in same vertical position
                ragdollX: newRagdollX,
                ragdollY: updatedKnight.ragdollY
              };
            }
        
        // Fighting state - check if fighting time is over
        if (updatedKnight.isFighting) {
          const fightDuration = Date.now() - updatedKnight.fightStartTime;
          if (fightDuration > 1500) { // Fight for 1.5 seconds
            // Only apply damage once per knight
            if (!updatedKnight.hasDamaged) {
              // Reduce dragon health when knight becomes ragdoll
              setDragonHealth(prev => {
                const newHealth = prev - 1;
                console.log(`Dragon health: ${newHealth}/40, Correct count: ${correctCount + 1}`);
                // Dragon only dies after exactly 20 knights have fought (health reaches 0)
                if (newHealth <= 0) {
                  console.log('Dragon defeated!');
                  setDragonDead(true);
                }
                return newHealth;
              });
            }
            
            // Knight goes to heaven - simple and peaceful
            return {
              ...updatedKnight,
              isFighting: false,
              isRagdoll: true,
              ragdollX: updatedKnight.x, // Stay in same position
              ragdollY: updatedKnight.y, // Start from current position
              hasDamaged: true // Mark that this knight has already dealt damage
            };
          }
          return updatedKnight; // Stay in place while fighting
        }
        
        // Moving state
        if (updatedKnight.isMoving) {
          const dragonX = window.innerWidth / 2 - 50; // Dragon position
          const speed = 3; // Pixels per frame
          const newX = updatedKnight.x - speed;
          
          // Check if knight reached the dragon (with some tolerance)
          if (newX <= dragonX + 20) {
            // Dragon taunt when knight reaches him
            const dragonFightTaunts = [
              "Ha! Ein weiterer Narr!",
              "Ihr seid alle zum Scheitern verurteilt!",
              "Mein Feuer wird euch verbrennen!",
              "Kämpft weiter, ihr Schwächlinge!",
              "Ich bin unbesiegbar!"
            ];
            setDragonDialogue(dragonFightTaunts[Math.floor(Math.random() * dragonFightTaunts.length)]);
            setTimeout(() => setDragonDialogue(''), 3000);
            
            return {
              ...updatedKnight,
              x: dragonX + 20, // Position knight right next to dragon
              isMoving: false,
              isFighting: true,
              fightStartTime: Date.now() // Record when fighting started
            };
          }
          
          return {
            ...updatedKnight,
            x: newX
          };
        }
        
        return updatedKnight;
      }).filter(knight => knight !== null));
    };

    const interval = setInterval(moveKnights, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  // Random dialogue system
  useEffect(() => {
    if (!gameActive) return;

    const dialogueInterval = setInterval(() => {
      // Princess cries for help
      const princessCries = [
        "Hilfe! Rettet mich!",
        "Bitte, befreit mich!",
        "Ich bin gefangen!",
        "Rettet die Prinzessin!",
        "Hilfe! Der Drache!"
      ];
      
      // Dragon taunts
      const dragonTaunts = [
        "Ha! Eure Ritter sind schwach!",
        "Niemand kann mich besiegen!",
        "Ihr seid alle zum Scheitern verurteilt!",
        "Mein Feuer wird euch verbrennen!",
        "Kämpft weiter, ihr Narren!"
      ];
      

      // Random dialogue every 3-5 seconds
      const randomTime = 3000 + Math.random() * 2000;
      
      setTimeout(() => {
        if (Math.random() < 0.3) {
          setPrincessDialogue(princessCries[Math.floor(Math.random() * princessCries.length)]);
          setTimeout(() => setPrincessDialogue(''), 3000);
        }
        
        if (Math.random() < 0.4) {
          setDragonDialogue(dragonTaunts[Math.floor(Math.random() * dragonTaunts.length)]);
          setTimeout(() => setDragonDialogue(''), 3000);
        }
        
      }, randomTime);
    }, 5000);

    return () => clearInterval(dialogueInterval);
  }, [gameActive]);

  // Random knight dialogue system
  useEffect(() => {
    if (!gameActive) return;

    const knightDialogueInterval = setInterval(() => {
      setSpawnedKnights(prev => prev.map(knight => {
        // Only give dialogue to moving knights who don't already have dialogue
        if (knight.isMoving && !knight.dialogue && !knight.isDead && !knight.isRagdoll) {
          const randomChance = Math.random();
          if (randomChance < 0.1) { // 10% chance every interval
            const knightMovingCries = [
              "Ich komme!",
              "Für die Ehre!",
              "Der Drache wird fallen!",
              "Freiheit für die Prinzessin!",
              "Ich kämpfe für Gerechtigkeit!",
              "Vorwärts!",
              "Für das Königreich!",
              "Die Gerechtigkeit siegt!",
              "Ich bin bereit!",
              "Niemand kann mich aufhalten!"
            ];
            
            return {
              ...knight,
              dialogue: knightMovingCries[Math.floor(Math.random() * knightMovingCries.length)],
              dialogueTime: Date.now()
            };
          }
        }
        return knight;
      }));
    }, 2000); // Check every 2 seconds

    return () => clearInterval(knightDialogueInterval);
  }, [gameActive]);

  const wordSets = [
    { id: 'all', name: 'All Words', description: 'Complete battlefield (500 words)' },
    { id: 'set1', name: 'Battlefield 1', description: 'Words 1-25 (Most Common)' },
    { id: 'set2', name: 'Battlefield 2', description: 'Words 26-50 (High Frequency)' },
    { id: 'set3', name: 'Battlefield 3', description: 'Words 51-75 (Essential)' },
    { id: 'set4', name: 'Battlefield 4', description: 'Words 76-100 (Important)' },
    { id: 'set5', name: 'Battlefield 5', description: 'Words 101-125 (Common)' },
    { id: 'set6', name: 'Battlefield 6', description: 'Words 126-150 (Useful)' },
    { id: 'set7', name: 'Battlefield 7', description: 'Words 151-175 (Practical)' },
    { id: 'set8', name: 'Battlefield 8', description: 'Words 176-200 (Everyday)' },
    { id: 'set9', name: 'Battlefield 9', description: 'Words 201-225 (Basic)' },
    { id: 'set10', name: 'Battlefield 10', description: 'Words 226-250 (Standard)' },
    { id: 'set11', name: 'Battlefield 11', description: 'Words 251-275 (Regular)' },
    { id: 'set12', name: 'Battlefield 12', description: 'Words 276-300 (Typical)' },
    { id: 'set13', name: 'Battlefield 13', description: 'Words 301-325 (Normal)' },
    { id: 'set14', name: 'Battlefield 14', description: 'Words 326-350 (Standard)' },
    { id: 'set15', name: 'Battlefield 15', description: 'Words 351-375 (Common)' },
    { id: 'set16', name: 'Battlefield 16', description: 'Words 376-400 (Useful)' },
    { id: 'set17', name: 'Battlefield 17', description: 'Words 401-425 (Practical)' },
    { id: 'set18', name: 'Battlefield 18', description: 'Words 426-450 (Everyday)' },
    { id: 'set19', name: 'Battlefield 19', description: 'Words 451-475 (Basic)' },
    { id: 'set20', name: 'Battlefield 20', description: 'Words 476-500 (Complete)' }
  ];

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    if (vocabulary.length > 0) {
      filterWords();
    }
  }, [selectedSet, vocabulary]);

  useEffect(() => {
    let timer: number;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameActive && timeLeft === 0) {
      finishBattle();
    }
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

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
      const sortedVocabulary = [...vocabulary].sort((a, b) => a.Frequency - b.Frequency);
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

  const startBattle = () => {
    if (filteredWords.length === 0) {
      alert('No words available for this battlefield. Please select a different set.');
      return;
    }
    
    // Shuffle words for random order
    const shuffledWords = [...filteredWords].sort(() => Math.random() - 0.5);
    setFilteredWords(shuffledWords);
    
    setGameActive(true);
    setGameFinished(false);
    setCurrentIndex(0);
    setTimeLeft(120); // 2 minutes
    setBattleResults([]);
    setUserAnswer('');
    
    // Reset knight spawning system
    setCorrectCount(0);
    setSpawnedKnights([]);
    setDragonHealth(40);
    setDragonDead(false);
    
    setCurrentWord(shuffledWords[0]);
    setWordStartTime(Date.now());
  };

  const submitAnswer = useCallback(() => {
    if (!currentWord || !userAnswer.trim()) return;

    const userAnswerLower = userAnswer.toLowerCase().trim();
    const correctAnswerLower = currentWord.English.toLowerCase().trim();
    const isCorrect = userAnswerLower === correctAnswerLower;
    const timeSpent = Date.now() - wordStartTime;

    const result: BattleResult = {
      word: currentWord,
      userAnswer: userAnswer.trim(),
      isCorrect,
      timeSpent
    };

    setBattleResults(prev => [...prev, result]);

      // Spawn knight when word is correct
      if (isCorrect) {
        const newCorrectCount = correctCount + 1;
        setCorrectCount(newCorrectCount);
        
        // Knight battle cry when spawning
        const knightSpawnCries = [
          "Für die Prinzessin!",
          "Ich komme!",
          "Der Drache wird fallen!",
          "Freiheit!",
          "Kampf!",
          "Für die Ehre!",
          "Ich kämpfe für Gerechtigkeit!",
          "Vorwärts, Kameraden!",
          "Der Drache wird bezahlt!",
          "Rettet die Prinzessin!",
          "Ich bin bereit!",
          "Für das Königreich!",
          "Niemand kann mich aufhalten!",
          "Die Gerechtigkeit siegt!",
          "Ich werde siegen!"
        ];
        
        // Spawn knight from right side with individual dialogue
        const newKnight = {
          id: Date.now(),
          x: window.innerWidth - 50,
          y: 100, // Even higher for perfect platform alignment
          isDead: false,
          isMoving: true,
          isFighting: false,
          isRagdoll: false,
          ragdollX: 0,
          ragdollY: 0,
          fightStartTime: 0,
          dialogue: knightSpawnCries[Math.floor(Math.random() * knightSpawnCries.length)],
          dialogueTime: Date.now(),
          hasDamaged: false
        };
        
        setSpawnedKnights(prev => [...prev, newKnight]);
      }

    // Move to next word
    if (currentIndex < filteredWords.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentWord(filteredWords[nextIndex]);
      setUserAnswer('');
      setWordStartTime(Date.now());
    } else {
      // All words completed
      finishBattle();
    }
  }, [currentWord, userAnswer, currentIndex, filteredWords, wordStartTime, correctCount]);

  const finishBattle = () => {
    setGameActive(false);
    setGameFinished(true);
    setCurrentWord(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIncorrectWords = () => {
    return battleResults.filter(result => !result.isCorrect);
  };

  const getCorrectWords = () => {
    return battleResults.filter(result => result.isCorrect);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <div className="text-amber-200 text-xl font-serif">Preparing battlefield...</div>
        </div>
      </div>
    );
  }

  if (gameFinished) {
    const incorrectWords = getIncorrectWords();
    const correctWords = getCorrectWords();
    const accuracy = battleResults.length > 0 ? (correctWords.length / battleResults.length) * 100 : 0;

    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1 sm:p-2 md:p-4 relative overflow-hidden overflow-y-auto">
        {/* Battle Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-4xl sm:text-6xl">⚔️</div>
          <div className="absolute top-10 right-10 text-4xl sm:text-6xl">🏰</div>
          <div className="absolute bottom-10 left-10 text-3xl sm:text-5xl">🛡️</div>
          <div className="absolute bottom-10 right-10 text-3xl sm:text-5xl">🏆</div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-6">
            <button
              onClick={onBack}
              className="flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl shadow-xl hover:shadow-2xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 border-2 border-amber-400 text-sm sm:text-base font-serif"
            >
              <span className="mr-2">←</span>
              <span>Back to Menu</span>
            </button>
            
            <div className="text-center flex-1">
              <div className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent text-4xl sm:text-6xl font-bold mb-2 font-serif">
                BATTLE COMPLETE!
              </div>
              <div className="text-amber-200 text-lg sm:text-xl font-serif">
                Battlefield Results
              </div>
            </div>
            
            <div className="w-24"></div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-4 sm:p-6 text-white text-center">
              <div className="text-3xl sm:text-4xl mb-2">✅</div>
              <div className="text-2xl sm:text-3xl font-bold">{correctWords.length}</div>
              <div className="text-sm sm:text-base">Correct</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-xl p-4 sm:p-6 text-white text-center">
              <div className="text-3xl sm:text-4xl mb-2">❌</div>
              <div className="text-2xl sm:text-3xl font-bold">{incorrectWords.length}</div>
              <div className="text-sm sm:text-base">Incorrect</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white text-center">
              <div className="text-3xl sm:text-4xl mb-2">📊</div>
              <div className="text-2xl sm:text-3xl font-bold">{accuracy.toFixed(1)}%</div>
              <div className="text-sm sm:text-base">Accuracy</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl p-4 sm:p-6 text-white text-center">
              <div className="text-3xl sm:text-4xl mb-2">⚡</div>
              <div className="text-2xl sm:text-3xl font-bold">{battleResults.length}</div>
              <div className="text-sm sm:text-base">Total Words</div>
            </div>
          </div>

          {/* Incorrect Words */}
          {incorrectWords.length > 0 && (
            <div className="bg-gradient-to-r from-red-800/80 to-rose-700/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 mb-8 shadow-2xl border border-red-400/30">
              <h3 className="text-xl sm:text-2xl font-bold text-red-200 mb-6 text-center font-serif">
                ⚔️ Words You Missed
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {incorrectWords.map((result, index) => (
                  <div key={index} className="bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg p-4 border border-red-400/30">
                    <div className="text-white font-bold text-lg mb-2">{result.word.German}</div>
                    <div className="text-red-200 text-sm mb-1">Correct: <span className="font-bold">{result.word.English}</span></div>
                    <div className="text-red-300 text-sm">Your answer: <span className="italic">"{result.userAnswer}"</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={startBattle}
              className="px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl shadow-2xl hover:shadow-3xl hover:from-red-700 hover:to-rose-800 transition-all duration-300 font-bold text-lg sm:text-xl border-2 border-red-400"
            >
              ⚔️ Battle Again
            </button>
            
            <button
              onClick={onBack}
              className="px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl shadow-2xl hover:shadow-3xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-bold text-lg sm:text-xl border-2 border-amber-400"
            >
              🏰 Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1 sm:p-2 md:p-4 relative overflow-hidden overflow-y-auto">
        {/* Battle Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-4xl sm:text-6xl">⚔️</div>
          <div className="absolute top-10 right-10 text-4xl sm:text-6xl">🏰</div>
          <div className="absolute bottom-10 left-10 text-3xl sm:text-5xl">🛡️</div>
          <div className="absolute bottom-10 right-10 text-3xl sm:text-5xl">🏆</div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 gap-6">
            <button
              onClick={onBack}
              className="flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl shadow-xl hover:shadow-2xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 border-2 border-amber-400 text-sm sm:text-base font-serif"
            >
              <span className="mr-2">←</span>
              <span>Back to Menu</span>
            </button>
            
            <div className="text-center flex-1">
              <div className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent text-4xl sm:text-6xl font-bold mb-2 font-serif">
                BATTLEFIELD
              </div>
              <div className="text-amber-200 text-lg sm:text-xl font-serif">
                Timed German Vocabulary Battle
              </div>
              <div className="text-amber-300/80 text-sm sm:text-base mt-1">
                Test your speed and accuracy in 2 minutes
              </div>
            </div>
            
            <div className="w-24"></div>
          </div>

          {/* Battlefield Selection */}
          <div className="mb-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl text-amber-200 font-serif mb-2">Choose Your Battlefield</h3>
              <p className="text-amber-300/70 text-sm sm:text-base">Select the vocabulary range for your battle</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {wordSets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => setSelectedSet(set.id)}
                  className={`group relative p-4 sm:p-5 rounded-xl text-left transition-all duration-300 border-2 ${
                    selectedSet === set.id
                      ? 'bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-xl border-red-400'
                      : 'bg-gradient-to-br from-slate-800/60 to-slate-700/60 text-amber-200 hover:bg-gradient-to-br hover:from-slate-700/60 hover:to-slate-600/60 border-red-400/40 hover:border-red-400/70 hover:shadow-lg'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="font-bold text-sm sm:text-base font-serif mb-2">{set.name}</div>
                    <div className="text-xs sm:text-sm opacity-80 leading-relaxed">{set.description}</div>
                    {selectedSet === set.id && (
                      <div className="mt-2 text-xs font-bold text-red-100">
                        SELECTED
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Battle Rules */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-10 shadow-2xl border border-red-400/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-200 font-serif mb-2">
                ⚔️ Battle Rules
              </h3>
              <p className="text-amber-300/70 text-sm sm:text-base">Master these rules to conquer the battlefield</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl border border-red-400/30">
                <div className="text-2xl sm:text-3xl">⏰</div>
                <div>
                  <div className="text-red-200 font-bold text-sm sm:text-base mb-1">2 Minutes Only</div>
                  <div className="text-red-300/80 text-xs sm:text-sm">Complete as many words as possible</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl border border-blue-400/30">
                <div className="text-2xl sm:text-3xl">✍️</div>
                <div>
                  <div className="text-blue-200 font-bold text-sm sm:text-base mb-1">One Try Only</div>
                  <div className="text-blue-300/80 text-xs sm:text-sm">No second chances - make it count</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-xl border border-purple-400/30">
                <div className="text-2xl sm:text-3xl">🚫</div>
                <div>
                  <div className="text-purple-200 font-bold text-sm sm:text-base mb-1">No Card Flipping</div>
                  <div className="text-purple-300/80 text-xs sm:text-sm">You can't see the answer before submitting</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl border border-amber-400/30">
                <div className="text-2xl sm:text-3xl">📊</div>
                <div>
                  <div className="text-amber-200 font-bold text-sm sm:text-base mb-1">See Results</div>
                  <div className="text-amber-300/80 text-xs sm:text-sm">Review all incorrect answers at the end</div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startBattle}
              disabled={filteredWords.length === 0}
              className="px-12 sm:px-16 py-6 sm:py-8 bg-gradient-to-r from-red-600 to-orange-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:from-red-700 hover:to-orange-800 transition-all duration-300 font-bold text-xl sm:text-2xl border-2 border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {filteredWords.length === 0 ? 'No Words Available' : '⚔️ START BATTLE'}
            </button>
            
            {filteredWords.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl border border-red-400/30">
                <div className="text-amber-200 text-lg sm:text-xl font-bold mb-1">
                  {filteredWords.length} Words Ready for Battle
                </div>
                <div className="text-amber-300/80 text-sm sm:text-base">
                  Your battlefield is prepared. Are you ready to fight?
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
      {/* Battle Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-4xl sm:text-6xl">⚔️</div>
        <div className="absolute top-10 right-10 text-4xl sm:text-6xl">🏰</div>
        <div className="absolute bottom-10 left-10 text-3xl sm:text-5xl">🛡️</div>
        <div className="absolute bottom-10 right-10 text-3xl sm:text-5xl">🏆</div>
      </div>

      {/* 2D Platformer Battle Scene - Hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        {/* Simple Road */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24">
          {/* Road Base */}
          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-20 bg-gradient-to-t from-gray-700 via-gray-600 to-gray-500">
            {/* Road center line */}
            <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-yellow-400/60"></div>
          </div>
          
          {/* Grass edges */}
          <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 right-0 h-3 sm:h-4 bg-gradient-to-t from-green-600 to-green-500"></div>
        </div>

        {/* Princess (Front) */}
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/4 w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 z-20">
          <img 
            src="/data/princes.svg" 
            alt="Princess" 
            className="w-full h-full object-contain drop-shadow-lg animate-princess-idle"
          />
          {/* Princess glow */}
          <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-sm animate-pulse"></div>
          
          {/* Princess breathing effect */}
          <div className="absolute inset-0 bg-pink-300/10 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
          
          {/* Princess sparkles */}
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-1 h-1 sm:w-2 sm:h-2 bg-pink-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 -right-1.5 sm:-right-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-pink-200 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
          
          {/* Princess dialogue bubble */}
          {princessDialogue && (
            <div className="absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2 bg-pink-200 text-pink-800 px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg border-2 border-pink-300 animate-bounce">
              <div className="text-xs sm:text-sm font-bold text-center">{princessDialogue}</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-transparent border-t-pink-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Dragon Guard (Behind Princess) */}
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 z-10">
          <img 
            src="/data/Welsh_Dragon_Emoji.svg" 
            alt="Dragon Guard" 
            className={`w-full h-full object-contain transition-all duration-500 ${
              dragonDead ? 'opacity-30 scale-75' : 'opacity-100 animate-dragon-idle'
            }`}
            style={{
              filter: dragonDead ? 'grayscale(100%)' : 'drop-shadow(2px 2px 8px rgba(255, 0, 0, 0.8))',
              transform: 'scaleX(-1)' // Mirror the dragon
            }}
          />
          
          {/* Dragon breathing effect */}
          {!dragonDead && (
            <div className="absolute inset-0 bg-red-300/10 rounded-full animate-ping" style={{animationDuration: '2.5s'}}></div>
          )}
          
          {/* Dragon menacing aura */}
          {!dragonDead && (
            <div className="absolute -inset-1 sm:-inset-2 bg-red-500/20 rounded-full animate-pulse" style={{animationDuration: '1.5s'}}></div>
          )}
          
          {/* Dragon embers */}
          {!dragonDead && (
            <>
              <div className="absolute -top-2 -left-1 sm:-top-3 sm:-left-2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute -bottom-1 -right-2 sm:-bottom-2 sm:-right-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.8s'}}></div>
              <div className="absolute top-1/3 -left-2 sm:-left-4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
              <div className="absolute bottom-1/3 -right-2 sm:-right-4 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-orange-300 rounded-full animate-ping" style={{animationDelay: '1.8s'}}></div>
            </>
          )}
          {/* Dragon Health Bar */}
          {!dragonDead && (
            <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
              <div className="text-center mb-1">
                <div className="text-xs font-bold text-white bg-red-600/80 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                  {dragonHealth}/40 HP
                </div>
              </div>
              <div className="w-16 h-2 sm:w-20 sm:h-3 bg-red-600 rounded-full border border-red-800">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${(dragonHealth / 40) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {/* Dragon fire breath */}
          {!dragonDead && (
            <div className="absolute -left-4 sm:-left-6 md:-left-8 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-0.5 sm:space-x-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
          
          {/* Dragon dialogue bubble */}
          {dragonDialogue && !dragonDead && (
            <div className="absolute -top-16 sm:-top-20 left-1/2 transform -translate-x-1/2 bg-red-200 text-red-800 px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg border-2 border-red-300 animate-bounce">
              <div className="text-xs sm:text-sm font-bold text-center">{dragonDialogue}</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-transparent border-t-red-200"></div>
              </div>
            </div>
          )}
        </div>

          {/* Spawned Knights */}
          {spawnedKnights.map((knight) => (
            <div
              key={knight.id}
              className="absolute w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 z-30"
              style={{
                left: `${knight.isRagdoll ? knight.ragdollX : knight.x}px`,
                bottom: `${knight.isRagdoll ? knight.ragdollY : knight.y}px`,
                opacity: knight.isRagdoll ? 0.6 : 1,
                transform: knight.isRagdoll 
                  ? `scale(0.8) rotate(${(knight.id % 360)}deg)` 
                  : knight.isFighting 
                    ? 'scale(1.1) rotate(5deg)' 
                    : 'scale(1)',
                transition: knight.isRagdoll ? 'none' : 'all 0.1s ease-out'
              }}
            >
              <img 
                src="/data/knight.svg" 
                alt="Knight" 
                className="w-full h-full object-contain transition-all duration-1000"
                style={{
                  filter: knight.isRagdoll 
                    ? 'grayscale(60%) brightness(0.8) drop-shadow(2px 2px 8px rgba(255, 0, 0, 0.6))' 
                    : knight.isFighting
                      ? 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))'
                      : 'drop-shadow(2px 2px 8px rgba(255, 215, 0, 0.8))'
                }}
              />
              
              {/* Knight running dust effect */}
              {knight.isMoving && !knight.isFighting && !knight.isRagdoll && (
                <div className="absolute -bottom-2 left-0 w-4 h-2 bg-amber-300/60 rounded-full blur-sm animate-pulse"></div>
              )}
              
              {/* Knight fighting effect */}
              {knight.isFighting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-red-500 text-lg font-bold animate-bounce">⚔️</div>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="text-yellow-400 text-sm animate-ping">💥</div>
                  </div>
                </div>
              )}
              
              {/* Knight flung away effect */}
              {knight.isRagdoll && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500 text-lg font-bold animate-spin">💀</div>
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                    <div className="text-red-400 text-sm animate-bounce">💨</div>
                  </div>
                  <div className="absolute -right-6 top-1/4">
                    <div className="text-orange-400 text-xs animate-ping">💥</div>
                  </div>
                  <div className="absolute -right-4 bottom-1/4">
                    <div className="text-red-300 text-xs animate-pulse">⚡</div>
                  </div>
                </div>
              )}
              
              {/* Knight dialogue bubble */}
              {knight.dialogue && !knight.isRagdoll && (
                <div className="absolute -top-8 sm:-top-10 md:-top-12 left-1/2 transform -translate-x-1/2 bg-blue-200 text-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg shadow-lg border-2 border-blue-300 animate-bounce">
                  <div className="text-xs font-bold text-center">{knight.dialogue}</div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 sm:border-l-3 sm:border-r-3 sm:border-t-3 border-transparent border-t-blue-200"></div>
                  </div>
                </div>
              )}
              
              {/* Knight attack effect while moving */}
              {knight.isMoving && !knight.isFighting && !knight.isRagdoll && knight.x <= window.innerWidth / 2 + 50 && knight.x >= window.innerWidth / 2 - 100 && (
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* Battle Effects */}
        {spawnedKnights.some(knight => knight.isFighting) && (
          <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2 w-20 h-10 sm:w-24 sm:h-12 md:w-32 md:h-16 pointer-events-none">
            {/* Fighting effects */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-red-500 text-xl sm:text-2xl md:text-3xl animate-bounce">⚔️</div>
              <div className="text-yellow-400 text-lg sm:text-xl md:text-2xl animate-ping ml-1 sm:ml-2">⚡</div>
              <div className="text-white text-base sm:text-lg md:text-xl animate-pulse ml-0.5 sm:ml-1">💥</div>
            </div>
            {/* Sparks flying */}
            <div className="absolute top-0 left-1/4 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-1 sm:top-2 right-1/4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute bottom-1 sm:bottom-2 left-1/3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}

        {/* Victory Message */}
        {dragonDead && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600/95 text-white px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 rounded-xl shadow-2xl animate-pulse z-50">
            <div className="text-sm sm:text-base md:text-lg font-bold text-center">🏆 Dragon Defeated! Princess Saved! 🏆</div>
            <div className="text-xs sm:text-sm text-center mt-1 sm:mt-2">All 20 knights have triumphed!</div>
          </div>
        )}

        {/* Simple background */}
        <div className="absolute bottom-24 sm:bottom-28 md:bottom-32 left-0 right-0 h-12 sm:h-14 md:h-16 bg-gradient-to-t from-green-600/10 to-transparent"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 md:mb-12">
          {/* Top row with back button and progress */}
          <div className="flex justify-between items-center">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-lg transition-all duration-300 border border-slate-500/50"
            >
              <span className="text-lg sm:text-xl">←</span>
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
            
            {/* Progress */}
            <div className="text-center">
              <div className="text-amber-400 font-bold text-base sm:text-lg md:text-xl">
                Word {currentIndex + 1} of {filteredWords.length}
              </div>
              <div className="text-amber-200 text-xs sm:text-sm md:text-base">
                {selectedSet === 'all' ? 'All Words' : wordSets.find(s => s.id === selectedSet)?.name}
              </div>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            {/* Knight Counter */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-lg">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">⚔️ {correctCount}/25</div>
              <div className="text-xs sm:text-sm font-medium">Knights Spawned</div>
            </div>
            
            {/* Timer */}
            <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{formatTime(timeLeft)}</div>
              <div className="text-xs sm:text-sm font-medium">Time Remaining</div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative w-full max-w-lg">
            <div className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 h-64 sm:h-72 md:h-80 flex flex-col justify-center items-center text-slate-800 relative overflow-hidden border-2 border-amber-300">
              {/* Battle Card Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-2xl sm:text-3xl">⚔️</div>
                <div className="absolute bottom-4 left-4 text-xl sm:text-2xl">🛡️</div>
                <div className="absolute top-1/2 left-4 text-lg sm:text-xl">🏰</div>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <span className="px-2 py-1 sm:px-3 sm:py-2 md:px-4 rounded-full text-xs sm:text-sm font-bold bg-amber-200 text-amber-800 border border-amber-300">
                    📜 {currentWord?.Category}
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-slate-800 mb-3 sm:mb-4 md:mb-6 text-center font-serif">
                  {currentWord?.German}
                </h2>
                
                {currentWord?.German_Phrase && (
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <p className="text-slate-600 text-center font-serif text-xs sm:text-sm md:text-base italic bg-amber-50 p-2 sm:p-3 rounded-lg border border-amber-200">
                      "{currentWord.German_Phrase}"
                    </p>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-2 sm:p-3 border border-red-200">
                  <p className="text-slate-600 text-center font-medium text-xs sm:text-sm md:text-base">
                    ⚔️ Type the English translation quickly!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Input */}
        <div className="max-w-md mx-auto mb-4 sm:mb-6">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
            placeholder="Type English translation..."
            className="w-full px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 bg-white/90 backdrop-blur-sm text-slate-800 rounded-lg sm:rounded-xl border-2 border-red-300 focus:border-red-500 focus:outline-none text-center text-base sm:text-lg md:text-xl font-serif shadow-lg transition-all duration-300 placeholder-slate-400"
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={submitAnswer}
            disabled={!userAnswer.trim()}
            className="px-6 py-3 sm:px-8 sm:py-4 md:px-12 md:py-5 bg-gradient-to-r from-red-600 to-orange-700 text-white rounded-lg sm:rounded-xl shadow-2xl hover:shadow-3xl hover:from-red-700 hover:to-orange-800 transition-all duration-300 font-bold text-base sm:text-lg md:text-xl border-2 border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚔️ Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleFieldMode;
