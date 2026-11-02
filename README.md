# VaultFlow - Personal Finance & Budget Tracker

A full-stack personal finance tracker. Users register, log in, record income and expenses, set monthly category budgets, and see charts of where their money goes. Every user only ever sees their own data.

- **Backend:** Spring Boot 3 (Java 17), Spring Security with real JWT authentication, Spring Data MongoDB
- **Frontend:** React (TypeScript), Tailwind CSS, Recharts, react-hot-toast
- **Database:** MongoDB Atlas
- **Hosting:** Vercel (frontend), Render with Docker (backend)

---

## Live Demo

**https://vaultflow-zeta.vercel.app/**

The backend runs on Render's free tier, which sleeps when idle. The first request after a quiet period can take 30 to 60 seconds. Please wait for the first login or signup to finish, and the rest is fast.

<!--
## Screenshots
Add images to docs/screenshots/ and uncomment these lines:
![Dashboard](docs/screenshots/dashboard.png)
![Budgets](docs/screenshots/budgets.png)
![Transactions](docs/screenshots/transactions.png)
-->

---

## Features

- **Accounts:** register and log in with email and password (JWT). Passwords are hashed with BCrypt.
- **Transactions:** add, edit and delete income and expenses with category, date, note and payment method.
- **Search, filter and sort:** by text, type, category and date range, with server-side filtering.
- **Charts:** category breakdown (donut chart) and income vs. expenses by month (bar chart).
- **Budgets:** set a monthly cap per expense category and see how much is used.
- **Summary cards:** net balance, total income, total expenses, savings rate.
- **Profile settings:** name, currency and starting balance, saved to the database.
- **Export:** CSV, JSON and a printable statement.
- **Dark and light mode**, responsive layout for phone, tablet and desktop.

---

## Architecture & Project Layout

```text
vaultflow/
├── client/                                # React single page application
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json                        # SPA rewrite rules for Vercel
│   ├── .env.example                       # VITE_API_URL template
│   └── src/
│       ├── api/client.ts                  # REST client: Bearer token, 401 handling, readable error messages
│       ├── components/
│       │   ├── charts/                    # CategoryPieChart, MonthlyTrendsBarChart (Recharts)
│       │   ├── AuthModal.tsx              # Login and signup with client-side validation
│       │   ├── BudgetManagerModal.tsx
│       │   ├── BudgetSection.tsx
│       │   ├── ExportModal.tsx
│       │   ├── Navbar.tsx
│       │   ├── ProfileModal.tsx           # Saves profile via PUT /api/auth/me
│       │   ├── StatsCards.tsx
│       │   ├── TransactionFormModal.tsx
│       │   └── TransactionList.tsx
│       ├── context/
│       │   ├── AuthContext.tsx            # Login state and token
│       │   └── FinanceContext.tsx         # Transactions, budgets and analytics
│       ├── data/mockData.ts               # Category metadata, colors, currencies
│       ├── types.ts
│       ├── App.tsx
│       └── main.tsx
│
├── server/                                # Spring Boot REST API
│   ├── pom.xml
│   ├── Dockerfile                         # Multi-stage build: Maven, then JRE 17
│   ├── .dockerignore
│   ├── .gitignore
│   ├── mvnw / mvnw.cmd                    # Maven wrapper (no Maven install needed)
│   └── src/
│       ├── main/
│       │   ├── java/com/vaultflow/
│       │   │   ├── VaultFlowApplication.java
│       │   │   ├── config/SecurityConfig.java       # Filter chain, CORS, stateless sessions
│       │   │   ├── controller/                      # AuthController, TransactionController, BudgetController
│       │   │   ├── service/                         # AuthService, TransactionService, BudgetService
│       │   │   ├── repository/                      # User, Transaction and Budget repositories
│       │   │   ├── model/                           # User, Transaction, Budget documents
│       │   │   ├── dto/                             # Request/response objects with validation
│       │   │   ├── security/                        # JwtUtils, JwtAuthFilter, UserPrincipal, CustomUserDetailsService
│       │   │   └── exception/                       # GlobalExceptionHandler and custom exceptions
│       │   └── resources/application.properties
│       └── test/                                    # Automated tests (see below)
│
├── .env.example                           # Environment template with placeholder values
├── .gitignore
└── README.md
```

The backend follows a **Controller → Service → Repository** layering. Controllers handle HTTP and validation, services hold the business rules, and repositories talk to MongoDB.

---

## API Reference

All `/api/**` endpoints require `Authorization: Bearer <token>`, except register and login.

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Create an account and receive a token |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/auth/me` | Get the current user |
| PUT | `/api/auth/me` | Update name, currency and starting balance |
| GET | `/api/transactions` | List transactions. Query: `startDate`, `endDate`, `category`, `type`, `search` |
| GET | `/api/transactions/{id}` | Get one transaction |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/{id}` | Update a transaction |
| DELETE | `/api/transactions/{id}` | Delete a transaction |
| GET | `/api/budgets` | List category budgets |
| POST | `/api/budgets` | Create or update a category budget |
| DELETE | `/api/budgets/{id}` | Delete a budget |

Errors are returned as JSON with `status`, `error`, `message`, `path` and, for validation problems, a `details` list that names each field and the reason.

---

## Security Design

1. **No default JWT secret.** `vaultflow.jwt.secret=${JWT_SECRET}` has no fallback, so the server refuses to start without it.
2. **Key length check at startup.** `JwtUtils` verifies the secret is at least 32 bytes and fails fast otherwise. There is no silent padding.
3. **BCrypt password hashing.** Passwords are never stored in plain text. Signup requires 8 to 72 characters (BCrypt ignores anything past 72 bytes, so longer passwords are rejected).
4. **Real HMAC-SHA256 JWTs** (JJWT 0.12) with an expiry. Forged, tampered, expired and unknown-user tokens return `401`.
5. **Stateless filter on every route** except register and login.
6. **The user always comes from the token**, never from a request parameter or body. Every query and delete is scoped to that user id.
7. **No information leak on ownership.** Asking for another user's transaction or budget returns `404`, the same as a record that doesn't exist, so ids cannot be enumerated.
8. **Regex injection protection.** Search text is wrapped in `Pattern.quote()`, so characters such as `(` or `.*` are treated as plain text.
9. **Input validation.** Names may contain only letters (including non-Latin scripts), spaces, hyphens, apostrophes and periods, 2 to 50 characters. Amounts must be positive, dates must be real calendar dates, and currency codes must be three letters.
10. **Duplicate handling.** A concurrent signup with the same email or a concurrent insert of the same budget is caught and handled instead of returning a server error.
11. **Safe error responses.** Bad input returns 400, wrong methods 405, unknown paths 404. Unexpected exceptions are logged on the server and the client only sees a generic message, never a stack trace.
12. **Money uses `BigDecimal`** (stored as Decimal128 in MongoDB) to avoid floating-point rounding errors.
13. **Token inspector is development only** (`import.meta.env.DEV`).

---

## Environment Variables

| Variable | Where | Description | Example |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | server | MongoDB connection string | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/vaultflow?retryWrites=true&w=majority` |
| `JWT_SECRET` | server | Signing key, at least 32 bytes | generate it, see below |
| `JWT_EXPIRATION_MS` | server | Token lifetime in ms (optional, default 7 days) | `604800000` |
| `CORS_ALLOWED_ORIGINS` | server | Comma-separated frontend origins, no trailing slash | `http://localhost:5173,https://your-app.vercel.app` |
| `PORT` | server | Set automatically by Render. Defaults to 8080 locally | `8080` |
| `VITE_API_URL` | client | Backend base URL | `http://localhost:8080` |

Never commit real values. `.env` files are git-ignored.

**Generate a secret**

Linux, macOS or Git Bash:
```bash
openssl rand -hex 32
```

Windows PowerShell:
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
```

---

## Running Locally

### Prerequisites
- Java 17 or newer (`java -version`)
- Node.js 18 or newer and npm
- A MongoDB connection string (free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, see "Database Setup")

The Maven wrapper is included, so you do not need to install Maven.

### 1. Backend

Linux, macOS or Git Bash:
```bash
cd server
export MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/vaultflow?retryWrites=true&w=majority"
export JWT_SECRET="$(openssl rand -hex 32)"
export CORS_ALLOWED_ORIGINS="http://localhost:5173"
./mvnw test
./mvnw spring-boot:run
```

Windows PowerShell:
```powershell
cd server
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/vaultflow?retryWrites=true&w=majority"
$env:JWT_SECRET = "<paste a generated secret>"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

The API starts on `http://localhost:8080`. A successful start prints `Started VaultFlowApplication`.

### 2. Frontend

In a second terminal:

```bash
cd client
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

The app opens on `http://localhost:5173`.

---

## Database Setup (MongoDB Atlas)

1. Create a free **M0** cluster.
2. Under **Database Access**, create a database user with a password. Letters and numbers only keeps the connection string simple. Special characters must be URL-encoded.
3. Under **Network Access**, add an entry for `0.0.0.0/0`. Render's free tier has no fixed outgoing IP, so a single address cannot be allow-listed. The database is still protected by its username and password, and the API by JWT login.
4. Copy the connection string from **Connect → Drivers**, put your password in, and add `/vaultflow` before the `?`.

The `vaultflow` database and its `users`, `transactions` and `budgets` collections are created automatically on first use.

**Troubleshooting:** if startup fails with `SSLException ... internal_error` or a server selection timeout, Atlas is almost always rejecting your IP address. Check the Network Access list.

---

## Automated Tests

```bash
cd server
./mvnw test        # Windows: .\mvnw.cmd test
```

The suite has **46 tests**:

| Test class | Tests | What it covers |
| :--- | :---: | :--- |
| `AuthControllerTest` | 7 | Register success, short password 400, duplicate email 409, login success, wrong password 401, unknown email 401, generic 500 hides details |
| `RegisterValidationControllerTest` | 6 | Numeric, mixed, symbol and one-letter names rejected; hyphenated, apostrophe, periods and Bengali names accepted; password over 72 characters rejected |
| `ProfileUpdateControllerTest` | 4 | Profile update needs a token, uses the id from the token, rejects negative balance, rejects invalid currency |
| `TransactionSecurityIntegrationTest` | 8 | Real JWT filter: valid token works; wrong-secret, expired and unknown-user tokens give 401; cross-user access 404; impossible date 400; malformed JSON 400; wrong HTTP method 405 |
| `TransactionControllerTest` | 7 | 401 without token, user isolation, date filter errors, own-record delete, negative amount rejected |
| `BudgetControllerTest` | 6 | 401 without token, create and update, duplicate-insert race recovery, user isolation |
| `TransactionServiceTest` | 4 | Search text is quoted as a literal, bad date formats and reversed ranges rejected |
| `JwtUtilsTest` | 4 | Claims, tampered signature, expiry, short-key startup failure |

The tests run without a database: repositories are mocked and the MongoDB auto-configuration is switched off in `application-test.properties`.

---

## Deployment

Deploy the **backend first**, because the frontend needs its URL.

### 1. Backend on Render

1. Create a **Web Service** from this repository.
2. Set **Root Directory** to `server` and the environment to **Docker**. Render builds `server/Dockerfile`: stage one runs Maven, stage two runs the jar on a JRE 17 image with `-Duser.timezone=UTC`.
3. Add environment variables:
    - `MONGODB_URI`
    - `JWT_SECRET` (use a new secret for production, not the one from your machine)
    - `CORS_ALLOWED_ORIGINS` (your Vercel URL once you have it; use `http://localhost:5173` for the first deploy)
4. Do not set `PORT`. Render provides it.
5. Deploy. Opening `/api/transactions` without a token should return a JSON `401`, which confirms the server is up and protected.

### 2. Frontend on Vercel

1. Import the repository and set **Root Directory** to `client`.
2. Framework preset **Vite**, build command `npm run build`, output directory `dist`.
3. Add `VITE_API_URL` set to your Render URL, without a trailing slash.
4. Deploy. `client/vercel.json` rewrites all routes to `index.html`.

### 3. Connect them

Go back to Render and change `CORS_ALLOWED_ORIGINS` to the exact Vercel URL (`https://...`, no trailing slash). Render redeploys. A CORS error in the browser almost always means this value does not match exactly.

---

## Known Limitations

- **Cold starts.** Render's free tier sleeps when idle, so the first request can be slow.
- **"Current month" on the dashboard** means the month of your most recent transaction, not necessarily today's month. The budget and savings cards use it.
- **One currency per account.** Changing the currency changes the display symbol. It does not convert existing amounts.
- **No password reset or email verification.**
- **JWT is kept in `localStorage`,** which is simple but exposed to cross-site scripting if the page were ever compromised. A production system might use httpOnly cookies and refresh tokens.
- **Atlas network access is open (`0.0.0.0/0`)** because the hosting tier has no fixed IP. Credentials protect the database.