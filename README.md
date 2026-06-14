# CarbonIQ 🌱

> The zero-input carbon footprint companion. One swap a day. Real rupees saved.

## Quick Start

### 1. Prerequisites
- Node.js 18+
- npm 9+
- A [Groq API key](https://console.groq.com)

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client (new terminal)
cd client && npm install
```

### 4. Run

```bash
# Terminal 1 — Backend (port 3001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Architecture

```
promptwars/
├── server/          # Node.js + Express backend
│   ├── routes/      # 7 REST API route files
│   ├── services/    # Groq AI, Carbon Engine, SMS Parser, Swap Engine, Mohalla
│   ├── middleware/  # Input validation, error handling
│   └── data/        # JSON emission factor databases
└── client/          # Vite + React + TypeScript frontend
    └── src/
        ├── pages/   # 7 pages (Home, SMS, Mohalla, Receipt, Bill, Wallet, Copilot)
        └── api/     # Typed Axios client
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/sms/parse` | Parse SMS → carbon score + swap |
| GET | `/api/sms/samples` | Sample SMS messages |
| GET | `/api/swap/daily` | Today's One Swap Card |
| GET | `/api/mohalla/:pincode` | Neighbourhood carbon stats |
| POST | `/api/receipt/analyze` | Upload receipt image → line-item scores |
| POST | `/api/copilot/chat` | Chat with Carbon Copilot |
| GET | `/api/copilot/starters` | Suggested questions |
| GET | `/api/wallet` | Get wallet state |
| POST | `/api/wallet/action` | Record completed swap |
| POST | `/api/bill/analyze` | Electricity bill analysis |

## Run Tests

```bash
cd server && npm test
```

## Demo Scenes

| Scene | Page | What to show |
|-------|------|-------------|
| 1 | `/sms` | Paste `HDFC Bank: UPI txn of Rs.340 to SWIGGY…` → see 1.4 kg CO₂ |
| 2 | `/mohalla` | Enter `110001` → see Delhi leaderboard |
| 3 | `/receipt` | Upload grocery photo → line items scored |
| 4 | `/` | Home screen → One Swap Card |

## Security

- API key never exposed to client
- Rate limiting: 200 req/15min global, 30 req/15min for AI endpoints
- Helmet security headers
- CORS restricted to localhost:5173
- Input validation on all endpoints (express-validator)
- File upload size + type validation

## Models Used

| Task | Model |
|------|-------|
| SMS parsing, bill analysis, swap generation, Mohalla | `llama-3.3-70b-versatile` |
| Receipt OCR (vision) | `meta-llama/llama-4-scout-17b-16e-instruct` |
