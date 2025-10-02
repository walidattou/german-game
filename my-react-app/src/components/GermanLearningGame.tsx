import React, { useState } from 'react';
import GameModeSelector from './GameModeSelector';
import ExploreMode from './ExploreMode';
import ChallengeMode from './ChallengeMode';
import BattleFieldMode from './BattleFieldMode';
import AboutCreator from './AboutCreator';

type GameMode = 'menu' | 'explore' | 'battlefield' | 'challenge' | 'about';

const GermanLearningGame: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>('menu');

  const handleModeSelect = (mode: string) => {
    setCurrentMode(mode as GameMode);
  };

  const handleBackToMenu = () => {
    setCurrentMode('menu');
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'explore':
        return <ExploreMode onBack={handleBackToMenu} />;
      case 'battlefield':
        return <BattleFieldMode onBack={handleBackToMenu} />;
      case 'challenge':
        return <ChallengeMode onBack={handleBackToMenu} />;
      case 'about':
        return <AboutCreator onBack={handleBackToMenu} />;
      default:
        return <GameModeSelector onSelectMode={handleModeSelect} />;
    }
  };

  return <>{renderCurrentMode()}</>;
};

export default GermanLearningGame;
