/* ── Demo system types ── */

export type InputType = "file" | "text" | "textarea" | "select" | "number" | "toggle";
export type OutputType = "json" | "text" | "html" | "table" | "tree" | "chunks" | "search-results";

export interface InputField {
  key: string;
  type: InputType;
  label: string;
  placeholder?: string;
  required?: boolean;
  /** file input: comma-separated extensions e.g. ".pdf,.docx,.csv" */
  accept?: string;
  /** select input */
  options?: { value: string; label: string }[];
  /** default value */
  default?: string | number | boolean;
  /** number input */
  min?: number;
  max?: number;
  step?: number;
}

export interface OutputField {
  key: string;
  type: OutputType;
  label: string;
}

export interface SampleData {
  label: string;
  description?: string;
  inputs: Record<string, unknown>;
  /** Pre-filled output to show before backend is connected */
  mockOutput?: Record<string, unknown>;
}

export interface DemoManifest {
  projectName: string;
  title: string;
  description: string;
  icon: string;
  inputs: InputField[];
  outputs: OutputField[];
  samples: SampleData[];
  /** API endpoint path, e.g. "/api/demo/contextifier/run" */
  apiEndpoint?: string;
}

/** Runtime state for demo execution */
export interface DemoState {
  inputValues: Record<string, unknown>;
  files: Record<string, File | null>;
  outputValues: Record<string, unknown> | null;
  isRunning: boolean;
  error: string | null;
}
