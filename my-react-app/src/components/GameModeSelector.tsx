import React, { useState, useEffect } from 'react';

interface GameModeSelectorProps {
  onSelectMode: (mode: string) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onSelectMode }) => {
  const [knightPosition, setKnightPosition] = useState({ x: 50, y: 200 });
  const [knightDirection, setKnightDirection] = useState({ x: 2, y: 1 });
  const [dragonPosition, setDragonPosition] = useState({ x: 100, y: 150 });
  const [isSpittingFire, setIsSpittingFire] = useState(false);
  const [, setCollisionCount] = useState(0);
  const [knightDamage, setKnightDamage] = useState(false);
  const [knightSpeedBoost, setKnightSpeedBoost] = useState(1);
  const [funnyEffect, setFunnyEffect] = useState(false);

  useEffect(() => {
    const moveKnight = () => {
      setKnightPosition(prev => {
        const speedMultiplier = knightSpeedBoost;
        let newX = prev.x + (knightDirection.x * speedMultiplier);
        let newY = prev.y + (knightDirection.y * speedMultiplier);
        let newDirectionX = knightDirection.x;
        let newDirectionY = knightDirection.y;

        // Bounce off screen edges
        if (newX <= 0 || newX >= window.innerWidth - 100) {
          newDirectionX = -newDirectionX;
          newX = Math.max(0, Math.min(window.innerWidth - 100, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight - 100) {
          newDirectionY = -newDirectionY;
          newY = Math.max(0, Math.min(window.innerHeight - 100, newY));
        }

        setKnightDirection({ x: newDirectionX, y: newDirectionY });
        return { x: newX, y: newY };
      });
    };

    const moveDragon = () => {
      setDragonPosition(prev => {
        const knight = knightPosition;
        const dx = knight.x - prev.x;
        const dy = knight.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move dragon towards knight (faster speed)
        const speed = 2.2; // Increased from 1.5
        const newX = prev.x + (dx / distance) * speed;
        const newY = prev.y + (dy / distance) * speed;

        return { x: newX, y: newY };
      });
    };

    const checkCollision = () => {
      const dx = knightPosition.x - dragonPosition.x;
      const dy = knightPosition.y - dragonPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 80) { // Collision threshold
        setIsSpittingFire(true);
        setCollisionCount(prev => prev + 1);
        
        // Knight damage effect
        setKnightDamage(true);
        setTimeout(() => setKnightDamage(false), 1500);
        
        // Knight speed boost
        setKnightSpeedBoost(2.5);
        setTimeout(() => setKnightSpeedBoost(1), 3000);
        
        // Funny effect
        setFunnyEffect(true);
        setTimeout(() => setFunnyEffect(false), 2000);
        
        setTimeout(() => setIsSpittingFire(false), 1000);
      }
    };

    const gameLoop = setInterval(() => {
      moveKnight();
      moveDragon();
      checkCollision();
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [knightPosition, dragonPosition, knightDirection, knightSpeedBoost]);
  const gameModes = [
    {
      id: 'explore',
      name: 'EXPLORE',
      description: 'Journey through the ancient German lexicon',
      icon: '🗡️',
      color: 'from-amber-600 to-orange-700',
      hoverColor: 'hover:from-amber-700 hover:to-orange-800',
      borderColor: 'border-amber-400',
      glowColor: 'shadow-amber-500/50'
    },
    {
      id: 'battlefield',
      name: 'BATTLEFIELD',
      description: 'Timed battle with 2 minutes and one try per word',
      icon: '⚔️',
      color: 'from-red-600 to-rose-700',
      hoverColor: 'hover:from-red-700 hover:to-rose-800',
      borderColor: 'border-red-400',
      glowColor: 'shadow-red-500/50'
    },
    {
      id: 'challenge',
      name: 'TRAINING GROUND',
      description: 'Practice and master German vocabulary',
      icon: '🏋️',
      color: 'from-green-600 to-emerald-700',
      hoverColor: 'hover:from-green-700 hover:to-emerald-800',
      borderColor: 'border-green-400',
      glowColor: 'shadow-green-500/50'
    },
    {
      id: 'about',
      name: 'ABOUT CREATOR',
      description: 'Meet the creator and connect on social media',
      icon: '👨‍💻',
      color: 'from-purple-600 to-pink-700',
      hoverColor: 'hover:from-purple-700 hover:to-pink-800',
      borderColor: 'border-purple-400',
      glowColor: 'shadow-purple-500/50'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-start p-1 sm:p-2 md:p-4 relative overflow-y-auto sm:overflow-hidden sm:justify-center">
        {/* Medieval Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-5 sm:top-10 sm:left-10 text-2xl sm:text-3xl md:text-6xl">🏰</div>
          <div className="absolute top-10 right-10 sm:top-20 sm:right-20 text-xl sm:text-2xl md:text-4xl">⚔️</div>
          <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 text-xl sm:text-2xl md:text-5xl">🛡️</div>
          <div className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 text-xl sm:text-2xl md:text-4xl">👑</div>
          <div className="absolute top-1/2 left-5 sm:left-10 text-lg sm:text-xl md:text-3xl">🗡️</div>
          <div className="absolute top-1/3 right-5 sm:right-10 text-lg sm:text-xl md:text-3xl">📜</div>
        </div>

        {/* Knight and Dragon NPCs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Knight - Bouncing around like DVD screensaver */}
          <div 
            className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 transition-all duration-75"
            style={{
              left: `${knightPosition.x}px`,
              top: `${knightPosition.y}px`,
              transform: `scaleX(${knightDirection.x > 0 ? '1' : '-1'})`
            }}
          >
            <img 
              src="/data/knight.svg" 
              alt="Knight" 
              className={`w-full h-full object-contain ${
                knightDamage ? 'animate-knight-damage' : 
                knightSpeedBoost > 1 ? 'animate-speed-boost' : 
                'animate-bounce-fast'
              }`}
              style={{
                filter: knightDamage ? 'drop-shadow(2px 2px 4px rgba(255, 0, 0, 0.8))' : 
                       knightSpeedBoost > 1 ? 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.8))' :
                       'drop-shadow(2px 2px 4px rgba(255, 215, 0, 0.5))'
              }}
            />
            {/* Speed trail - enhanced when speed boosted */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className={`w-1 h-1 rounded-full animate-pulse ${
                  knightSpeedBoost > 1 ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                <div className={`w-1 h-1 rounded-full animate-pulse ${
                  knightSpeedBoost > 1 ? 'bg-green-400' : 'bg-yellow-400'
                }`} style={{animationDelay: '0.2s'}}></div>
                <div className={`w-1 h-1 rounded-full animate-pulse ${
                  knightSpeedBoost > 1 ? 'bg-green-400' : 'bg-yellow-400'
                }`} style={{animationDelay: '0.4s'}}></div>
                {knightSpeedBoost > 1 && (
                  <>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                  </>
                )}
              </div>
            </div>
            {/* Damage effect overlay */}
            {knightDamage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-red-500 text-xs font-bold animate-pulse">💥</div>
              </div>
            )}
          </div>
          
          {/* Dragon - Following the knight */}
          <div 
            className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 transition-all duration-75"
            style={{
              left: `${dragonPosition.x}px`,
              top: `${dragonPosition.y}px`,
              transform: `scaleX(${dragonPosition.x < knightPosition.x ? '1' : '-1'})`
            }}
          >
            <img 
              src="/data/Welsh_Dragon_Emoji.svg" 
              alt="Dragon" 
              className={`w-full h-full object-contain ${
                funnyEffect ? 'animate-funny-effect' : 'animate-bounce-fast'
              }`}
              style={{
                filter: 'drop-shadow(2px 2px 4px rgba(255, 0, 0, 0.5))'
              }}
            />
            {/* Fire spit effect - only when colliding */}
            {isSpittingFire && (
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-fire-spit"></div>
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-fire-spit" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-fire-spit" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
            {/* Speed trail */}
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            {/* Funny effect overlay */}
            {funnyEffect && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="text-yellow-400 text-sm font-bold animate-bounce">😈</div>
              </div>
            )}
          </div>
        </div>


        {/* Chase is always happening - no notifications needed */}

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10 py-4 sm:py-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent text-3xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4 font-serif">
            German Quest
          </div>
          <div className="text-base sm:text-lg md:text-2xl text-amber-200 mb-1 sm:mb-2 font-serif">
            The Ancient Language of the North
          </div>
          <div className="text-amber-300/80 text-xs sm:text-sm md:text-lg px-2 sm:px-4">
            Master 500 legendary German words • Choose your path to glory
          </div>
        </div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`bg-gradient-to-br ${mode.color} ${mode.hoverColor} rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl text-white border-2 ${mode.borderColor} hover:shadow-lg hover:${mode.glowColor} relative overflow-hidden`}
            >
              {/* Card Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-lg sm:text-2xl">{mode.icon}</div>
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-sm sm:text-xl">⚜️</div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
                  <div className="text-2xl sm:text-3xl md:text-5xl mr-3 sm:mr-4 md:mr-6">{mode.icon}</div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-3xl font-bold font-serif">{mode.name}</h2>
                    <div className="text-amber-200/80 text-xs sm:text-sm font-mono">ADVENTURE MODE</div>
                  </div>
                </div>
                <p className="text-white/90 text-xs sm:text-sm md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-6 font-serif">
                  {mode.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-200/80 text-xs sm:text-sm font-medium font-mono">
                    Begin Quest →
                  </span>
                  <div className="text-base sm:text-lg md:text-2xl">⚔️</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Medieval Stats */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl border border-amber-400/30">
          <h3 className="text-base sm:text-lg md:text-2xl font-bold text-amber-200 mb-3 sm:mb-4 md:mb-6 text-center font-serif">
            ⚜️ Your Quest Awaits ⚜️
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-2 md:mb-3">📚</div>
              <div className="text-amber-200 font-semibold text-xs sm:text-sm md:text-base">500 Ancient Words</div>
              <div className="text-amber-300/70 text-xs sm:text-sm">Master the lexicon</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-2 md:mb-3">🏆</div>
              <div className="text-amber-200 font-semibold text-xs sm:text-sm md:text-base">Epic Adventures</div>
              <div className="text-amber-300/70 text-xs sm:text-sm">Choose your path</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-2 md:mb-3">⚡</div>
              <div className="text-amber-200 font-semibold text-xs sm:text-sm md:text-base">Legendary Skills</div>
              <div className="text-amber-300/70 text-xs sm:text-sm">Become a master</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom padding for mobile scrolling */}
      <div className="h-8 sm:h-0"></div>
    </div>
  );
};

export default GameModeSelector;
