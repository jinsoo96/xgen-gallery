# xgen-gallery

GitHub organization의 레포지토리를 보여주는 React 컴포넌트.

## Install

```bash
npm install xgen-gallery
```

## Usage

```tsx
import { XgenGallery } from 'xgen-gallery';

function App() {
  return (
    <XgenGallery
      org="PlateerLab"
      token="ghp_xxx"  // optional, raises rate limit
      theme="dark"     // "dark" | "light"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `org` | `string` | required | GitHub organization name |
| `token` | `string` | - | GitHub personal access token |
| `theme` | `"dark" \| "light"` | `"dark"` | Color theme |
| `limit` | `number` | - | Max repos to show |
| `onRepoClick` | `(repo: Repo) => void` | - | Custom click handler (overrides built-in detail view) |

## Features

- Repo list with search & language filter
- Repo detail with README rendering
- Demo tab: auto-extracts Python code blocks from README, `examples/`, or `demo.json`
- Dark/Light theme
- Zero config — just pass `org`

## Demo Data Convention

Repos can provide curated demos by adding `.xgen-gallery/demo.json`:

```json
{
  "snippets": [
    {
      "label": "Basic Usage",
      "code": "from my_package import hello\nprint(hello())",
      "expectedOutput": "Hello, World!"
    }
  ]
}
```

Priority: `demo.json` > `examples/*.py` > README python blocks
