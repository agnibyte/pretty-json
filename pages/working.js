import { useState } from 'react';

const isObject = (value) => typeof value === 'object' && !Array.isArray(value) && value !== null;
const isArray = (value) => Array.isArray(value);

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);
  const [collapsedKeys, setCollapsedKeys] = useState({});
  const [formattedJson, setFormattedJson] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState(null);

  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setFormattedJson(parsedJson);
      setError(null);
    } catch (e) {
      setError('Invalid JSON');
    }
  };

  const toggleCollapse = (key) => {
    setCollapsedKeys((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleEditKey = (oldKey, newKey, parentJson) => {
    if (newKey && newKey !== oldKey) {
      const { [oldKey]: value, ...rest } = parentJson;
      parentJson[newKey] = value;
      delete parentJson[oldKey];
      setFormattedJson({ ...formattedJson });
    }
  };

  const handleEditValue = (key, newValue, parentJson) => {
    parentJson[key] = newValue;
    setFormattedJson({ ...formattedJson });
  };

  const renderJson = (json, parentKey = '', parentJson = {}) => {
    if (isObject(json)) {
      return (
        <>
          <span className="text-gray-500">{'{'}</span>
          <div style={{ marginLeft: '20px' }}>
            {Object.keys(json).map((key) => {
              const uniqueKey = `${parentKey}.${key}`;
              const isCollapsed = collapsedKeys[uniqueKey];
              const value = json[key];

              return (
                <div key={uniqueKey}>
                  {/* Editable Key */}
                  <span
                    style={{ color: 'skyblue', cursor: 'pointer' }}
                    onClick={() => setEditingKey(uniqueKey)}
                  >
                    {editingKey === uniqueKey ? (
                      <input
                        type="text"
                        defaultValue={key}
                        onBlur={(e) => {
                          handleEditKey(key, e.target.value, parentJson);
                          setEditingKey(null);
                        }}
                        style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                      />
                    ) : (
                      `"${key}"`
                    )}
                  </span>
                  <span className="text-gray-500">:</span>{' '}
                  <span
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => toggleCollapse(uniqueKey)}
                  >
                    {isCollapsed ? <span className="text-gray-500"> {'{....}'} </span> : ''}
                  </span>
                  {!isCollapsed && renderJson(value, uniqueKey, json)}
                </div>
              );
            })}
          </div>
          <span className="text-gray-500">{'}'}</span>
        </>
      );
    } else if (isArray(json)) {
      return (
        <>
          <span className="text-gray-500">{'['}</span>
          <div style={{ marginLeft: '20px' }}>
            {json.map((item, index) => {
              const uniqueKey = `${parentKey}[${index}]`;
              const isCollapsed = collapsedKeys[uniqueKey];
              return (
                <div key={uniqueKey}>
                  <span
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => toggleCollapse(uniqueKey)}
                  >
                    {isCollapsed ? <span className="text-gray-500">[....]</span> : ''}
                  </span>
                  {!isCollapsed && renderJson(item, uniqueKey, json)}
                  {index < json.length - 1 && <span className="text-gray-500">,</span>}
                </div>
              );
            })}
          </div>
          <span className="text-gray-500">{']'}</span>
        </>
      );
    } else {
      return (
        <span
          onClick={() => setEditingValue(parentKey)}
          style={{
            color: typeof json === 'string' ? 'orange' : typeof json === 'boolean' ? 'blue' : 'purple',
            cursor: 'pointer',
          }}
        >
          {editingValue === parentKey ? (
            <input
              type="text"
              defaultValue={json}
              onBlur={(e) => {
                handleEditValue(parentKey.split('.').pop(), e.target.value, parentJson);
                setEditingValue(null);
              }}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
            />
          ) : (
            json && json.toString()
          )}
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center">
      <div className="bg-gray-700 p-6 rounded shadow-lg max-w-5xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">
          Editable JSON Formatter with Collapsible Objects
        </h1>

        <div className="flex justify-between items-center">
          {/* Left Section: Textarea for JSON Input */}
          <div className="w-1/2 pr-2">
            <textarea
              className="w-full p-4 border rounded-md text-sm text-white font-mono bg-black"
              rows={20}
              placeholder="Enter JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            ></textarea>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          {/* Center Section: Format Button */}
          <div className="flex flex-col items-center mx-4">
            <buttonimport { useState, useRef, useEffect } from "react";

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

              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              onClick={formatJson}
            >
              Format JSON
            </button>
          </div>

          {/* Right Section: Rendered JSON Output */}
          <div className="w-1/2 bg-gray-100 border rounded">
            <pre > {renderJson(formattedJson)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
