"use client";

import { useEffect, useState, useRef } from "react";
import NumberInput from "./components/NumberInput";
import QuickButtons from "./components/QuickButtons";
import RouletteWheel from "./components/RouletteWheel";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import RecentNumbers from "./components/RecentNumbers";

// European Roulette numbers with colors
const numbers = [
  { value: 0, color: "green" },
  { value: 32, color: "red" },
  { value: 15, color: "black" },
  { value: 19, color: "red" },
  { value: 4, color: "black" },
  { value: 21, color: "red" },
  { value: 2, color: "black" },
  { value: 25, color: "red" },
  { value: 17, color: "black" },
  { value: 34, color: "red" },
  { value: 6, color: "black" },
  { value: 27, color: "red" },
  { value: 13, color: "black" },
  { value: 36, color: "red" },
  { value: 11, color: "black" },
  { value: 30, color: "red" },
  { value: 8, color: "black" },
  { value: 23, color: "red" },
  { value: 10, color: "black" },
  { value: 5, color: "red" },
  { value: 24, color: "black" },
  { value: 16, color: "red" },
  { value: 33, color: "black" },
  { value: 1, color: "red" },
  { value: 20, color: "black" },
  { value: 14, color: "red" },
  { value: 31, color: "black" },
  { value: 9, color: "red" },
  { value: 22, color: "black" },
  { value: 18, color: "red" },
  { value: 29, color: "black" },
  { value: 7, color: "red" },
  { value: 28, color: "black" },
  { value: 12, color: "red" },
  { value: 35, color: "black" },
  { value: 3, color: "red" },
  { value: 26, color: "black" },
];

const STORAGE_KEY = "roulette_state_v1";
const HISTORY_CAP = 500;
const RECENT_CAP = 12;

export default function App() {
  const [numbersInput, setNumbersInput] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw).numbersInput || "" : "";
    } catch {
      return "";
    }
  });
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      return Array.isArray(saved?.history)
        ? saved.history.slice(0, HISTORY_CAP)
        : [];
    } catch {
      return [];
    }
  });
  const [topDozens, setTopDozens] = useState([]);
  const [recentNumbers, setRecentNumbers] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (Array.isArray(saved?.recentItems)) {
        return saved.recentItems
          .slice(0, RECENT_CAP)
          .map((it) => it?.value)
          .filter((n) => typeof n === "number");
      }
      if (Array.isArray(saved?.recentNumbers)) {
        return saved.recentNumbers.slice(0, RECENT_CAP);
      }
      return history.slice(0, RECENT_CAP);
    } catch {
      return [];
    }
  });
  const [dozenCounts, setDozenCounts] = useState({
    "1-12": 0,
    "13-24": 0,
    "25-36": 0,
  });
  const [spinAngle, setSpinAngle] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      return typeof saved?.spinAngle === "number" ? saved.spinAngle : 0;
    } catch {
      return 0;
    }
  });
  const [hoveredNumber, setHoveredNumber] = useState(null);
  const [recentItems, setRecentItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      let items = Array.isArray(saved?.recentItems)
        ? saved.recentItems
        : (Array.isArray(saved?.recentNumbers)
            ? saved.recentNumbers
            : history.slice(0, RECENT_CAP)
          )
            .slice(0, RECENT_CAP)
            .map((n) => ({ value: n, outcome: null, ts: Date.now() }));
      // ensure well-formed & unique ts ordering
      items = items
        .map((it) => ({
          value: typeof it === "number" ? it : it?.value,
          outcome: it?.outcome ?? null,
          ts: typeof it?.ts === "number" ? it.ts : Date.now(),
        }))
        .filter((it) => typeof it.value === "number");
      let lastTs = 0;
      items = items.slice(0, RECENT_CAP).map((it) => {
        const nextTs = it.ts <= lastTs ? lastTs + 1 : it.ts;
        lastTs = nextTs;
        return { ...it, ts: nextTs };
      });
      return items;
    } catch {
      return [];
    }
  });

  // Dozen calc for analytics
  const calculateSuggestion = (nums) => {
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
  };

  // Persist to localStorage whenever critical state changes
  useEffect(() => {
    try {
      const payload = JSON.stringify({
        history,
        recentNumbers,
        recentItems,
        numbersInput,
        spinAngle,
      });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.warn("[v0] Failed to save roulette state:", e);
    }
  }, [history, recentNumbers, recentItems, numbersInput, spinAngle]);

  const lastResultRef = useRef({ value: null, ts: 0 });
  const DUP_WINDOW_MS = 12000;
  const SPIN_LOCK_MS = 12000;
  const spinLockUntilRef = useRef(0);
  const resultGuardRef = useRef({ active: false, timer: null });
  const lastSpinIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resultGuardRef.current.timer) {
        clearTimeout(resultGuardRef.current.timer);
        resultGuardRef.current.timer = null;
      }
    };
  }, []);

  const handleSpinResult = (res) => {
    const now = Date.now();
    const number = typeof res === "number" ? res : res?.value;
    const spinId = typeof res === "object" ? res?.spinId : undefined;
    if (typeof number !== "number") return;

    // Per-spin guard: if same spinId already processed, ignore
    if (spinId != null) {
      if (lastSpinIdRef.current === spinId) {
        return;
      }
      lastSpinIdRef.current = spinId;
    }

    // keep secondary time-based lock (defensive)
    if (resultGuardRef.current.active) {
      return;
    }
    if (now < spinLockUntilRef.current) {
      return;
    }
    resultGuardRef.current.active = true;
    if (resultGuardRef.current.timer)
      clearTimeout(resultGuardRef.current.timer);
    resultGuardRef.current.timer = setTimeout(() => {
      resultGuardRef.current.active = false;
      resultGuardRef.current.timer = null;
      spinLockUntilRef.current = 0;
    }, SPIN_LOCK_MS);
    spinLockUntilRef.current = now + SPIN_LOCK_MS;

    if (history[0] === number) {
      return;
    }
    const { value, ts } = lastResultRef.current;
    if (value === number && now - ts < DUP_WINDOW_MS) {
      return;
    }
    lastResultRef.current = { value: number, ts: now };

    setHistory((prev) => {
      const updated = [number, ...prev].slice(0, HISTORY_CAP);
      setRecentNumbers((prevR) => [number, ...prevR].slice(0, RECENT_CAP));
      setRecentItems((prevI) => {
        const lastTs = prevI[0]?.ts || 0;
        const tsUnique = now <= lastTs ? lastTs + 1 : now;
        return [{ value: number, outcome: null, ts: tsUnique }, ...prevI].slice(
          0,
          RECENT_CAP
        );
      });
      calculateSuggestion(updated);
      return updated;
    });
  };

  const markRecentOutcome = (ts, outcome) => {
    setRecentItems((prev) =>
      prev.map((it) => (it.ts === ts ? { ...it, outcome } : it))
    );
  };

  const removeLast = () => {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const updated = prev.slice(1);
      setRecentNumbers((prevR) => (prevR.length ? prevR.slice(1) : prevR));
      setRecentItems((prevI) => (prevI.length ? prevI.slice(1) : prevI));
      calculateSuggestion(updated);
      return updated;
    });
  };

  const addNumber = (num) => {
    if (!isNaN(num) && num >= 0 && num <= 36) {
      const now = Date.now();
      const updatedHistory = [num, ...history].slice(0, HISTORY_CAP);
      setHistory(updatedHistory);
      setRecentNumbers((prev) => [num, ...prev].slice(0, RECENT_CAP));
      setRecentItems((prev) => {
        const lastTs = prev[0]?.ts || 0;
        const tsUnique = now <= lastTs ? lastTs + 1 : now;
        return [{ value: num, outcome: null, ts: tsUnique }, ...prev].slice(
          0,
          RECENT_CAP
        );
      });
      calculateSuggestion(updatedHistory);
      const randomSpin = Math.floor(Math.random() * 270) + 90;
      setSpinAngle((prev) => prev + randomSpin);
    }
  };

  const handleClear = () => {
    spinLockUntilRef.current = 0;
    lastResultRef.current = { value: null, ts: 0 };
    resultGuardRef.current.active = false;
    if (resultGuardRef.current.timer) {
      clearTimeout(resultGuardRef.current.timer);
      resultGuardRef.current.timer = null;
    }
    lastSpinIdRef.current = null;

    setHistory([]);
    setTopDozens([]);
    setRecentNumbers([]);
    setRecentItems([]);
    setDozenCounts({ "1-12": 0, "13-24": 0, "25-36": 0 });
    setSpinAngle(0);
    setNumbersInput("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 gap-6">
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <RouletteWheel
            history={history}
            spinAngle={spinAngle}
            hoveredNumber={hoveredNumber}
            setHoveredNumber={setHoveredNumber}
            onSpinResult={handleSpinResult}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <AnalyticsDashboard
            history={history}
            topDozens={topDozens}
            dozenCounts={dozenCounts}
            onRemoveLast={removeLast}
          />
          <RecentNumbers
            items={recentItems}
            numbers={recentNumbers}
            onRemoveLast={removeLast}
            onMarkOutcome={markRecentOutcome}
          />

          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Clear History
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-4 items-center">
        <NumberInput
          numbersInput={numbersInput}
          setNumbersInput={setNumbersInput}
          onAddNumber={addNumber}
        />
        <QuickButtons onAddNumber={addNumber} />
      </div>
    </div>
  );
}
