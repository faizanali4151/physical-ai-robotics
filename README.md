# Physical AI & Humanoid Robotics Book

A comprehensive guide to Physical AI, embodied intelligence, and humanoid robotics built with Docusaurus.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve
```

## 📦 Tech Stack

- **Framework**: Docusaurus 3.9.2
- **UI**: React 19
- **Auth**: Better Auth 1.0.0
- **Animations**: AOS
- **Node**: 20.x

## 🔧 Project Structure

```
├── docs/              # Documentation content
├── blog/              # Blog posts
├── src/
│   ├── pages/         # Custom pages (home, login, etc.)
│   ├── components/    # React components
│   ├── theme/         # Docusaurus theme customization
│   └── lib/           # Utilities (auth client, etc.)
├── static/            # Static assets
├── backend/           # FastAPI backend (deployed separately on Render)
└── auth-server/       # Better Auth server (deployed separately on Render)
```

## 🌐 Deployment

### Frontend (Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm ci --legacy-peer-deps`
- **Node Version**: 20.x

### Backend Services (Render)
- **Backend API**: FastAPI (RAG chatbot)
- **Auth Server**: Better Auth (OAuth + sessions)

## 📚 Documentation

- **`DEPLOYMENT_STATUS.md`** - Current deployment status and issues
- **`FINAL_DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`VERCEL_SETUP.md`** - Vercel-specific configuration
- **`CLAUDE.md`** - AI assistant project instructions

## 🔐 Authentication

Uses Better Auth with:
- Email/password authentication
- OAuth (Google + GitHub)
- Cross-domain session cookies
- Secure session management

## 🛠️ Development

```bash
# Clear Docusaurus cache
npm run clear

# Start with fresh build
npm run clear && npm start
```

## 📝 License

This project is for educational purposes.
