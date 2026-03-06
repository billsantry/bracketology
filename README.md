# 🏀 Bracketology — NCAA March Madness Bracket App

> Live at: **https://app-bracketology-bs.azurewebsites.net**  
> Custom domain: **https://bracketology.billsantry.com** *(coming soon)*

A full-stack NCAA March Madness bracket prediction app built with **Next.js**, **PostgreSQL**, and **Prisma ORM**. Create pools, make your picks, and watch the leaderboard update in real-time as games are played.

---

## 🚀 Features

- 🔐 **User Authentication** — Register/login with email & password
- 🏆 **Bracket Pools** — Create or join pools to compete with friends
- 📋 **Interactive Bracket Picker** — Click to pick winners across all 67 tournament games
- 📊 **Live Leaderboard** — Rankings update automatically as the admin records game results
- 🛠️ **Admin Dashboard** — Record actual game winners to trigger automatic scoring

---

## 🎮 How to Use

### 1. Register or Log In
- Go to **[/register](https://app-bracketology-bs.azurewebsites.net/register)** to create a new account, or
- Log in at **[/login](https://app-bracketology-bs.azurewebsites.net/login)**

> **Admin credentials** (for demo): `admin@brackets.com` / `password123`

### 2. Create or Join a Pool
- Navigate to **Pools** in the nav bar
- Click **Create Pool**, give it a name, and share it with friends
- Each pool has its own invite code and leaderboard

### 3. Fill Out Your Bracket
- Go to **My Bracket**
- Select your pool from the dropdown
- Click on team names to pick winners — your selections are highlighted in blue
- Enter a bracket name, then click **Save Bracket**

### 4. Track Results (Admin Only)
- Admin users can go to the **Admin** page
- Select a game and enter the winner as the real tournament progresses
- The app automatically recalculates all bracket scores after each result

### 5. Check the Leaderboard
- Go to **Pools → View Leaderboard** for your pool
- Rankings update live as the admin records game results
- Scoring: 10 pts × round number (Round 1 = 10, Round 2 = 20, etc.)

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL

### Setup

```bash
# Clone the repo
git clone https://github.com/billsantry/bracketology.git
cd bracketology

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Run database migrations
npx prisma migrate deploy

# Seed the database (68 teams + admin user + 67 games)
npx prisma db seed

# Start the dev server
npm run dev
```

The app will be running at **http://localhost:3000**.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (run `openssl rand -hex 32`) |
| `NEXTAUTH_URL` | App base URL (e.g. `http://localhost:3000`) |

---

## 🚢 Deployment (Azure App Service)

Deployments are automated via **GitHub Actions** on every push to `master`.

### Required GitHub Secrets

Go to **Settings → Secrets and Variables → Actions** in your GitHub repo and add:

| Secret Name | Value |
|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Contents of the Azure publish profile XML |
| `DATABASE_URL` | Azure PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Your production NextAuth secret |
| `NEXTAUTH_URL` | `https://app-bracketology-bs.azurewebsites.net` |

### Manual Deployment

```bash
az webapp up --name app-bracketology-bs --resource-group rg-ncaa-bracket --location centralus --os-type Linux --runtime "NODE:20-lts" --sku B1
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Hosting | Azure App Service (B1) |
| DB Hosting | Azure PostgreSQL Flexible Server |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, bracket, pools, admin, leaderboard)
│   ├── admin/         # Admin dashboard
│   ├── bracket/       # Bracket picker UI
│   ├── login/         # Login page
│   ├── pools/         # Pool list + leaderboard
│   └── register/      # Registration page
├── components/
│   └── Navbar.tsx
└── lib/
    └── prisma.ts      # Prisma client singleton
prisma/
├── schema.prisma      # Database schema
├── migrations/        # Migration history
└── seed.ts            # Database seeder
```
