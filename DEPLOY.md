# Deploying Peptide AI

## Railway (Recommended)

### 1. Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `peptide-ai-web` repository
4. Railway will auto-detect Next.js
5. Add environment variables (see below)
6. Click "Deploy"

You'll get a URL like `peptide-ai-web-production.up.railway.app`

### Custom Domain
Settings → Domains → Add your domain (e.g., `app.peptide.ai`)

---

## Alternative: Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Import `peptide-ai-web`
3. Add environment variables
4. Click "Deploy"

## Environment Variables Required

| Variable | Description | Get it from |
|----------|-------------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key | [Clerk Dashboard](https://dashboard.clerk.com) |
| `OPENAI_API_KEY` | OpenAI API key | [OpenAI Platform](https://platform.openai.com) |

## Features Included

- **Chat Interface** - Research peptides with AI
- **Stack Builder** - Build peptide combinations with synergy detection
- **Journey Tracker** - Log doses and daily health check-ins
- **Feedback System** - Collect user feedback with LLM-powered conversations
- **Shareable Stacks** - Viral sharing with signup flow

## Feedback Mode

Once deployed, users can:
1. Click the purple chat bubble in the bottom-right to enable feedback mode
2. Hover over any section to see the feedback button
3. Chat with the AI to explain their feedback
4. You can review all feedback at `/feedback`

## Custom Domain

In Vercel dashboard → Your Project → Settings → Domains
Add your custom domain (e.g., `app.peptide.ai`)
