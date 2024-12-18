import { useState } from "react";

const isObject = (value) =>
  typeof value === "object" && !Array.isArray(value) && value !== null;
const isArray = (value) => Array.isArray(value);

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [formatedJson, setFormatedJson] = useState("");

  const [error, setError] = useState(null);
  const [collapsedKeys, setCollapsedKeys] = useState({});

  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formattedJson);
      setFormatedJson(formattedJson);
      setError(null);
    } catch (e) {
      setError("Invalid JSON");
    }
  };

  // Toggle collapse state of keys
  const toggleCollapse = (key) => {
    setCollapsedKeys((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  // Function to update a specific key or value in the JSON
  const handleChange = (newJson) => {
    setJsonInput(JSON.stringify(newJson, null, 2));
  };

  // Recursive function to render JSON with editable fields
  const renderJson = (json, parentKey = "", parentJson = {}, isKey = false) => {
    if (isObject(json)) {
      return (
        <>
          {"{"}
          <div style={{ marginLeft: "20px" }}>
            {Object.keys(json).map((key, index) => {
              const uniqueKey = `${parentKey}.${key}`;
              const isCollapsed = collapsedKeys[uniqueKey];

              return (
                <div key={index}>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const updatedJson = { ...parentJson };
                      updatedJson[newKey] = updatedJson[key];
                      delete updatedJson[key];
                      handleChange(updatedJson);
                    }}
                    style={{
                      cursor: "pointer",
                      marginRight: "5px",
                      width: "100px",
                    }}
                  />
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => toggleCollapse(uniqueKey)}
                  >
                    {isCollapsed ? ": {....}" : ": "}
                  </span>
                  {!isCollapsed && renderJson(json[key], uniqueKey, json)}
                </div>
              );
            })}
          </div>
          {"}"}
        </>
      );
    } else if (isArray(json)) {
      return (
        <>
          {"["}
          <div style={{ marginLeft: "20px" }}>
            {json.map((item, index) => {
              const uniqueKey = `${parentKey}[${index}]`;
              const isCollapsed = collapsedKeys[uniqueKey];
              return (
                <div key={index}>
                  <span
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => toggleCollapse(uniqueKey)}
                  >
                    {isCollapsed ? "[....]" : ""}
                  </span>
                  {!isCollapsed && (
                    <div>
                      {renderJson(item, uniqueKey, json)}
                      <input
                        type="text"
                        value={JSON.stringify(item)}
                        onChange={(e) => {
                          const updatedJson = [...parentJson];
                          updatedJson[index] = JSON.parse(e.target.value);
                          handleChange(updatedJson);
                        }}
                        style={{ width: "150px", marginLeft: "5px" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {"]"}
        </>
      );
    } else {
      return (
        <input
          type="text"
          value={json}
          onChange={(e) => {
            const updatedJson = {
              ...parentJson,
              [parentKey.split(".").pop()]: e.target.value,
            };
            handleChange(updatedJson);
          }}
          style={{ marginLeft: "5px", width: "150px" }}
        />
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
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              onClick={formatJson}
            >
              Format JSON
            </button>
          </div>

          {/* Right Section: Rendered JSON Output */}
          <div className="w-1/2 pl-2 bg-gray-100 p-4 border rounded">
            <pre>{renderJson(JSON.parse(formatedJson || "{}"))}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
