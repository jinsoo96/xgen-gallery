import { useState, useCallback, useRef } from "react";
import type { DemoManifest, DemoState, InputField, OutputField } from "./types";
import type { Theme } from "../styles";

/* ================================================================
 *  DemoPage — dynamic demo UI driven by DemoManifest
 * ================================================================ */

interface DemoPageProps {
  manifest: DemoManifest;
  t: Theme;
  apiBaseUrl?: string;
}

export function DemoPage({ manifest, t, apiBaseUrl }: DemoPageProps) {
  const initValues: Record<string, unknown> = {};
  const initFiles: Record<string, File | null> = {};
  for (const inp of manifest.inputs) {
    if (inp.type === "file") {
      initFiles[inp.key] = null;
    } else {
      initValues[inp.key] = inp.default ?? "";
    }
  }

  const [state, setState] = useState<DemoState>({
    inputValues: initValues,
    files: initFiles,
    outputValues: null,
    isRunning: false,
    error: null,
  });

  const setInput = useCallback((key: string, value: unknown) => {
    setState((s) => ({ ...s, inputValues: { ...s.inputValues, [key]: value } }));
  }, []);

  const setFile = useCallback((key: string, file: File | null) => {
    setState((s) => ({ ...s, files: { ...s.files, [key]: file } }));
  }, []);

  /** Load sample data */
  const loadSample = useCallback((sampleIdx: number) => {
    const sample = manifest.samples[sampleIdx];
    if (!sample) return;
    const nextValues = { ...state.inputValues };
    for (const [k, v] of Object.entries(sample.inputs)) {
      nextValues[k] = v;
    }
    setState((s) => ({
      ...s,
      inputValues: nextValues,
      outputValues: sample.mockOutput ?? null,
      error: null,
    }));
  }, [manifest.samples, state.inputValues]);

  /** Run demo via API */
  const runDemo = useCallback(async () => {
    if (!apiBaseUrl || !manifest.apiEndpoint) {
      // No backend — show mock output from first matching sample
      const sample = manifest.samples[0];
      if (sample?.mockOutput) {
        setState((s) => ({ ...s, outputValues: sample.mockOutput!, error: null }));
      } else {
        setState((s) => ({ ...s, error: "백엔드가 연결되지 않았습니다. 샘플 데이터를 사용해주세요." }));
      }
      return;
    }

    setState((s) => ({ ...s, isRunning: true, error: null, outputValues: null }));
    try {
      const hasFile = Object.values(state.files).some((f) => f !== null);
      let res: Response;

      if (hasFile) {
        // multipart/form-data — 파일 + 텍스트 필드 개별 전송
        const formData = new FormData();
        for (const [k, v] of Object.entries(state.inputValues)) {
          formData.append(k, String(v));
        }
        for (const [k, f] of Object.entries(state.files)) {
          if (f) formData.append(k, f);
        }
        res = await fetch(`${apiBaseUrl}${manifest.apiEndpoint}`, {
          method: "POST",
          body: formData,
        });
      } else {
        // JSON 전송
        res = await fetch(`${apiBaseUrl}${manifest.apiEndpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state.inputValues),
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      setState((s) => ({ ...s, outputValues: data, isRunning: false }));
    } catch (err: unknown) {
      setState((s) => ({
        ...s,
        isRunning: false,
        error: err instanceof Error ? err.message : "알 수 없는 오류",
      }));
    }
  }, [apiBaseUrl, manifest.apiEndpoint, manifest.samples, state.inputValues, state.files]);

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>{manifest.icon}</span>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.text }}>{manifest.title}</h2>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: t.textSecondary, lineHeight: 1.5 }}>{manifest.description}</p>
      </div>

      {/* Sample buttons */}
      {manifest.samples.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: t.textMuted, marginRight: 8 }}>샘플 데이터:</span>
          {manifest.samples.map((s, i) => (
            <button
              key={i}
              onClick={() => loadSample(i)}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                background: t.bgBadge, color: t.textBadge, border: `1px solid ${t.border}`,
                marginRight: 6,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Main layout: Input | Output */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* ── Left: Inputs ── */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: t.accent }}>▸</span> Input
          </h3>
          {manifest.inputs.map((field) => (
            <InputRenderer
              key={field.key}
              field={field}
              value={state.inputValues[field.key]}
              file={state.files[field.key]}
              onChange={(v) => setInput(field.key, v)}
              onFileChange={(f) => setFile(field.key, f)}
              t={t}
            />
          ))}
          <button
            onClick={runDemo}
            disabled={state.isRunning}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: state.isRunning ? "not-allowed" : "pointer",
              background: state.isRunning ? t.textMuted : t.accent,
              color: "#fff", border: "none", marginTop: 8,
              opacity: state.isRunning ? 0.6 : 1,
            }}
          >
            {state.isRunning ? "처리 중..." : "▶ 실행"}
          </button>
          {!apiBaseUrl && (
            <p style={{ fontSize: 11, color: t.textMuted, margin: "8px 0 0", textAlign: "center" }}>
              백엔드 미연결 — 샘플 데이터로 미리보기
            </p>
          )}
        </div>

        {/* ── Right: Outputs ── */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, minHeight: 300 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: t.text, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: t.accent }}>◂</span> Output
          </h3>
          {state.error && (
            <div style={{
              padding: 12, borderRadius: 8, fontSize: 13,
              background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 12,
            }}>
              {state.error}
            </div>
          )}
          {state.isRunning && (
            <div style={{ textAlign: "center", padding: 40, color: t.textMuted }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              처리 중...
            </div>
          )}
          {!state.isRunning && !state.outputValues && !state.error && (
            <div style={{ textAlign: "center", padding: 40, color: t.textMuted, fontSize: 13 }}>
              실행 버튼을 누르거나 샘플 데이터를 선택하세요.
            </div>
          )}
          {!state.isRunning && state.outputValues && (
            <OutputPanel outputs={manifest.outputs} values={state.outputValues} t={t} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
 *  Input Renderers
 * ================================================================ */

function InputRenderer({ field, value, file, onChange, onFileChange, t }: {
  field: InputField;
  value: unknown;
  file?: File | null;
  onChange: (v: unknown) => void;
  onFileChange: (f: File | null) => void;
  t: Theme;
}) {
  const baseLabel = (
    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: t.textSecondary, marginBottom: 4 }}>
      {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
  );

  const inputStyle = {
    width: "100%", boxSizing: "border-box" as const, padding: "8px 12px", borderRadius: 8,
    border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: 13, outline: "none",
  };

  const wrap = (children: React.ReactNode) => (
    <div style={{ marginBottom: 14 }}>{baseLabel}{children}</div>
  );

  switch (field.type) {
    case "file":
      return wrap(<FileUpload accept={field.accept} file={file ?? null} onFileChange={onFileChange} t={t} />);

    case "text":
      return wrap(
        <input
          type="text"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      );

    case "textarea":
      return wrap(
        <textarea
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          style={{ ...inputStyle, resize: "vertical" as const, lineHeight: 1.5 }}
        />
      );

    case "select":
      return wrap(
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case "number":
      return wrap(
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number(value ?? field.default ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: t.accent }}
          />
          <span style={{ fontSize: 13, color: t.text, minWidth: 44, textAlign: "right" }}>
            {String(value ?? field.default ?? 0)}
          </span>
        </div>
      );

    case "toggle":
      return wrap(
        <button
          onClick={() => onChange(!value)}
          style={{
            padding: "6px 16px", borderRadius: 6, fontSize: 12, cursor: "pointer",
            background: value ? t.accent : t.bgBadge,
            color: value ? "#fff" : t.textBadge,
            border: `1px solid ${value ? t.accent : t.border}`,
          }}
        >
          {value ? "ON" : "OFF"}
        </button>
      );

    default:
      return null;
  }
}

/* ── File Upload ── */

function FileUpload({ accept, file, onFileChange, t }: {
  accept?: string; file: File | null;
  onFileChange: (f: File | null) => void; t: Theme;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  }, [onFileChange]);

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragOver ? t.accent : t.border}`,
        borderRadius: 8, padding: file ? "10px 14px" : "24px 14px",
        textAlign: "center", cursor: "pointer",
        background: dragOver ? t.accentGlow : t.bg,
        transition: "all 0.2s",
      }}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📎</span>
          <span style={{ fontSize: 13, color: t.text, flex: 1, textAlign: "left" }}>{file.name}</span>
          <span style={{ fontSize: 11, color: t.textMuted }}>{formatSize(file.size)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
            style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 14 }}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 28, marginBottom: 4 }}>📁</div>
          <div style={{ fontSize: 13, color: t.textSecondary }}>클릭 또는 드래그로 업로드</div>
          {accept && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{accept}</div>}
        </>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

/* ================================================================
 *  Output Renderers
 * ================================================================ */

function OutputPanel({ outputs, values, t }: {
  outputs: OutputField[];
  values: Record<string, unknown>;
  t: Theme;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const visibleOutputs = outputs.filter((o) => values[o.key] != null);

  if (visibleOutputs.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: t.textMuted, fontSize: 13 }}>출력 데이터가 없습니다.</div>;
  }

  const current = visibleOutputs[activeTab] || visibleOutputs[0];
  const data = values[current.key];

  return (
    <div>
      {/* Output tabs */}
      {visibleOutputs.length > 1 && (
        <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: `1px solid ${t.border}`, paddingBottom: 8 }}>
          {visibleOutputs.map((o, i) => (
            <button
              key={o.key}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                background: i === activeTab ? t.accentGlow : "transparent",
                color: i === activeTab ? t.accent : t.textMuted,
                border: `1px solid ${i === activeTab ? t.accent : "transparent"}`,
                fontWeight: i === activeTab ? 600 : 400,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {/* Output content */}
      <OutputRenderer type={current.type} data={data} t={t} />
    </div>
  );
}

function OutputRenderer({ type, data, t }: { type: string; data: unknown; t: Theme }) {
  switch (type) {
    case "text":
      return (
        <pre style={{
          background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
          padding: 16, fontSize: 13, lineHeight: 1.6, overflow: "auto",
          color: t.textSecondary, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
          maxHeight: 400,
        }}>
          {String(data ?? "")}
        </pre>
      );

    case "json":
      return (
        <pre style={{
          background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
          padding: 16, fontSize: 12, lineHeight: 1.5, overflow: "auto",
          color: t.textSecondary, margin: 0, maxHeight: 400,
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      );

    case "html":
      return (
        <div
          style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: `1px solid ${t.border}` }}
          dangerouslySetInnerHTML={{ __html: String(data ?? "") }}
        />
      );

    case "chunks":
      return <ChunksView data={data} t={t} />;

    case "table":
      return <TableView data={data} t={t} />;

    case "tree":
      return <TreeView data={data} t={t} depth={0} />;

    case "search-results":
      return <SearchResultsView data={data} t={t} />;

    default:
      return (
        <pre style={{ background: t.bg, padding: 16, borderRadius: 8, fontSize: 12, color: t.textMuted, border: `1px solid ${t.border}` }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
}

/* ── Chunks View ── */

function ChunksView({ data, t }: { data: unknown; t: Theme }) {
  const chunks = Array.isArray(data) ? data : [];
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {chunks.map((chunk: { index?: number; text?: string; metadata?: Record<string, unknown> }, i: number) => (
        <div
          key={i}
          style={{
            border: `1px solid ${expanded === i ? t.accent : t.border}`,
            borderRadius: 8, overflow: "hidden", transition: "border-color 0.2s",
          }}
        >
          <div
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              padding: "8px 12px", cursor: "pointer",
              background: expanded === i ? t.accentGlow : t.bg,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>
              Chunk #{chunk.index ?? i}
            </span>
            <span style={{ fontSize: 11, color: t.textMuted }}>
              {chunk.text ? chunk.text.length + " chars" : ""}
              {" "}{expanded === i ? "▾" : "▸"}
            </span>
          </div>
          {expanded === i && (
            <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
              <pre style={{
                margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textSecondary,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {chunk.text ?? ""}
              </pre>
              {chunk.metadata && (
                <div style={{ marginTop: 8, padding: 8, background: t.bg, borderRadius: 6, fontSize: 11, color: t.textMuted }}>
                  {JSON.stringify(chunk.metadata)}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {chunks.length === 0 && (
        <div style={{ textAlign: "center", padding: 20, color: t.textMuted, fontSize: 13 }}>청크 데이터 없음</div>
      )}
    </div>
  );
}

/* ── Table View ── */

function TableView({ data, t }: { data: unknown; t: Theme }) {
  const tbl = data as { columns?: string[]; rows?: (string | number)[][] } | null;
  if (!tbl?.columns || !tbl?.rows) {
    return <pre style={{ fontSize: 12, color: t.textMuted }}>{JSON.stringify(data, null, 2)}</pre>;
  }

  return (
    <div style={{ overflow: "auto", maxHeight: 400 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {tbl.columns.map((col, i) => (
              <th key={i} style={{
                padding: "8px 10px", textAlign: "left", fontWeight: 600,
                borderBottom: `2px solid ${t.border}`, color: t.text,
                background: t.bg, position: "sticky" as const, top: 0,
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tbl.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "6px 10px", borderBottom: `1px solid ${t.border}`,
                  color: t.textSecondary,
                }}>
                  {String(cell ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Tree View ── */

function TreeView({ data, t, depth }: { data: unknown; t: Theme; depth: number }) {
  const node = data as { name?: string; children?: unknown[] } | null;
  const [open, setOpen] = useState(depth < 2);

  if (!node?.name) return null;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "4px 0",
          cursor: hasChildren ? "pointer" : "default",
        }}
      >
        <span style={{ fontSize: 12, color: t.accent, width: 14, textAlign: "center" }}>
          {hasChildren ? (open ? "▾" : "▸") : "•"}
        </span>
        <span style={{
          fontSize: 13, color: depth === 0 ? t.text : t.textSecondary,
          fontWeight: depth === 0 ? 600 : 400,
        }}>
          {node.name}
        </span>
      </div>
      {open && hasChildren && node.children!.map((child, i) => (
        <TreeView key={i} data={child} t={t} depth={depth + 1} />
      ))}
    </div>
  );
}

/* ── Search Results View ── */

function SearchResultsView({ data, t }: { data: unknown; t: Theme }) {
  const results = Array.isArray(data) ? data : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {results.map((r: { title?: string; href?: string; body?: string; source?: string; date?: string }, i: number) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: i < results.length - 1 ? `1px solid ${t.border}` : "none" }}>
          <a
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 14, fontWeight: 500, color: t.accent, textDecoration: "none", lineHeight: 1.4 }}
          >
            {r.title}
          </a>
          {r.href && (
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{r.href}</div>
          )}
          {r.body && (
            <p style={{ fontSize: 13, color: t.textSecondary, margin: "6px 0 0", lineHeight: 1.5 }}>{r.body}</p>
          )}
          {(r.source || r.date) && (
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
              {r.source && <span>{r.source}</span>}
              {r.source && r.date && " · "}
              {r.date && <span>{r.date}</span>}
            </div>
          )}
        </div>
      ))}
      {results.length === 0 && (
        <div style={{ textAlign: "center", padding: 20, color: t.textMuted, fontSize: 13 }}>검색 결과 없음</div>
      )}
    </div>
  );
}
