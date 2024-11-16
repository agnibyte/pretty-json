import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [isFormatted, setIsFormatted] = useState(true);
  const contentEditableRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [collapsibleRanges, setCollapsibleRanges] = useState([]);
  const [lines, setLines] = useState([]);

  const getSuggestions = (error) => {
    if (error.message.includes("Unexpected token")) {
      return "Suggestion: Check for trailing commas or missing quotation marks.";
    } else if (error.message.includes("Unexpected end of JSON input")) {
      return "Suggestion: Ensure all braces and brackets are properly closed.";
    }
    return "Suggestion: Review your JSON structure.";
  };

  const getJsonErrorWithLine = (error, jsonString) => {
    const positionMatch = error.message.match(/position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const lines = jsonString.substring(0, position).split("\n");
      const lineNumber = lines.length;
      return `Error: Invalid JSON at line ${lineNumber} - ${error.message}`;
    }
    return "Error: Invalid JSON - " + error.message;
  };

  const handleFormat = () => {
    const test1 = formattedJson && JSON.stringify(formattedJson);
    const test2 = JSON.stringify(jsonInput);
    const areJsonEqual = test1 === test2;
    console.log({ areJsonEqual });
    // console.log("areJsonEqual json", test1);
    // console.log("areJsonEqual 2", test2);
    try {
      const stringJson = JSON.stringify(jsonInput);
      const parsedJson = JSON.parse(stringJson);
      // console.log("parsedJson", isFormatted, parsedJson);
      const newFormattedJson = JSON.stringify(parsedJson, null, 2);
      setFormattedJson(newFormattedJson); // Set formatted JSON
      // setJsonInput(newFormattedJson); // Set jsonInput to formatted JSON as well
      setError(null);
      setIsFormatted(true);
      console.log("stringJson check", stringJson === newFormattedJson);
    } catch (e) {
      const errorMessage = getJsonErrorWithLine(e, jsonInput);
      setError(errorMessage);
      setSuggestions(getSuggestions(e));
    }
  };

  const toggleCollapse = (startLine) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [startLine]: !prev[startLine],
    }));
  };

  const parseJsonWithCollapse = (jsonString) => {
    let parsedJsonString = jsonString;
    if (typeof parsedJsonString !== "string") {
      try {
        parsedJsonString = JSON.stringify(jsonString, null, 2); // Use pretty-print format if needed
      } catch (error) {
        console.error("Error converting JSON object to string:", error);
        parsedJsonString = ""; // Set to an empty string if conversion fails
      }
    }

    try {
      const lines = parsedJsonString.split("\n");
      const collapsibleRanges = [];
      const stack = [];

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("{") || trimmedLine.startsWith("[")) {
          stack.push(index);
        } else if (trimmedLine.endsWith("}") || trimmedLine.endsWith("]")) {
          const start = stack.pop();
          if (start !== undefined) {
            collapsibleRanges.push({ start, end: index });
          }
        }
      });

      return { lines, collapsibleRanges };
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return { lines: [], collapsibleRanges: [] };
    }
  };

  useEffect(() => {
    const jsonString = isFormatted ? formattedJson : jsonInput;
    const parsedData = parseJsonWithCollapse(jsonString);
    setLines(parsedData.lines);
    setCollapsibleRanges(parsedData.collapsibleRanges);
  }, [isFormatted, formattedJson, jsonInput]);

  const handleEdit = (e) => {
    console.log("in handleEdit");
    const jsonContent = e.currentTarget.innerText;
    try {
      const parsedJson = JSON.parse(jsonContent);
      setIsFormatted(false);
      setJsonInput(parsedJson);
      setError(null);
    } catch (error) {
      setError("Invalid JSON format");
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center">
      <div className="bg-gray-700 p-6 rounded shadow-lg max-w-5xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">
          Editable JSON Formatter with Collapsible Sections
        </h1>

        <div className="flex flex-col items-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition mb-4"
            onClick={handleFormat}
          >
            Format JSON
          </button>

          <div
            key={formattedJson + isFormatted}
            className="flex w-full bg-gray-300 p-4 border rounded"
          >
            {/* Line Numbers and Collapse Arrows */}
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
                  line.trim().startsWith("{") || line.trim().startsWith("[");
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
                          marginLeft: "5px",
                        }}
                      >
                        {collapsedSections[index] ? "▶" : "▼"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* JSON Content */}
            <div
              ref={contentEditableRef}
              contentEditable
              suppressContentEditableWarning={true}
              onInput={handleEdit}
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                color: "black",
                outline: "none",
                width: "100%",
              }}
            >
              {lines &&
                lines.map((line, index) => {
                  const isCollapsed = collapsedSections[index];
                  const range = collapsibleRanges.find(
                    (range) => range.start === index
                  );

                  if (
                    isCollapsed &&
                    range &&
                    index > range.start &&
                    index <= range.end
                  ) {
                    return null;
                  }

                  return (
                    <div key={index}>
                      {isCollapsed && range && index === range.start
                        ? line.trim().startsWith("{")
                          ? "{...}"
                          : "[...]"
                        : line}
                    </div>
                  );
                })}
            </div>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}

          {suggestions && error && (
            <p className="text-yellow-600 mt-2">{suggestions}</p>
          )}
        </div>
      </div>
    </div>
  );
}
