"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * Monospace install-command chip with an inline copy button.
 * Used in tool cards, demo headers, and anywhere we want users to
 * grab a shell command with one click.
 */
export function CopyCommand({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // clipboard denial: silently ignore
        }
    };
    return (
        <button
            onClick={copy}
            className="inline-flex items-center justify-between gap-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-2 font-mono text-[13.5px] text-[var(--color-ink-muted)] transition hover:border-[var(--color-ink)] hover:bg-white hover:text-[var(--color-ink)]"
        >
            <span>$ {value}</span>
            {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
                <Copy className="h-3.5 w-3.5" />
            )}
        </button>
    );
}
