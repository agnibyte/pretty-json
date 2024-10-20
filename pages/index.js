import { useState, useEffect, useRef } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import icons for expand/collapse

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [lineNumbers, setLineNumbers] = useState(["1"]);
  const [collapsed, setCollapsed] = useState({}); // Track collapsed state
  const [isValidJson, setIsValidJson] = useState(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    const lines = jsonInput.split("\n").length;
    const numbers = Array.from({ length: lines }, (_, i) => i + 1);
    setLineNumbers(numbers);
  }, [jsonInput]);

  const handleFormat = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsedJson, null, 2));
      setError("");
      setSuggestions("");
      setIsValidJson(true);
    } catch (e) {
      const errorMessage = getJsonErrorWithLine(e, jsonInput);
      setError(errorMessage);
      setSuggestions(getSuggestions(e));
      setIsValidJson(false);
    }
  };

  const handleValidate = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setError("");
      setSuggestions("");
      setIsValidJson(true);
    } catch (e) {
      const errorMessage = getJsonErrorWithLine(e, jsonInput);
      setError(errorMessage);
      setSuggestions(getSuggestions(e));
      setIsValidJson(false);
    }
  };

  const getJsonErrorWithLine = (error, jsonString) => {
    const errorMsg = error.message;
    const positionMatch = errorMsg.match(/position (\d+)/);
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const lines = jsonString.substring(0, position).split("\n");
      const lineNumber = lines.length;
      return `Error: Invalid JSON at line ${lineNumber} - ${error.message}`;
    }
    return "Error: Invalid JSON - " + error.message;
  };

  const getSuggestions = (error) => {
    if (error.message.includes("Unexpected token")) {
      return "Suggestion: Check for trailing commas or missing quotation marks.";
    } else if (error.message.includes("Unexpected end of JSON input")) {
      return "Suggestion: Ensure all braces and brackets are properly closed.";
    }
    return "Suggestion: Review your JSON structure.";
  };

  const autoFixJson = () => {
    let fixedJson = jsonInput
      .replace(/,(\s*})/g, "$1")
      .replace(/,(\s*])/g, "$1")
      .replace(/([{,])\s*([^"'\s]+)\s*:/g, '$1"$2":');

    setJsonInput(fixedJson);
    handleFormat();
  };

  // Function to toggle collapsed state
  const toggleCollapse = (key) => {
    setCollapsed((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  // Recursive component to display JSON with collapse/expand
  const JsonViewer = ({ data, path = "" }) => {
    if (typeof data === "object" && data !== null) {
      const isArray = Array.isArray(data);
      const keys = isArray ? data.map((_, i) => i) : Object.keys(data);

      return (
        <div style={{ paddingLeft: "20px" }}>
          <span>
            <button
              onClick={() => toggleCollapse(path)}
              style={{ cursor: "pointer", background: "none", border: "none" }}
            >
              {collapsed[path] ? <AiOutlineDown /> : <AiOutlineUp />}
            </button>{" "}
            {isArray ? `[${keys.length} items]` : `{${keys.length} keys}`}
          </span>
          {!collapsed[path] && (
            <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
              {keys.map((key) => (
                <li key={key}>
                  <strong>{isArray ? `[${key}]` : `"${key}":`}</strong>
                  <JsonViewer
                    data={data[key]}
                    path={`${path}/${key}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    } else {
      return <span>{JSON.stringify(data)}</span>;
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">
        JSON Formatter & Validator
      </h1>

      <div className="flex w-full">
        {/* Line numbers with expand/collapse icons */}
        <div className="bg-gray-200 text-right p-2 pr-4 select-none">
          {lineNumbers.map((line, index) => (
            <div
              key={line}
              className="leading-6"
            >
              {index < lineNumbers.length - 1 &&
              (jsonInput.split("\n")[index].includes("{") ||
                jsonInput.split("\n")[index].includes("[")) ? (
                <span>
                  <button
                    onClick={() => toggleCollapse(`line-${index}`)}
                    className="mr-2 bg-red"
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                    }}
                  >
                    {collapsed[`line-${index}`] ? (
                      <AiOutlineDown />
                    ) : (
                      <AiOutlineUp />
                    )}
                  </button>
                </span>
              ) : null}
              {line}
            </div>
          ))}
        </div>

        {/* Textarea for JSON input */}
        <textarea
          ref={textareaRef}
          className={`w-full p-2 border border-gray-300 rounded-md ${
            isValidJson === true
              ? "bg-green-100"
              : isValidJson === false
              ? "bg-red-100"
              : ""
          }`}
          rows={10}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste JSON here"
          style={{ resize: "none" }}
          id="inputox"
        ></textarea>
      </div>

      <div className="mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={handleFormat}
        >
          Format JSON
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleValidate}
        >
          Validate JSON
        </button>
        {isValidJson === false && (
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded ml-2"
            onClick={autoFixJson}
          >
            Auto-Fix JSON
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {suggestions && <p className="text-yellow-600 mt-2">{suggestions}</p>}

      {/* JSON Viewer */}
      {jsonInput && (
        <div className="mt-4 w-full">
          <h2 className="text-xl font-semibold mb-2">JSON Structure:</h2>
          <JsonViewer data={JSON.parse(jsonInput)} />
        </div>
      )}
    </div>
  );
}
