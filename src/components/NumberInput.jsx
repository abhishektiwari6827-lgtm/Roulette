"use client";

export default function NumberInput({
  numbersInput,
  setNumbersInput,
  onAddNumber,
}) {
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
    <div className="flex w-full max-w-xs shadow-lg rounded-lg overflow-hidden bg-gray-700 border border-gray-600">
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
      <button
        onClick={handleAddClick}
        className="px-3 bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition-all"
      >
        Add
      </button>
    </div>
  );
}
