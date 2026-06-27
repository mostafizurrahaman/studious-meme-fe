Malamal storefront/dashboard built with [Next.js 16.2.3](https://nextjs.org), React 19, TypeScript, Tailwind, Radix/shadcn UI, and Zustand.

## Project Rules

- Prefer Server Components first.
- Use Server Actions (`'use server'`) for mutations when possible.
- Keep Client Components minimal.
- Avoid `app/api` unless a Route Handler is necessary.
- Use `generateMetadata`, JSON-LD/schema, and page metadata for SEO.
- Use cache tags and revalidation helpers (`revalidatePath`, `revalidateTag`, `updateTag`) for fast updates.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying files under `src/app/`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load local fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# studious-meme-fe
