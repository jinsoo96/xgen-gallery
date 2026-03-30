"use client";

import { Member } from "@/lib/types";

export default function MemberCard({ member }: { member: Member }) {
  return (
    <a
      href={member.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl p-5 transition-all duration-300 flex flex-col items-center text-center"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.background = "var(--bg-card-hover)";
        e.currentTarget.style.boxShadow = "0 0 20px var(--accent-glow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--bg-card)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <img
          src={member.avatar_url}
          alt={member.login}
          width={80}
          height={80}
          className="rounded-full transition-transform duration-300 group-hover:scale-105"
          style={{ border: "3px solid var(--border)" }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg-card)", border: "2px solid var(--border)" }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--text-muted)">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <h3 className="font-semibold text-base mb-1" style={{ color: "var(--text-primary)" }}>
        {member.name || member.login}
      </h3>
      <p className="text-sm mb-1" style={{ color: "var(--accent-light)" }}>
        @{member.login}
      </p>
      {member.bio && (
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {member.bio}
        </p>
      )}
      {member.location && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.536 3.464a5 5 0 010 7.072L8 14.07l-3.536-3.535a5 5 0 117.072-7.072v.001zm1.06 8.132a6.5 6.5 0 10-9.192 0l3.535 3.536a1.5 1.5 0 002.122 0l3.535-3.536zM8 9a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          {member.location}
        </p>
      )}
    </a>
  );
}
