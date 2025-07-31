<a href="https://www.stoa.chat/">
  <img alt="Stoa Chat - AI-powered wisdom inspired by Stoic philosophy." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Stoa Chat</h1>
</a>

<p align="center">
    Chat with stoic wisdom. AI-powered guidance inspired by ancient philosophy for modern challenges.
</p>

<p align="center">
  <a href="#features"><strong>About</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#development"><strong>Development</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://sdk.vercel.ai/docs)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports Anthropic (default), OpenAI, xAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Providers

Stoa Chat uses [Anthropic's](https://anthropic.com) `claude-sonnet-4-20250514` as the default chat model. However, with the [AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [OpenAI](https://openai.com), [xAI](https://x.ai), [Cohere](https://cohere.com/), and [many more](https://sdk.vercel.ai/providers/ai-sdk-providers) with just a few lines of code.

## Development

To run Stoa Chat locally or deploy your own instance:

## Running locally

You will need to set up the following environment variables to run Stoa Chat:

- `ANTHROPIC_API_KEY` - Your Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))
- `AUTH_SECRET` - A secret key for authentication (generate with `openssl rand -base64 32`)
- `DATABASE_URL` - Your Neon Postgres database URL

It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).
