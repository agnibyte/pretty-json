import { useState } from 'react';

const isObject = (value) => typeof value === 'object' && !Array.isArray(value) && value !== null;
const isArray = (value) => Array.isArray(value);

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);
  const [collapsedKeys, setCollapsedKeys] = useState({});

  const formatJson = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setJsonInput(formattedJson);
      setError(null);
    } catch (e) {
      setError('Invalid JSON');
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
  const renderJson = (json, parentKey = '', parentJson = {}, isKey = false) => {
    if (isObject(json)) {
      return (
        <>
          {'{'}
          <div style={{ marginLeft: '20px' }}>
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
                    style={{ cursor: 'pointer', marginRight: '5px', width: '100px' }}
                  />
                  <span
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => toggleCollapse(uniqueKey)}
                  >
                    {isCollapsed ? ': {....}' : ': '}
                  </span>
                  {!isCollapsed && renderJson(json[key], uniqueKey, json)}
                </div>
              );
            })}
          </div>
          {'}'}
        </>
      );
    } else if (isArray(json)) {
      return (
        <>
          {'['}
          <div style={{ marginLeft: '20px' }}>
            {json.map((item, index) => {
              const uniqueKey = `${parentKey}[${index}]`;
              const isCollapsed = collapsedKeys[uniqueKey];
              return (
                <div key={index}>
                  <span
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => toggleCollapse(uniqueKey)}
                  >
                    {isCollapsed ? '[....]' : ''}
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
                        style={{ width: '150px', marginLeft: '5px' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {']'}
        </>
      );
    } else {
      return (
        <input
          type="text"
          value={json}
          onChange={(e) => {
            const updatedJson = { ...parentJson, [parentKey.split('.').pop()]: e.target.value };
            handleChange(updatedJson);
          }}
          style={{ marginLeft: '5px', width: '150px' }}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-3xl w-full">
        <h1 className="text-2xl font-bold mb-4">Editable JSON Formatter with Collapsible Objects</h1>
        <textarea
          className="w-full p-4 border rounded-md text-sm font-mono"
          rows={10}
          placeholder="Enter JSON here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        ></textarea>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={formatJson}
        >
          Format JSON
        </button>
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <pre>{renderJson(JSON.parse(jsonInput || '{}'))}</pre>
        </div>
      </div>
    </div>
  );
}
