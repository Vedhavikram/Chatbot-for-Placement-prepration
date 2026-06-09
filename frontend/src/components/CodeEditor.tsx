import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
}) => {
  return (
    <div className="monaco-container" style={{ height }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={val => onChange(val || '')}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          readOnly,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          suggest: { showKeywords: true },
        }}
      />
    </div>
  );
};

export default CodeEditor;
