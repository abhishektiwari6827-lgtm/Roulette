"use client";

import SuggestionDisplay from "./SuggestionDisplay";

export default function AnalyticsDashboard({
  history = [],
  topDozens = [],
  dozenCounts = { "1-12": 0, "13-24": 0, "25-36": 0 },
  onRemoveLast,
}) {
  const last50Numbers = history.slice(0, 50); // Last 50 numbers

  // Frequency Map for last 50 numbers
  const freqMap = {};
  last50Numbers.forEach((n) => (freqMap[n] = (freqMap[n] || 0) + 1));

  // Convert to array and sort by frequency (ascending for cold numbers)
  const numberFrequencies = Object.entries(freqMap)
    .map(([num, count]) => ({ num: Number(num), count }))
    .sort((a, b) => a.count - b.count); // Sort by frequency ascending

  // Top 5 hot numbers (highest frequency) - descending order
  const hotNumbers = Object.entries(freqMap)
    .map(([num, count]) => ({ num: Number(num), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => item.num);

  // Top 5 cold numbers (lowest frequency) - ascending order
  const coldNumbers = numberFrequencies
    .filter((item) => item.count > 0) // Only numbers that have appeared at least once
    .slice(0, 5) // Top 5 coldest numbers
    .map((item) => item.num);

  // Column stats
  const columnCounts = { "Col 1": 0, "Col 2": 0, "Col 3": 0 };
  history.forEach((num) => {
    if (num !== 0) {
      if (num % 3 === 1) columnCounts["Col 1"]++;
      else if (num % 3 === 2) columnCounts["Col 2"]++;
      else columnCounts["Col 3"]++;
    }
  });

  // Pattern Detector
  const recent = history.slice(-8);
  const dozenTrend = { "1-12": 0, "13-24": 0, "25-36": 0 };
  const columnTrend = { "Col 1": 0, "Col 2": 0, "Col 3": 0 };

  recent.forEach((num) => {
    // dozen trend
    if (num >= 1 && num <= 12) dozenTrend["1-12"]++;
    else if (num >= 13 && num <= 24) dozenTrend["13-24"]++;
    else if (num >= 25 && num <= 36) dozenTrend["25-36"]++;

    // column trend
    if (num !== 0) {
      if (num % 3 === 1) columnTrend["Col 1"]++;
      else if (num % 3 === 2) columnTrend["Col 2"]++;
      else columnTrend["Col 3"]++;
    }
  });

  const strongestDozen = Object.entries(dozenTrend).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const strongestColumn = Object.entries(columnTrend).sort(
    (a, b) => b[1] - a[1]
  )[0];

  let patternMessage = "Mixed Pattern – no clear trend";
  if (strongestDozen[1] >= 4) {
    patternMessage = `Strong Dozen Trend: ${strongestDozen[0]}`;
  } else if (strongestColumn[1] >= 4) {
    patternMessage = `Strong Column Trend: ${strongestColumn[0]}`;
  } else if (strongestDozen[1] === 3 || strongestColumn[1] === 3) {
    patternMessage = `Possible Bias Towards: ${
      strongestDozen[1] >= strongestColumn[1]
        ? strongestDozen[0]
        : strongestColumn[0]
    }`;
  }

  const total = Object.values(dozenCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full bg-gray-800 bg-opacity-70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
        {onRemoveLast && (
          <button
            onClick={onRemoveLast}
            aria-label="Undo last number"
            className="px-3 py-1 text-sm rounded bg-amber-600 text-white hover:bg-amber-500 transition-all"
          >
            Undo Last
          </button>
        )}
      </div>

      <SuggestionDisplay topDozens={topDozens} />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            Hot Numbers (Last 50)
          </h3>
          <div className="text-xs text-gray-400 mb-2">
            Top 5 most frequent numbers
          </div>
          <div className="flex flex-wrap gap-1">
            {hotNumbers.length > 0 ? (
              hotNumbers.map((n) => (
                <span
                  key={n}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                >
                  {n}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">None</span>
            )}
          </div>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            Cold Numbers (Last 50)
          </h3>
          <div className="text-xs text-gray-400 mb-2">
            Top 5 least frequent numbers
          </div>
          <div className="flex flex-wrap gap-1">
            {coldNumbers.length > 0 ? (
              coldNumbers.map((n) => (
                <span
                  key={n}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                >
                  {n}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">None</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {["1-12", "13-24", "25-36"].map((d) => (
          <div key={d} className="bg-gray-700 p-2 rounded-lg text-center">
            <div className="text-xs text-amber-400 mb-1">{d}</div>
            <div className="text-white font-bold">{dozenCounts[d]}</div>
            <div className="text-xs text-gray-400">
              {total ? ((dozenCounts[d] / total) * 100).toFixed(1) : 0}%
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-700 p-3 rounded-lg">
        <h3 className="text-sm font-semibold text-amber-400 mb-2">
          Pattern Detection
        </h3>
        <div className="text-white text-sm">{patternMessage}</div>
      </div>
    </div>
  );
}
