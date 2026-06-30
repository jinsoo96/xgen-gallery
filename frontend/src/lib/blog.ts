import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * 파일베이스 블로그 — `content/blog/*.md`의 마크다운 + YAML 프론트매터를 빌드 시점에
 * 읽어 정적 페이지로 굽는다. DB·런타임 의존성 없음. (Decap CMS가 동일 폴더에 커밋)
 * SEO·GEO: 정적 HTML이라 AI 크롤러가 JS 없이 본문을 그대로 읽는다.
 */
/** 블로그 카테고리 — '전체'는 필터용 가상 값(글에는 부여하지 않음). */
export const BLOG_CATEGORIES = ["Case Study", "AILab Tech", "제품 소식"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface PostMeta {
    slug: string;
    title: string;
    description: string;
    date: string; // ISO (YYYY-MM-DD)
    updated?: string;
    author: string;
    category: string;
    tags: string[];
    cover?: string;
    draft?: boolean;
}

export interface Post extends PostMeta {
    html: string;
    readingMinutes: number;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function isProd() {
    return process.env.NODE_ENV === "production";
}

function readSlugs(): string[] {
    if (!fs.existsSync(BLOG_DIR)) return [];
    return fs
        .readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
        .map((f) => f.replace(/\.mdx?$/, ""));
}

function parse(slug: string): Post | null {
    const md = path.join(BLOG_DIR, `${slug}.md`);
    const mdx = path.join(BLOG_DIR, `${slug}.mdx`);
    const file = fs.existsSync(md) ? md : fs.existsSync(mdx) ? mdx : null;
    if (!file) return null;

    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const meta: PostMeta = {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        date: String(data.date ?? "").slice(0, 10),
        updated: data.updated ? String(data.updated).slice(0, 10) : undefined,
        author: String(data.author ?? "Plateer AI Labs"),
        category: String(data.category ?? "AILab Tech"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        cover: data.cover ? String(data.cover) : undefined,
        draft: Boolean(data.draft),
    };
    const words = content.trim().split(/\s+/).length;
    return {
        ...meta,
        html: marked.parse(content, { async: false }) as string,
        readingMinutes: Math.max(1, Math.round(words / 350)),
    };
}

/** 발행된 글 목록(초안 제외, 최신순). 운영 빌드에서만 draft를 숨긴다. */
export function getAllPosts(): PostMeta[] {
    return readSlugs()
        .map(parse)
        .filter((p): p is Post => p !== null)
        .filter((p) => !(isProd() && p.draft))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map(({ html: _html, readingMinutes: _r, ...meta }) => meta);
}

export function getPost(slug: string): Post | null {
    const post = parse(slug);
    if (!post) return null;
    if (isProd() && post.draft) return null;
    return post;
}

export function getAllSlugs(): string[] {
    return getAllPosts().map((p) => p.slug);
}

/** 모든 태그(중복 제거). */
export function getAllTags(): string[] {
    const set = new Set<string>();
    getAllPosts().forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort();
}
