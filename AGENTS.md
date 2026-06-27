<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training
data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.

# This is Next.js 16.2.3 in App Router mode

This repo uses the Next.js App Router in `client-side/`. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project rules

- Prefer Server Components by default.
- Use Server Actions (`'use server'`) for mutations when possible.
- Keep Client Components minimal and isolated to interactivity.
- Avoid `app/api` unless a Route Handler is truly required.
- Use `generateMetadata`, schema data, and JSON-LD/script data for SEO.
- Prefer cache-aware data flows and `revalidatePath` / `revalidateTag` / `updateTag` where appropriate.
- Keep UI fast, mobile-first, and aligned with malamal.com.bd style. <!-- END:nextjs-agent-rules -->
