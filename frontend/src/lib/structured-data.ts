/**
 * schema.org JSON-LD builders. Centralizing them keeps entity data (names,
 * URLs, descriptions) consistent across pages — a core GEO requirement.
 * See docs/GEO-OPTIMIZATION-GUIDE.md §2.1.
 */
import { SITE, absoluteUrl } from "./site";
import type { Tool } from "./tools";
import type { MemberDetail } from "./members/types";

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

/** The lab itself — referenced by @id from every other node. */
export function organizationLd() {
    return {
        "@context": "https://schema.org",
        "@type": ["Organization", "ResearchOrganization"],
        "@id": ORG_ID,
        name: SITE.name,
        url: SITE.url,
        logo: absoluteUrl("/icon.png"),
        description: SITE.description,
        sameAs: [SITE.github],
    };
}

export function websiteLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        inLanguage: "ko",
        publisher: { "@id": ORG_ID },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE.url}/?q={search_term_string}#tools`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}

/** A tool/library as an installable, free, open-source SoftwareApplication. */
export function softwareApplicationLd(tool: Tool) {
    const repoUrl = `${SITE.github}/${tool.repo}`;
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": absoluteUrl(`/tool/${tool.id}#software`),
        name: tool.name,
        alternateName: tool.repo,
        description: tool.description,
        url: absoluteUrl(`/tool/${tool.id}`),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Cross-platform",
        programmingLanguage: tool.language,
        softwareRequirements: tool.install,
        downloadUrl: repoUrl,
        codeRepository: repoUrl,
        license: "https://opensource.org/licenses/MIT",
        isAccessibleForFree: true,
        offers: {
            "@type": "Offer",
            price: 0,
            priceCurrency: "USD",
        },
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
    };
}

/** A research-lab member, sourced from their public GitHub profile. */
export function personLd(member: MemberDetail) {
    const sameAs = [member.htmlUrl];
    if (member.blog) sameAs.push(member.blog);
    if (member.twitterUsername)
        sameAs.push(`https://twitter.com/${member.twitterUsername}`);

    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": absoluteUrl(`/members/${member.login}#person`),
        name: member.name || member.login,
        alternateName: member.login,
        url: absoluteUrl(`/members/${member.login}`),
        image: member.avatarUrl,
        ...(member.bio ? { description: member.bio } : {}),
        ...(member.location ? { homeLocation: member.location } : {}),
        sameAs,
        affiliation: { "@id": ORG_ID },
        worksFor: { "@id": ORG_ID },
        ...(member.topLanguages?.length
            ? { knowsAbout: member.topLanguages.map((l) => l.name) }
            : {}),
    };
}

export interface FaqEntry {
    question: string;
    answer: string;
}

export function faqPageLd(entries: FaqEntry[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: entries.map((e) => ({
            "@type": "Question",
            name: e.question,
            acceptedAnswer: { "@type": "Answer", text: e.answer },
        })),
    };
}

/** A blog article — BlogPosting for rich results + GEO citation. */
export function blogPostingLd(post: {
    slug: string;
    title: string;
    description: string;
    date: string;
    updated?: string;
    author: string;
    authorGithub?: string;
    cover?: string;
}) {
    // 작성자가 멤버(GitHub 계정 명시)면 Person으로, 아니면 조직 저작으로 표기.
    // Person @id는 /members/<login>#person(personLd)과 동일해 엔티티가 그래프로 연결된다.
    const author = post.authorGithub
        ? {
              "@type": "Person",
              "@id": absoluteUrl(`/members/${post.authorGithub}#person`),
              name: post.author,
              url: absoluteUrl(`/members/${post.authorGithub}`),
              sameAs: [`https://github.com/${post.authorGithub}`],
          }
        : { "@type": "Organization", name: post.author, "@id": ORG_ID };

    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": absoluteUrl(`/blog/${post.slug}#article`),
        headline: post.title,
        description: post.description,
        url: absoluteUrl(`/blog/${post.slug}`),
        datePublished: post.date,
        dateModified: post.updated || post.date,
        ...(post.cover ? { image: absoluteUrl(post.cover) } : {}),
        author,
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        inLanguage: "ko",
    };
}

export interface Crumb {
    name: string;
    path: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.path),
        })),
    };
}

/** A list of items (e.g. releases) as an ordered ItemList. */
export function itemListLd(
    name: string,
    items: { name: string; url?: string; description?: string }[],
) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.name,
            ...(it.url ? { url: absoluteUrl(it.url) } : {}),
            ...(it.description ? { description: it.description } : {}),
        })),
    };
}
