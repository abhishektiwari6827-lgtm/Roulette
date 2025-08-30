"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import RouletteWheel from "./components/RouletteWheel";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import RecentNumbers from "./components/RecentNumbers";
import QuickButtons from "./components/QuickButtons";

const STORAGE_KEY = "roulette_state_v2";
const HISTORY_CAP = 500;
const RECENT_CAP = 12;

function NumberInput({ numbersInput, setNumbersInput, onAddNumber }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddClick();
    }
  };

  const handleAddClick = () => {
    const num = parseInt(numbersInput);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      onAddNumber(num);
      setNumbersInput("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-xs shadow-lg rounded-lg overflow-hidden bg-gray-700 border border-gray-600"
    >
      <input
        type="number"
        min="0"
        max="36"
        placeholder="Number (0-36)"
        value={numbersInput}
        onChange={(e) => setNumbersInput(e.target.value)}
        onKeyDown={handleKeyPress}
        className="flex-1 p-2 border-0 bg-transparent outline-none text-white text-sm placeholder-gray-400"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddClick}
        className="px-3 bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition-all"
      >
        Add
      </motion.button>
    </motion.div>
  );
}

export default function App() {
  const [numbersInput, setNumbersInput] = useState("");
  const [history, setHistory] = useState([]);
  const [topDozens, setTopDozens] = useState([]);
  const [dozenCounts, setDozenCounts] = useState({
    "1-12": 0,
    "13-24": 0,
    "25-36": 0,
  });
  const [recentItems, setRecentItems] = useState([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setNumbersInput(saved.numbersInput || "");
        setHistory(saved.history || []);
        setTopDozens(saved.topDozens || []);
        setDozenCounts(
          saved.dozenCounts || { "1-12": 0, "13-24": 0, "25-36": 0 }
        );
        setRecentItems(saved.recentItems || []);
      }
    } catch (e) {
      console.warn("Failed to load roulette state:", e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      const payload = JSON.stringify({
        numbersInput,
        history,
        topDozens,
        dozenCounts,
        recentItems,
      });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.warn("Failed to save roulette state:", e);
    }
  }, [numbersInput, history, topDozens, dozenCounts, recentItems]);

  const lastSpinIdRef = useRef(null);
  const lastAppendTimeRef = useRef(0);

  const calculateSuggestion = useCallback((nums) => {
    let count1 = 0,
      count2 = 0,
      count3 = 0;
    nums.forEach((n) => {
      if (n >= 1 && n <= 12) count1++;
      else if (n >= 13 && n <= 24) count2++;
      else if (n >= 25 && n <= 36) count3++;
    });
    const sectors = [
      { name: "1-12", count: count1 },
      { name: "13-24", count: count2 },
      { name: "25-36", count: count3 },
    ];
    sectors.sort((a, b) => b.count - a.count);
    setTopDozens(sectors.slice(0, 2).map((s) => s.name));
    setDozenCounts({ "1-12": count1, "13-24": count2, "25-36": count3 });
  }, []);

  const appendResult = useCallback(
    (number, spinId = null) => {
      const num = parseInt(number);
      if (isNaN(num) || num < 0 || num > 36) return;

      const now = Date.now();
      if (spinId !== null && lastSpinIdRef.current === spinId) return;
      if (spinId !== null) lastSpinIdRef.current = spinId;
      if (now - lastAppendTimeRef.current < 500) return;

      lastAppendTimeRef.current = now;

      setHistory((prev) => {
        const updated = [num, ...prev].slice(0, HISTORY_CAP);
        calculateSuggestion(updated);
        return updated;
      });

      setRecentItems((prev) => {
        const lastTs = prev[0]?.ts || 0;
        const tsUnique = now <= lastTs ? lastTs + 1 : now;
        return [{ value: num, outcome: null, ts: tsUnique }, ...prev].slice(
          0,
          RECENT_CAP
        );
      });
    },
    [calculateSuggestion]
  );

  const handleSpinResult = useCallback(
    (res) => {
      const number = typeof res === "number" ? res : res?.value;
      const spinId = typeof res === "object" ? res?.spinId : undefined;
      appendResult(number, spinId);
    },
    [appendResult]
  );

  const markRecentOutcome = useCallback((ts, outcome) => {
    setRecentItems((prev) =>
      prev.map((it) => (it.ts === ts ? { ...it, outcome } : it))
    );
  }, []);

  const removeLast = useCallback(() => {
    if (history.length === 0) return;

    const updatedHistory = history.slice(1);
    setHistory(updatedHistory);
    setRecentItems((prev) => (prev.length > 0 ? prev.slice(1) : []));
    calculateSuggestion(updatedHistory);
  }, [history, calculateSuggestion]);

  const addNumber = useCallback(
    (num) => {
      appendResult(num);
    },
    [appendResult]
  );

  const handleBet = useCallback((betType) => {
    // Handle different types of bets
    console.log("Bet placed on:", betType);
    // You can implement specific logic for different bet types here
  }, []);

  const handleClear = useCallback(() => {
    lastSpinIdRef.current = null;
    lastAppendTimeRef.current = 0;

    setNumbersInput("");
    setHistory([]);
    setTopDozens([]);
    setRecentItems([]);
    setDozenCounts({ "1-12": 0, "13-24": 0, "25-36": 0 });

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-3 py-4 max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-4"
        >
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent"
            animate={{
              scale: [1, 1.01, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Roulette Analyzer
          </motion.h1>
        </motion.header>

        {/* Main Content - Modified layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-3">
          {/* Wheel Container */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-3 border border-gray-700 flex flex-col items-center"
          >
            <RouletteWheel onSpinResult={handleSpinResult} size={280} />

            {/* Manual Input - Now on the right side of wheel */}
            <div className="mt-4 w-full">
              <h3 className="text-sm font-semibold text-amber-400 mb-2 text-center">
                Manual Input
              </h3>
              <div className="flex justify-center">
                <NumberInput
                  numbersInput={numbersInput}
                  setNumbersInput={setNumbersInput}
                  onAddNumber={addNumber}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={removeLast}
                  className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-500"
                  title="Undo Last"
                >
                  ↩ Undo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
                  title="Clear All"
                >
                  × Clear
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Buttons Container */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-2 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-3 border border-gray-700"
          >
            <QuickButtons onAddNumber={addNumber} onBet={handleBet} />
          </motion.div>

          {/* Analytics - Made smaller */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-3 border border-gray-700"
          >
            <AnalyticsDashboard
              history={history}
              topDozens={topDozens}
              dozenCounts={dozenCounts}
              onRemoveLast={removeLast}
            />
            <RecentNumbers
              items={recentItems}
              onRemoveLast={removeLast}
              onMarkOutcome={markRecentOutcome}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
