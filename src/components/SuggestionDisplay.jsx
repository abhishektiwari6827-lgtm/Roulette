"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

// Simple target icon (no emojis) for accessibility-friendly heading
function TargetIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={"h-5 w-5 " + (props.className || "")}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle
        cx="12"
        cy="12"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path
        d="M12 3v3M21 12h-3M12 21v-3M6 12H3"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  );
}

export default function SuggestionDisplay({ topDozens }) {
  const [changed, setChanged] = useState(false);
  const keySig = useMemo(() => topDozens.join("|"), [topDozens]);

  useEffect(() => {
    setChanged(true);
    const t = setTimeout(() => setChanged(false), 450);
    return () => clearTimeout(t);
  }, [keySig]);

  // Guard empty
  if (!topDozens || topDozens.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Suggested dozens" className="mb-4">
        {/* Header */}
        <motion.div
          className="flex items-center gap-2 mb-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <TargetIcon className="text-amber-400" />
          <h3 className="text-lg font-semibold text-white text-pretty">
            Suggested Dozens
          </h3>
        </motion.div>

        {/* Container with subtle update pulse */}
        <motion.div
          key={keySig}
          className="rounded-xl bg-gray-700 p-2 ring-1 ring-amber-500/30"
          initial={false}
          animate={{
            boxShadow: changed
              ? "0 0 0 4px rgba(251,191,36,0.25)"
              : "0 0 0 0px rgba(0,0,0,0)",
            scale: changed ? 1.01 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 24,
            mass: 0.6,
          }}
        >
          {/* Chip list */}
          <motion.div
            layout
            className="flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <AnimatePresence initial={false}>
              {topDozens.map((d, idx) => (
                <motion.button
                  key={`${d}-${idx}`}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -6 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.5,
                  }}
                  aria-label={`Suggested dozen ${d}`}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 shadow-[0_4px_0_rgba(0,0,0,0.25)] transition-colors"
                >
                  <span className="relative z-10">{d}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}
//Done
