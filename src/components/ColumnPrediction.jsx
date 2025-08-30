"use client";

export default function ColumnPrediction({ history }) {
  const last10 = history.slice(0, 10);
  let col1Count = 0;
  let col2Count = 0;
  let col3Count = 0;

  last10.forEach((num) => {
    if (num === 0) return;
    if (num % 3 === 1) col1Count++;
    else if (num % 3 === 2) col2Count++;
    else col3Count++;
  });

  const getTopColumns = () => {
    const columns = [
      { name: "COLUMN 1", count: col1Count, color: "blue" },
      { name: "COLUMN 2", count: col2Count, color: "purple" },
      { name: "COLUMN 3", count: col3Count, color: "cyan" },
    ];

    // Sort by count descending and get top 2
    return columns.sort((a, b) => b.count - a.count).slice(0, 2);
  };

  const topColumns = getTopColumns();

  const getColumnColorClass = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-600 hover:bg-blue-500 border-blue-400";
      case "purple":
        return "bg-purple-600 hover:bg-purple-500 border-purple-400";
      case "cyan":
        return "bg-cyan-600 hover:bg-cyan-500 border-cyan-400";
      default:
        return "bg-gray-600";
    }
  };

  const getColumnBorderClass = (color) => {
    switch (color) {
      case "blue":
        return "border-blue-400";
      case "purple":
        return "border-purple-400";
      case "cyan":
        return "border-cyan-400";
      default:
        return "border-gray-400";
    }
  };

  const getColumnBgClass = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-900/30";
      case "purple":
        return "bg-purple-900/30";
      case "cyan":
        return "bg-cyan-900/30";
      default:
        return "bg-gray-900/30";
    }
  };

  const getColumnTextClass = (color) => {
    switch (color) {
      case "blue":
        return "text-blue-300";
      case "purple":
        return "text-purple-300";
      case "cyan":
        return "text-cyan-300";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="bg-gray-700 p-3 rounded-lg mt-3 border border-gray-600">
      <h3 className="text-sm font-semibold text-amber-400 mb-3 text-center">
        Column Prediction (Last 10 Spins)
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div
          className={`text-center p-3 rounded-lg border-2 ${getColumnBorderClass(
            "blue"
          )} ${getColumnBgClass("blue")}`}
        >
          <div
            className={`font-bold text-xl mb-1 ${getColumnTextClass("blue")}`}
          >
            {col1Count}
          </div>
          <div className="text-xs text-blue-200 font-medium">COLUMN 1</div>
        </div>
        <div
          className={`text-center p-3 rounded-lg border-2 ${getColumnBorderClass(
            "purple"
          )} ${getColumnBgClass("purple")}`}
        >
          <div
            className={`font-bold text-xl mb-1 ${getColumnTextClass("purple")}`}
          >
            {col2Count}
          </div>
          <div className="text-xs text-purple-200 font-medium">COLUMN 2</div>
        </div>
        <div
          className={`text-center p-3 rounded-lg border-2 ${getColumnBorderClass(
            "cyan"
          )} ${getColumnBgClass("cyan")}`}
        >
          <div
            className={`font-bold text-xl mb-1 ${getColumnTextClass("cyan")}`}
          >
            {col3Count}
          </div>
          <div className="text-xs text-cyan-200 font-medium">COLUMN 3</div>
        </div>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
        <h4 className="text-xs font-semibold text-amber-300 mb-2 text-center">
          TOP SUGGESTIONS
        </h4>
        <div className="flex justify-center gap-3">
          {topColumns.map((column, index) => (
            <div
              key={column.name}
              className={`px-3 py-2 rounded-lg border-2 ${getColumnBorderClass(
                column.color
              )} ${getColumnColorClass(
                column.color
              )} transition-all duration-200 transform hover:scale-105`}
            >
              <div className="flex items-center justify-center">
                <span className="text-white font-bold text-sm mr-1">
                  {index === 0 ? "🥇 " : "🥈 "}
                </span>
                <span className="text-white font-bold">
                  {column.name.replace("COLUMN ", "COL ")}
                </span>
              </div>
              <div className="text-white text-xs text-center mt-1">
                {column.count} hits
              </div>
            </div>
          ))}
        </div>

        {topColumns.length > 0 && (
          <div className="text-center mt-3">
            <div className="text-amber-300 text-xs">
              {topColumns[0].name.replace("COLUMN ", "Column ")} is trending
            </div>
            <div className="text-gray-400 text-[10px] mt-1">
              Based on last 10 results
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
