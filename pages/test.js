import { useState, useRef } from 'react';

export default function Home() {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);
  const preRef = useRef(null); // Reference to the <pre> tag

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

  // Save and restore cursor position
  const saveCaretPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const pre = preRef.current;
      const preRange = document.createRange();
      preRange.selectNodeContents(pre);
      preRange.setEnd(range.startContainer, range.startOffset);
      return preRange.toString().length;
    }
    return 0;
  };

  const restoreCaretPosition = (position) => {
    const selection = window.getSelection();
    const range = document.createRange();
    const pre = preRef.current;
    range.selectNodeContents(pre);
    let charCount = 0;

    function traverseNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.length;
        if (position <= nextCharCount) {
          range.setStart(node, position - charCount);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return true;
        }
        charCount = nextCharCount;
      } else {
        for (const child of node.childNodes) {
          if (traverseNodes(child)) return true;
        }
      }
      return false;
    }

    traverseNodes(pre);
  };

  const handleInput = (e) => {
    const position = saveCaretPosition();
    setJsonInput(e.currentTarget.innerText);
    setTimeout(() => restoreCaretPosition(position), 0); // Restore cursor after state update
  };

  return (
    <div className="min-h-screen bg-gray-500 flex items-center justify-center">
      <div className="bg-gray-700 p-6 rounded shadow-lg max-w-5xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">
          Editable JSON Formatter
        </h1>

        <div className="flex flex-col items-center">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition mb-4"
            onClick={formatJson}
          >
            Format JSON
          </button>

          {/* Editable JSON Input/Output in One <pre> Tag */}
          <div className="bg-gray-100 p-4 border rounded w-full">
            <pre
              ref={preRef}
              contentEditable="true"
              suppressContentEditableWarning={true}
              onInput={handleInput}
              style={{
                whiteSpace: 'pre-wrap',
                outline: 'none',
                fontFamily: 'monospace',
                minHeight: '200px',
                color: 'black',
              }}
              className="text-black"
            >
              {jsonInput || 'Enter JSON here...'}
            </pre>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
