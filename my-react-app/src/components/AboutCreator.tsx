import React from 'react';

interface AboutCreatorProps {
  onBack: () => void;
}

const AboutCreator: React.FC<AboutCreatorProps> = ({ onBack }) => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-pink-100 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-purple-800">
            👨‍💻 About the Creator
          </h1>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-lg transition-all duration-300 border border-slate-500/50"
          >
            <span className="text-lg">←</span>
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Creator Info */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl">👨‍💻</span>
              </div>
              <h2 className="text-3xl font-bold text-purple-800 mb-4">Theo</h2>
              <p className="text-xl text-purple-600 mb-6">
                Creator of German Quest
              </p>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                Passionate about language learning and interactive education. 
                German Quest was created to make learning German vocabulary fun and engaging 
                through gamification and medieval-themed adventures.
              </p>
            </div>

            {/* Social Links */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center">
                🌐 Connect With Me
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/theo_mp115?igsh=MXRudDcydThpcXlxbQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📸</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Instagram</h4>
                      <p className="text-pink-100">@theo_mp115</p>
                      <p className="text-sm text-pink-200 mt-1">
                        Follow for updates and behind-the-scenes content
                      </p>
                    </div>
                  </div>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/walid-attou-9a32b0313"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">💼</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">LinkedIn</h4>
                      <p className="text-blue-100">Walid Attou</p>
                      <p className="text-sm text-blue-200 mt-1">
                        Professional network and career updates
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Project Info */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center">
                🎮 About German Quest
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl mb-3">⚔️</div>
                  <h4 className="font-bold text-purple-800 mb-2">Battlefield Mode</h4>
                  <p className="text-sm text-purple-600">
                    Test your skills in timed battles against the dragon
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl mb-3">🏋️</div>
                  <h4 className="font-bold text-purple-800 mb-2">Training Ground</h4>
                  <p className="text-sm text-purple-600">
                    Practice with adaptive learning and spaced repetition
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl mb-3">🃏</div>
                  <h4 className="font-bold text-purple-800 mb-2">Flashcards</h4>
                  <p className="text-sm text-purple-600">
                    Traditional flashcard learning with modern features
                  </p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center">
                🛠️ Built With
              </h3>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { name: 'React', icon: '⚛️' },
                  { name: 'TypeScript', icon: '📘' },
                  { name: 'Tailwind CSS', icon: '🎨' },
                  { name: 'Vite', icon: '⚡' },
                  { name: 'SVG Graphics', icon: '🖼️' },
                  { name: 'Responsive Design', icon: '📱' }
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="bg-white border-2 border-purple-200 rounded-lg px-4 py-2 hover:border-purple-400 transition-colors"
                  >
                    <span className="mr-2">{tech.icon}</span>
                    <span className="font-medium text-purple-800">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Made with ❤️ for German language learners worldwide
              </p>
              <p className="text-sm text-gray-500 mt-2">
                © 2024 German Quest - Interactive German Learning Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCreator;

