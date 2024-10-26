import { useState, useRef } from "react";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const preRef = useRef(null);

  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formattedJson);
      setError(null);
    } catch (e) {
      setError("Invalid JSON");
    }
  };

  const toggleCollapse = (startLine) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [startLine]: !prev[startLine],
    }));
  };
console.log('collapsedSections', collapsedSections)
  const parseJsonWithCollapse = (json) => {
    const lines = json.split("\n");
    const collapsibleRanges = [];
    const stack = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        stack.push(index);
      } else if (trimmed.endsWith("}") || trimmed.endsWith("]")) {
        const start = stack.pop();
        if (start !== undefined) {
          collapsibleRanges.push({ start, end: index });
        }
      }
    });

    return { lines, collapsibleRanges };
  };

  const { lines, collapsibleRanges } = parseJsonWithCollapse(jsonInput);

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center">
      <div className="bg-gray-700 p-6 rounded shadow-lg max-w-5xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">
          Editable JSON Formatter with Collapsible Blocks
        </h1>

        <div className="flex flex-col items-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition mb-4"
            onClick={formatJson}
          >
            Format JSON
          </button>

          {/* Line numbers, arrows, and JSON editor */}
          <div className="flex w-full">
            {/* Line Numbers and Arrows */}
            <div
              style={{
                paddingRight: "10px",
                textAlign: "right",
                fontFamily: "monospace",
                color: "gray",
                userSelect: "none",
              }}
            >
              {lines.map((line, index) => {
                const isCollapsible =
                  line.trim().includes("{") || line.trim().includes("[");
                return (
                  <div
                    key={index}
                    className="flex items-center"
                  >
                    <span>{index + 1}</span>
                    {isCollapsible && (
                      <button
                        onClick={() => toggleCollapse(index)}
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          marginRight: "5px",
                        }}
                      >
                        {collapsedSections[index] ? "▶" : "▼"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Editable JSON Input/Output in One <pre> Tag */}
            <div className="bg-gray-100 p-4 border rounded w-full">
              <pre
                ref={preRef}
                contentEditable="true"
                suppressContentEditableWarning={true}
                onInput={(e) => setJsonInput(e.currentTarget.innerText)}
                style={{
                  whiteSpace: "pre-wrap",
                  outline: "none",
                  fontFamily: "monospace",
                  minHeight: "200px",
                  color: "black",
                }}
                className="text-black"
              >
                {lines.map((line, index) => {
                  const isCollapsed = collapsedSections[index];
                  const range = collapsibleRanges.find(
                    (range) => range.start === index
                  );

                  // If the line is part of a collapsed section, hide lines within the range
                  if (
                    isCollapsed &&
                    range &&
                    index > range.start &&
                    index <= range.end
                  ) {
                    return null;
                  }

                  // Show collapsed summary for the start of a collapsible section
                  if (isCollapsed && range && index === range.start) {
                    return (
                      <div
                        key={index}
                        style={{ cursor: "pointer" }}
                      >
                        {line.trim().startsWith("{") ? "{...}" : "[...]"}
                      </div>
                    );
                  }

                  return <div key={index}>{line}</div>;
                })}
              </pre>
            </div>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
