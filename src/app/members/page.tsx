"use client";

import Header from "@/components/Header";
import MemberCard from "@/components/MemberCard";
import { KNOWN_MEMBERS } from "@/lib/types";

export default function MembersPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Members
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            PlateerLab 조직의 컨트리뷰터들입니다
          </p>
          <div className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
            {KNOWN_MEMBERS.length} members
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {KNOWN_MEMBERS.map((member) => (
            <MemberCard key={member.login} member={member} />
          ))}
        </div>
      </main>

      <footer
        className="py-6 text-center text-xs"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        XGEN Gallery — PlateerLab &copy; {new Date().getFullYear()}
      </footer>
    </>
  );
}
