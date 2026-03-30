"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DemoSnippet } from "@/lib/demo";

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (pkg: string | string[]) => Promise<void>;
  micropip: { install: (pkg: string | string[]) => Promise<void> };
}

interface Props {
  packageName?: string;
  snippets: DemoSnippet[];
}

export default function PythonPlayground({ packageName, snippets }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [code, setCode] = useState(snippets[0]?.code || "");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "installing" | "running" | "ready" | "error">("idle");
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // snippet 선택 변경
  const selectSnippet = (idx: number) => {
    setSelectedIdx(idx);
    setCode(snippets[idx]?.code || "");
  };

  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current) {
      setStatus("ready");
      return;
    }

    setStatus("loading");
    setOutput("Loading Python runtime...\n");

    try {
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide"));
          document.head.appendChild(script);
        });
      }

      const pyodide = await window.loadPyodide!({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });

      await pyodide.runPythonAsync(`
import sys
from io import StringIO
`);

      await pyodide.loadPackage("micropip");

      if (packageName) {
        setStatus("installing");
        setOutput((prev) => prev + `Installing ${packageName}...\n`);

        try {
          await pyodide.micropip.install(packageName);
          setOutput((prev) => prev + `✓ ${packageName} installed\n\n`);
        } catch {
          setOutput((prev) => prev + `⚠ ${packageName} is not available in Pyodide\n  Pure Python code will still work.\n\n`);
        }
      }

      pyodideRef.current = pyodide;
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setOutput(`Failed to load Python: ${err}`);
    }
  }, [packageName]);

  const runCode = async () => {
    if (!pyodideRef.current) return;

    setStatus("running");
    const pyodide = pyodideRef.current;

    try {
      // exec()으로 실행해서 from __future__ 등 top-level 구문 호환
      await pyodide.runPythonAsync(`
import sys as _sys
from io import StringIO as _StringIO

_user_code = ${JSON.stringify(code)}

_stdout = _sys.stdout
_stderr = _sys.stderr
_sys.stdout = _out = _StringIO()
_sys.stderr = _err = _StringIO()

try:
    exec(compile(_user_code, "<playground>", "exec"))
except Exception as _e:
    print(f"Error: {type(_e).__name__}: {_e}", file=_sys.stderr)
finally:
    _sys.stdout = _stdout
    _sys.stderr = _stderr
`);

      const result = await pyodide.runPythonAsync(`_out.getvalue() + _err.getvalue()`);

      const out = String(result || "(no output)");
      setOutput(out);
    } catch (err) {
      setOutput(`Error: ${err}`);
    }

    setStatus("ready");
  };

  // Show expected output if run fails with import error
  const showExpectedOutput = () => {
    const snippet = snippets[selectedIdx];
    if (snippet?.expectedOutput) {
      setOutput(`[Expected Output]\n${snippet.expectedOutput}`);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      if (status === "ready") runCode();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      setCode(code.substring(0, start) + "    " + code.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  if (snippets.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
        <p className="text-sm">No demo snippets available for this repository.</p>
        <p className="text-xs mt-2">
          Add a <code className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-secondary)" }}>demo.json</code> or <code className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-secondary)" }}>examples/</code> to the repo, or include Python code blocks in the README.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Python Playground
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Pyodide — 브라우저에서 직접 Python 실행 (Shift+Enter로 실행)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectSnippet(selectedIdx)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            Reset
          </button>
          {status === "idle" ? (
            <button
              onClick={loadPyodide}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              ▶ Start Python
            </button>
          ) : status === "ready" ? (
            <button
              onClick={runCode}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#22c55e", color: "#fff" }}
            >
              ▶ Run
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
              style={{ background: "var(--border)", color: "var(--text-muted)" }}
            >
              <span
                className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin inline-block"
                style={{ borderColor: "var(--text-muted)", borderTopColor: "transparent" }}
              />
              {status === "loading"
                ? "Loading..."
                : status === "installing"
                  ? "Installing..."
                  : "Running..."}
            </button>
          )}
        </div>
      </div>

      {/* Snippet Selector */}
      {snippets.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {snippets.map((s, i) => (
            <button
              key={i}
              onClick={() => selectSnippet(i)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: i === selectedIdx ? "var(--accent-glow)" : "transparent",
                color: i === selectedIdx ? "var(--accent-light)" : "var(--text-muted)",
                border: `1px solid ${i === selectedIdx ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Code Editor */}
      <div
        className="rounded-lg overflow-hidden mb-3"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-2 text-xs"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
        >
          <span>python</span>
          <span>{code.split("\n").length} lines</span>
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full p-4 font-mono text-sm outline-none resize-none min-h-[200px]"
          style={{
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            tabSize: 4,
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Output */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-4 py-2 text-xs"
          style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
        >
          <span>Output</span>
          <div className="flex items-center gap-3">
            {snippets[selectedIdx]?.expectedOutput && (
              <button
                onClick={showExpectedOutput}
                className="hover:underline"
                style={{ color: "var(--accent-light)" }}
              >
                Show expected
              </button>
            )}
            {output && (
              <button
                onClick={() => setOutput("")}
                className="hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <pre
          className="p-4 font-mono text-sm min-h-[100px] max-h-[400px] overflow-auto whitespace-pre-wrap"
          style={{
            background: "var(--bg-primary)",
            color: output.includes("Error") ? "#ef4444" : "var(--text-secondary)",
          }}
        >
          {output || (status === "idle" ? 'Click "Start Python" to begin' : "Waiting for output...")}
        </pre>
      </div>
    </div>
  );
}
