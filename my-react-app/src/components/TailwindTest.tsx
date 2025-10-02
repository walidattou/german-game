import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          🎨 Tailwind Test
        </h1>
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">Blue card with rounded corners</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-green-800 font-medium">Green card with rounded corners</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-red-800 font-medium">Red card with rounded corners</p>
          </div>
        </div>
        <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          Beautiful Button
        </button>
      </div>
    </div>
  );
};

export default TailwindTest;
