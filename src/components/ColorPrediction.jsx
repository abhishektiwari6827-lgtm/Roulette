"use client";

export default function ColorPrediction({ history }) {
  const redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  const last10 = history.slice(0, 10);

  // Count occurrences
  let redCount = 0;
  let blackCount = 0;
  let greenCount = 0;

  last10.forEach((num) => {
    if (num === 0) {
      greenCount++;
    } else if (redNumbers.has(num)) {
      redCount++;
    } else {
      blackCount++;
    }
  });

  // Simple frequency-based prediction
  const getPrediction = () => {
    if (redCount > blackCount && redCount > greenCount) return "RED";
    if (blackCount > redCount && blackCount > greenCount) return "BLACK";
    if (greenCount > redCount && greenCount > blackCount) return "GREEN";
    return "RANDOM";
  };

  const prediction = getPrediction();

  // Convert numbers to colors for display
  const colors = last10.map((num) => {
    if (num === 0) return "G";
    return redNumbers.has(num) ? "R" : "B";
  });

  return (
    <div className="bg-gray-700 p-3 rounded-lg mt-3 border border-gray-600">
      <h3 className="text-sm font-semibold text-amber-400 mb-2">
        Color Prediction (Last 10)
      </h3>

      {/* Pattern Display */}
      <div className="mb-3 p-2 bg-gray-800 rounded">
        <div className="text-xs text-gray-300 mb-1">Last Results:</div>
        <div className="flex justify-center space-x-1">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                color === "R"
                  ? "bg-red-600 text-white"
                  : color === "B"
                  ? "bg-black text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {color}
            </div>
          ))}
        </div>
        <div className="text-xs text-amber-300 mt-1 text-center">
          Based on frequency analysis
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <div className="text-red-400 font-bold">{redCount}</div>
          <div className="text-xs text-gray-400">RED</div>
        </div>
        <div className="text-center">
          <div className="text-gray-300 font-bold">{blackCount}</div>
          <div className="text-xs text-gray-400">BLACK</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-bold">{greenCount}</div>
          <div className="text-xs text-gray-400">GREEN</div>
        </div>
      </div>

      <div
        className={`text-center font-bold text-lg p-2 rounded ${
          prediction === "RED"
            ? "bg-red-600 text-white"
            : prediction === "BLACK"
            ? "bg-black text-white"
            : prediction === "GREEN"
            ? "bg-green-600 text-white"
            : "bg-amber-600 text-white"
        }`}
      >
        NEXT: {prediction}
      </div>

      <div className="text-xs text-gray-400 text-center mt-1">
        Most frequent color in last 10 spins
      </div>
    </div>
  );
}
