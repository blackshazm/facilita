# PLAN: Client App (PWA) Core (Phase 3.3)

Migrate the client application to Next.js 15 and implement the high-impact service catalog landing page specified in PRD v3.0.

## User Review Required
> [!IMPORTANT]
> The migration to Next.js 15 App Router will change how routing works. I will keep a `pages/` fallback if necessary, but the goal is 100% App Router.

## Proposed Changes

### Framework Upgrade
#### [MODIFY] [package.json](file:///d:/Desktop/facilita/apps/client/package.json)
- Upgrade `next` to `^15.0.0`, `react` to `^19.0.0`, and `react-dom` to `^19.0.0`.
- Update TailwindCSS and PostCSS for compatibility.

### UI Architecture (App Router)
#### [NEW] [apps/client/src/app/layout.tsx](file:///d:/Desktop/facilita/apps/client/src/app/layout.tsx)
- Root layout with Emerald 2.0 theme, Google Fonts (Inter/Outfit), and PWA metadata.
#### [NEW] [apps/client/src/app/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/page.tsx)
- Landing page with dynamic category grid (13 categories from PRD).

### PWA Capabilities
#### [NEW] [public/manifest.json](file:///d:/Desktop/facilita/apps/client/public/manifest.json)
- Web App Manifesto for "Add to Home Screen" support.

## Verification Plan

### Automated Tests
- `npm run build` in the client directory to ensure App Router compatibility.
- Lighthouse audit for PWA compliance (Manifest/Icons).

### Manual Verification
- Verify responsive layout on mobile breakpoint (390px - iPhone 12/13).
- Test navigation between categories.
