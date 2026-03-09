# DevOps Strategy - Linguability

## Overview

This document outlines the CI/CD pipeline and DevOps strategy for the Linguability language learning application.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION ENVIRONMENT                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐              ┌─────────────────────┐               │
│  │      VERCEL         │              │      RENDER         │               │
│  │  (Frontend Host)    │    API       │   (Backend Host)    │               │
│  │                     │◄────────────►│                     │               │
│  │  • React + Vite     │   Calls      │  • Express.js       │               │
│  │  • Auto SSL         │              │  • Socket.io        │               │
│  │  • Global CDN       │              │  • Auto SSL         │               │
│  └─────────────────────┘              └─────────────────────┘               │
│            │                                    │                            │
│            │                                    │                            │
│            ▼                                    ▼                            │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │                        SUPABASE                              │            │
│  │  • PostgreSQL Database    • Authentication                   │            │
│  │  • Realtime Subscriptions • Row Level Security              │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## CI/CD Pipeline

### Pipeline Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Developer│───▶│   Push   │───▶│   CI     │───▶│  Tests   │───▶│  Build   │
│ Commits  │    │ to Branch│    │ Triggers │    │  Run     │    │  Check   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                                      │
                     ┌────────────────────────────────────────────────┘
                     │
                     ▼
              ┌─────────────┐         ┌─────────────┐
              │   Tests     │         │   Tests     │
              │   Pass? ✓   │────────▶│   Fail? ✗   │
              └──────┬──────┘         └──────┬──────┘
                     │                       │
                     ▼                       ▼
              ┌─────────────┐         ┌─────────────┐
              │   Merge     │         │   Block     │
              │   Allowed   │         │   Merge     │
              └──────┬──────┘         └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │ Auto-Deploy │
              │ Vercel +    │
              │ Render      │
              └─────────────┘
```

### GitHub Actions Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `.github/workflows/ci.yml` | PR, Push to main | Run tests & lint |
| CD | `.github/workflows/cd.yml` | Push to main | Deploy verification |
| PR Check | `.github/workflows/pr-check.yml` | Pull request | Block merge if fails |

## Environments

### Development
- **Local**: `npm run dev` (Vite dev server on port 5173)
- **Backend**: `npm run dev` (Express on port 3001)

### Staging (Optional)
- Create a `staging` branch
- Configure Vercel/Render preview deployments

### Production
- **Frontend**: Vercel (auto-deploy from `main`)
- **Backend**: Render (auto-deploy from `main`)
- **Database**: Supabase (managed PostgreSQL)

## Environment Variables

### Frontend (Vercel Dashboard)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (Render Dashboard)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
PORT=3001
NODE_ENV=production
```

### GitHub Secrets (Optional)
```
RENDER_DEPLOY_HOOK_URL    # For manual deploy triggers
SLACK_WEBHOOK_URL         # For failure notifications
```

## Testing Strategy

### Test Types
| Type | Framework | Count | Location |
|------|-----------|-------|----------|
| Unit Tests | Vitest | ~100 | `frontend/src/test/*.test.jsx` |
| Integration Tests | Vitest | ~237 | `frontend/src/test/integration/*.test.jsx` |
| **Total** | | **337** | |

### Test Coverage by Member
| Member | Responsibility | Tests |
|--------|---------------|-------|
| Member 1 | Auth & Profile | 30 tests |
| Member 2 | Lessons & Progress | 26 tests |
| Member 3 | Practice & Speech API | 42 tests |
| Member 4 | Quiz & Settings | 35 tests |
| Member 5 | Real-time & Study Rooms | 62 tests |

### Running Tests
```bash
# Run all tests
cd frontend
npm test

# Run specific member's tests
npx vitest run src/test/integration/member1-auth-profile.integration.test.jsx

# Run with coverage
npx vitest run --coverage
```

## Deployment Process

### Automatic Deployment (Current Setup)

1. **Developer pushes to `main` branch**
2. **GitHub Actions runs tests** (ci.yml)
3. **If tests pass:**
   - Vercel automatically deploys frontend
   - Render automatically deploys backend
4. **If tests fail:**
   - Deployment is blocked
   - Developer notified via GitHub

### Manual Deployment (If Needed)

```bash
# Frontend - Vercel CLI
cd frontend
npx vercel --prod

# Backend - Render CLI or Dashboard
# Use Render dashboard to manually trigger deploy
```

## Branching Strategy

```
main (production)
  │
  ├── develop (integration)
  │     │
  │     ├── feature/auth-improvements
  │     ├── feature/new-lesson-type
  │     └── bugfix/socket-connection
  │
  └── hotfix/critical-bug
```

### Branch Rules
| Branch | Protection | Deploy |
|--------|-----------|--------|
| `main` | ✅ Require PR, ✅ Require tests | Production |
| `develop` | ✅ Require tests | Staging (optional) |
| `feature/*` | None | Preview |

## Monitoring & Observability

### Current Monitoring
- **Vercel**: Built-in analytics and logs
- **Render**: Built-in logs and metrics
- **Supabase**: Database metrics and query logs

### Recommended Additions
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation (Render logs + export)

## Security Checklist

- [x] Environment variables not committed to git
- [x] Supabase Row Level Security enabled
- [x] HTTPS enforced (Vercel/Render auto)
- [x] API keys in platform dashboards only
- [ ] Regular dependency updates (Dependabot)
- [ ] Security headers configured

## Rollback Strategy

### Frontend (Vercel)
1. Go to Vercel Dashboard
2. Select project → Deployments
3. Click "..." on previous deployment
4. Select "Promote to Production"

### Backend (Render)
1. Go to Render Dashboard
2. Select service → Events
3. Find previous deploy
4. Click "Rollback"

## Disaster Recovery

| Scenario | Recovery Action |
|----------|-----------------|
| Frontend down | Vercel auto-recovers, or rollback |
| Backend down | Render auto-restarts, or rollback |
| Database down | Supabase SLA, point-in-time recovery |
| Region outage | Vercel: Global CDN failover |

## Cost Optimization

### Current (Free Tier)
- **Vercel**: Free (Hobby plan)
- **Render**: Free (with sleep after inactivity)
- **Supabase**: Free tier (500MB database)

### Scaling Considerations
- Vercel Pro: $20/month (more builds, analytics)
- Render Starter: $7/month (no sleep, more RAM)
- Supabase Pro: $25/month (more storage, backups)

---

## Quick Reference

### URLs
| Service | URL |
|---------|-----|
| Frontend | `https://linguability.vercel.app` (example) |
| Backend | `https://linguability-api.onrender.com` (example) |
| Supabase | `https://your-project.supabase.co` |
| GitHub | `https://github.com/your-username/linguability` |

### Commands
```bash
# Development
npm run dev                    # Start frontend dev server
cd backend && npm run dev      # Start backend dev server

# Testing
npm test                       # Run all tests
npm run test:coverage          # Run with coverage

# Build
npm run build                  # Build for production

# Deploy (automatic on push to main)
git push origin main
```

### Contact
- **DevOps Issues**: Create GitHub issue with `devops` label
- **Deployment Help**: Check Vercel/Render documentation
