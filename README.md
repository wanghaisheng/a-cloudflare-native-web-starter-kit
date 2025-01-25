# Cloudflare Turbo Stack

A starter template that demonstrates how to build AI-powered mobile and web applications using Cloudflare's edge platform. This example app creates AI-generated stories about a user's day and generates accompanying images - all powered by Cloudflare's edge services. You can use this as a foundation to build any type of AI-powered application you want.

## 🚀 Features

- 📱 **Expo Mobile App**: Cross-platform mobile application
- 🌐 **Astro Landing Page**: Fast, modern web presence
- 🔒 **Clerk Authentication**: Secure user management
- 🔄 **tRPC API**: Type-safe API communication
- 🤖 **Workers AI**: Edge AI processing
- 📦 **R2 Storage**: Image and asset storage
- 💾 **D1 Database**: Edge SQLite database with Drizzle ORM
- 🏗️ **Cloudflare Workers**: Serverless compute
- 🔄 **Workflows**: Durable AI task processing

## 📦 Project Structure

```
.
├── apps/
│   ├── apiservice/    # Cloudflare Worker API
│   ├── expo/         # Mobile application
│   ├── astro/        # Landing page
│   └── workflows/    # Cloudflare Workers AI processing
├── packages/
│   ├── db/           # Database schema and utilities
│   └── trpc/         # tRPC router definitions
└── tooling/          # Shared development tools
```

## 🛠️ Prerequisites

- Node.js >= 20.16.0
- pnpm >= 9.6.0
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)
- Clerk account

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone <repository-url>
cd cloudflare-turbo
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure Cloudflare Resources**

First, login to Cloudflare CLI:
```bash
wrangler login
```

Create a D1 Database:
```bash
wrangler d1 create your-database-name
```

Create an R2 Bucket:
```bash
wrangler r2 bucket create your-bucket-name
```

4. **Configure wrangler.toml Files**

You'll need to update the wrangler.toml files in both `apps/apiservice` and `apps/workflows` with your specific configuration:

Example `wrangler.toml` structure:
```toml
name = "your-app-name"
main = "src/index.ts"

[[d1_databases]]
binding = "DB"
database_name = "your-database-name"
database_id = "your-database-id"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "your-bucket-name"
```

5. **Initial Deployment**

Before running the app locally, you need to deploy the API service and workflows:

```bash
# Deploy API service
cd apps/apiservice
pnpm run deploy

# Deploy workflows
cd ../workflows
pnpm run deploy
```

6. **Environment Setup**

Create `.env` files based on the provided examples and update with your credentials:
```bash
cp apps/expo/.env.example apps/expo/.env
```

7. **Start Development**

```bash
pnpm dev
```

## 🔧 Troubleshooting

If you run into package-related issues when updating dependencies or adding new packages:

```bash
# Clean workspace and rebuild
pnpm clean:workspaces
pnpm install
pnpm build
```

## 📝 Development Notes

- Use `pnpm dev` to start all services in development mode
- Database migrations can be run with `pnpm db:generate`
- The project uses a monorepo structure with Turborepo for efficient builds

## 🚀 Deploying Changes

When you make changes to the API service or workflows, you'll need to redeploy:

```bash
# Deploy API service changes
cd apps/apiservice
pnpm run deploy

# Deploy workflow changes
cd ../workflows
pnpm run deploy
```

## 📚 Tech Stack

- **Frontend**: React Native (Expo), Astro
- **Backend**: Cloudflare Workers, Workers AI
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Authentication**: Clerk
- **API**: tRPC
- **Build Tool**: Turborepo
- **Package Manager**: pnpm

## 🎯 Example App

The included example app demonstrates:
- User authentication with Clerk
- Generating stories about a user's day using Workers AI
- Creating AI-generated images based on the stories
- Storing images in R2
- Managing user data in D1
- Processing AI tasks with durable Workers

You can use this as a reference to build your own AI-powered applications with different features and use cases.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
