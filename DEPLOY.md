# Deploying Peptide AI to Vercel

## Quick Deploy (Recommended)

### 1. Push to GitHub

```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/peptide-ai-web.git
git add .
git commit -m "Initial commit - Peptide AI web app"
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `peptide-ai-web` repository
4. Configure environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
   - `CLERK_SECRET_KEY` - Your Clerk secret key
   - `OPENAI_API_KEY` - Your OpenAI API key
5. Click "Deploy"

That's it! You'll get a URL like `peptide-ai-web.vercel.app`

## Alternative: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from the web directory)
vercel

# For production:
vercel --prod
```

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
