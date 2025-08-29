"use client";

import SuggestionDisplay from "./SuggestionDisplay";

export default function AnalyticsDashboard({
  history = [],
  topDozens = [],
  dozenCounts = { "1-12": 0, "13-24": 0, "25-36": 0 },
  onRemoveLast, // optional undo control
}) {
  const lastNumbers = history.slice(-15);

  // Frequency Map
  const freqMap = {};
  lastNumbers.forEach((n) => (freqMap[n] = (freqMap[n] || 0) + 1));

  const hotNumbers = Object.keys(freqMap).filter((n) => freqMap[n] >= 3);
  const warmNumbers = Object.keys(freqMap).filter((n) => freqMap[n] === 2);
  const coldNumbers = Object.keys(freqMap).filter((n) => freqMap[n] === 1);

  // 📌 Column stats
  const columnCounts = { "Col 1": 0, "Col 2": 0, "Col 3": 0 };
  history.forEach((num) => {
    if (num !== 0) {
      if (num % 3 === 1) columnCounts["Col 1"]++;
      else if (num % 3 === 2) columnCounts["Col 2"]++;
      else columnCounts["Col 3"]++;
    }
  });

  // 📌 Pattern Detector
  const recent = history.slice(-8); // last 8 spins

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

  // 📌 Top Columns (pattern के हिसाब से)
  const topColumns = Object.entries(columnTrend)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, val]) => val > 0)
    .slice(0, 2)
    .map(([col]) => col);

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

  return (
    <div className="w-full bg-white p-3 rounded-lg shadow max-h-72 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Analytics</h2>
        {onRemoveLast && (
          <button
            onClick={onRemoveLast}
            aria-label="Undo last number"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700 transition"
          >
            Undo Last
          </button>
        )}
      </div>

      {/* Animated SuggestionDisplay */}
      <SuggestionDisplay topDozens={topDozens} />

      {/* Top Columns */}
      {topColumns?.length > 0 && (
        <div className="mb-2 text-sm font-semibold flex flex-wrap gap-2">
          Top Columns:{" "}
          {topColumns.map((c, idx) => (
            <span
              key={idx}
              className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Hot/Warm/Cold */}
      <div className="flex flex-wrap gap-2 text-xs mb-2">
        {hotNumbers.length > 0 && (
          <span className="bg-red-500 text-white px-2 py-0.5 rounded">
            Hot: {hotNumbers.join(", ")}
          </span>
        )}
        {warmNumbers.length > 0 && (
          <span className="bg-orange-400 text-white px-2 py-0.5 rounded">
            Warm: {warmNumbers.join(", ")}
          </span>
        )}
        {coldNumbers.length > 0 && (
          <span className="bg-blue-400 text-white px-2 py-0.5 rounded">
            Cold: {coldNumbers.join(", ")}
          </span>
        )}
      </div>

      {/* Dozen Stats */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold mb-1">Dozen Stats</h3>
        <div className="flex gap-2 text-xs">
          <div className="flex-1">1-12: {dozenCounts["1-12"]}</div>
          <div className="flex-1">13-24: {dozenCounts["13-24"]}</div>
          <div className="flex-1">25-36: {dozenCounts["25-36"]}</div>
        </div>
        {/* Dozen Trend */}
        <div className="flex gap-2 text-xs mt-1">
          {Object.entries(dozenTrend).map(([key, val]) => (
            <div key={key} className="flex-1">
              {key} Trend: {val}
            </div>
          ))}
        </div>
      </div>

      {/* Column Stats */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold mb-1">Column Stats</h3>
        <div className="flex gap-2 text-xs">
          <div className="flex-1">Col 1: {columnCounts["Col 1"]}</div>
          <div className="flex-1">Col 2: {columnCounts["Col 2"]}</div>
          <div className="flex-1">Col 3: {columnCounts["Col 3"]}</div>
        </div>
        {/* Column Trend */}
        <div className="flex gap-2 text-xs mt-1">
          {Object.entries(columnTrend).map(([key, val]) => (
            <div key={key} className="flex-1">
              {key} Trend: {val}
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Detector */}
      <div className="mt-2 text-sm font-semibold text-emerald-700">
        {patternMessage}
      </div>
    </div>
  );
}
