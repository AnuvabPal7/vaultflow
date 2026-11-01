# VaultFlow - Personal Finance & Budget Tracker

A production-grade, full-stack personal finance and budget tracker web application featuring a **Spring Boot 3 (Java 17)** RESTful backend with **JWT authentication** and **MongoDB (Spring Data MongoDB)** persistence, coupled with a responsive **React (TypeScript)** and **Tailwind CSS** frontend with **Recharts** visualizations and **react-hot-toast** notifications.

---

## 🏗️ Architecture & Project Layout

The repository is structured into distinct, self-contained `client/` and `server/` directories following clean architectural separation:

```text
vaultflow/
├── client/                               # Frontend Single Page Application
│   ├── package.json                      # React 19, Vite, Recharts, react-hot-toast
│   ├── index.html                        # Application entry HTML
│   ├── vite.config.ts                    # Vite build & dev configuration
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   ├── vercel.json                       # Vercel SPA routing configuration
│   ├── .env.example                      # Client environment variables template
│   ├── .gitignore                        # Client gitignore
│   ├── README.md                         # Client overview linking to root README
│   └── src/
│       ├── api/
│       │   └── client.ts                 # Real REST client (Bearer token, 401 interceptor, no dummy fallbacks)
│       ├── components/
│       │   ├── charts/
│       │   │   ├── CategoryPieChart.tsx  # Recharts Donut/Pie chart for category spending
│       │   │   └── MonthlyTrendsBarChart.tsx # Recharts Bar chart for income vs. expense trends
│       │   ├── AuthModal.tsx             # Real JWT registration & login dialog
│       │   ├── BudgetManagerModal.tsx    # Monthly spending cap manager
│       │   ├── BudgetSection.tsx         # Real-time category budget status & pace
│       │   ├── ExportModal.tsx           # CSV, JSON, and print statement exporter
│       │   ├── Navbar.tsx                # 3-Zone navigation header & dark/light mode
│       │   ├── ProfileModal.tsx          # User profile settings & Dev-only token inspector
│       │   ├── StatsCards.tsx            # Net balance, monthly income, monthly expenses, savings rate
│       │   └── TransactionList.tsx       # Paginated transactions with server-side filters & sorting
│       ├── context/
│       │   ├── AuthContext.tsx           # React Context API for JWT authentication state
│       │   └── FinanceContext.tsx        # React Context API for transactions, budgets & analytics
│       ├── data/
│       │   └── mockData.ts               # Category metadata, palette colors, currencies
│       ├── types.ts                      # Shared TypeScript definitions
│       ├── App.tsx                       # Dashboard layout & routing
│       └── main.tsx                      # DOM root mount
│
├── server/                               # Backend RESTful API (Spring Boot 3 + Java 17)
│   ├── pom.xml                           # Maven dependencies (Web, Security, Data MongoDB, Validation, JJWT)
│   ├── Dockerfile                        # Multi-stage container build (Maven -> JRE 17)
│   ├── .dockerignore                     # Docker build exclusion rules
│   ├── .gitignore                        # Git exclusion rules for server (target/, .env, IDE)
│   ├── mvnw / mvnw.cmd                   # Maven wrapper executables
│   ├── .mvn/wrapper/                     # Maven wrapper configuration
│   ├── README.md                         # Server overview linking to root README
│   └── src/
│       ├── main/
│       │   ├── java/com/vaultflow/
│       │   │   ├── VaultFlowApplication.java # Spring Boot entry point
│       │   │   ├── config/
│       │   │   │   └── SecurityConfig.java   # Spring Security filter chain, CORS, stateless session
│       │   │   ├── controller/               # Controller Layer
│       │   │   │   ├── AuthController.java   # /api/auth (register, login, me)
│       │   │   │   ├── TransactionController.java # /api/transactions CRUD & filtering
│       │   │   └── BudgetController.java     # /api/budgets CRUD
│       │   │   ├── service/                  # Service Layer
│       │   │   │   ├── AuthService.java      # BCrypt hashing, JWT generation, credentials check
│       │   │   │   ├── TransactionService.java # User-scoped queries, Pattern.quote literal search
│       │   │   └── BudgetService.java        # User-scoped budget management & race handling
│       │   │   ├── repository/               # Repository Layer (Spring Data MongoDB)
│       │   │   │   ├── UserRepository.java   # MongoRepository for User documents
│       │   │   │   ├── TransactionRepository.java # MongoRepository for Transaction documents
│       │   │   └── BudgetRepository.java     # MongoRepository for Budget documents
│       │   │   ├── model/                    # MongoDB Document Models
│       │   │   │   ├── User.java             # @Document(collection = "users"), BigDecimal balance
│       │   │   │   ├── Transaction.java      # @Document(collection = "transactions"), BigDecimal amount, LocalDate date
│       │   │   └── Budget.java               # @Document(collection = "budgets"), unique (userId, category) index
│       │   │   ├── dto/                      # Data Transfer Objects & Validation
│       │   │   │   ├── RegisterRequest.java  # @NotBlank, @Email, @Size(min=8)
│       │   │   │   ├── LoginRequest.java     # @NotBlank, @Email
│       │   │   │   ├── AuthResponse.java     # Token + UserDto
│       │   │   │   ├── UserDto.java          # Sanitized user response (no password)
│       │   │   │   ├── TransactionRequest.java # @NotNull, @Positive BigDecimal amount, LocalDate date
│       │   │   │   ├── BudgetRequest.java    # @NotBlank, @DecimalMin(0) BigDecimal limit
│       │   │   └── ErrorResponse.java        # Standard JSON error payload
│       │   │   ├── security/                 # Security & JWT Processing
│       │   │   │   ├── JwtUtils.java         # HMAC-SHA256 signature, startup length validation
│       │   │   │   ├── JwtAuthFilter.java    # OncePerRequestFilter extracting Bearer tokens
│       │   │   │   ├── UserPrincipal.java    # UserDetails implementation
│       │   │   └── CustomUserDetailsService.java
│       │   │   └── exception/                # Exception Handling
│       │   │       ├── GlobalExceptionHandler.java # Handlers for 400, 401, 404, 405, 409 DuplicateKey, generic 500
│       │   │       ├── ResourceNotFoundException.java
│       │   │       ├── UnauthorizedException.java
│       │   │       ├── ForbiddenException.java
│       │   │       └── BadRequestException.java
│       │   └── resources/
│       │       └── application.properties    # Environment-driven properties (no default JWT secret, decimal128)
│       └── test/                             # Automated Test Suite (36 passing tests)
│           ├── java/com/vaultflow/
│           │   ├── controller/
│           │   │   ├── AuthControllerTest.java # 7 tests: register, login, duplicate key 409, generic 500
│           │   │   ├── TransactionSecurityIntegrationTest.java # 8 tests: real filter, 401s, 404s, malformed JSON 400, bad calendar date 400, wrong method 405
│           │   │   ├── TransactionControllerTest.java # 7 tests: 401 without token, user isolation 404, date filter 400s, validation
│           │   │   └── BudgetControllerTest.java # 6 tests: 401 without token, create/update, race recovery, user isolation 404
│           │   ├── service/
│           │   │   └── TransactionServiceTest.java # 4 tests: ArgumentCaptor Pattern.quote queries and date filter format checks
│           │   └── security/
│           │       └── JwtUtilsTest.java     # 4 tests: claims, signature tampering, expiration, short key startup error
│           └── resources/
│               └── application-test.properties # Test-only properties
│
├── .env.example                          # Environment template with placeholder secrets
├── .gitignore                            # Root gitignore
└── README.md                             # Comprehensive documentation
```

---

## 🔒 Security Architecture (Strict & Genuine)

1. **No Default JWT Secret**: `vaultflow.jwt.secret=${JWT_SECRET}` in `application.properties` has no fallback default. The server refuses to boot if `JWT_SECRET` is unset.
2. **Startup Key Validation**: `JwtUtils.@PostConstruct` verifies that the secret is at least 32 bytes (256 bits). If shorter, it throws an `IllegalStateException` immediately at startup (no silent zero-padding).
3. **Passwords Hashed with BCrypt**: Passwords are never stored in plain text. During registration (`POST /api/auth/register`), passwords require at least 8 characters and are hashed with `BCryptPasswordEncoder`.
4. **Real HMAC-SHA256 JWT**: JWTs are created and verified using `io.jsonwebtoken` (JJWT 0.12.x) with the 256-bit key from `JWT_SECRET` and a strict expiry timestamp (`JWT_EXPIRATION_MS`).
5. **Stateless Spring Security Filter**: Every request to `/api/**` (except `/api/auth/register`, `/api/auth/login`, and `/api/health`) is checked by `JwtAuthFilter`. Missing, forged, expired, or foreign-key tokens return `401 Unauthorized`.
6. **Strict User Scoping & Zero-Trust Client IDs**: Endpoints never accept a `userId` from client parameters. The authenticated user ID is obtained solely from `@AuthenticationPrincipal UserPrincipal principal`.
7. **No Information Leak on Ownership**: Inquiries or deletion attempts for unowned transactions or budgets return `404 Not Found` (identical to non-existent IDs), preventing attackers from enumerating valid IDs.
8. **Regex Injection Protection**: Search queries in `TransactionService.getTransactions` wrap the user input with `java.util.regex.Pattern.quote()` to ensure regex metacharacters (`(`, `.*`, `[`) are evaluated as plain literals without crashing or bypassing criteria. Verified via unit test inspecting the captured Mongo `Query`.
9. **Duplicate Key Race Handling**: A concurrent registration attempt triggering MongoDB's unique email index is caught by `AuthService.register`, returning a specific error message. In `BudgetService.setBudget`, a `DuplicateKeyException` from concurrent inserts is caught, and the service re-reads and updates the existing record gracefully.
10. **Sanitized 500 Errors & Specific Bad Input Handlers**: `GlobalExceptionHandler` handles `HttpMessageNotReadableException` (400), `MethodArgumentTypeMismatchException` (400), `MissingServletRequestParameterException` (400), `HttpRequestMethodNotSupportedException` (405), and `NoResourceFoundException` (404). Generic exceptions log the full stack trace server-side with `logger.error(..., ex)` and return only a safe message (`"An unexpected error occurred"`).
11. **Dev-Only Token Inspector**: In `ProfileModal.tsx`, the token inspector is conditionally rendered only when `import.meta.env.DEV` is true.

---

## ⚙️ Environment Variables

Copy `.env.example` to configure your environment:

| Variable | Description | Example / Required |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/vaultflow` |
| `JWT_SECRET` | 256-bit secret key for HMAC-SHA256 | `<generate with: openssl rand -hex 32>` (Must be at least 32 bytes) |
| `JWT_EXPIRATION_MS` | Token lifespan in milliseconds (7 days) | `604800000` |
| `PORT` | Backend server port | `8080` |
| `CORS_ALLOWED_ORIGINS`| Comma-separated list of allowed frontend URLs | `http://localhost:3000,http://localhost:5173,https://your-vaultflow.vercel.app` |
| `VITE_API_URL` | Frontend API target URL (empty for same-origin proxy) | `http://localhost:8080` |

---

## 🚀 Running Locally

### 1. Prerequisites
- **Java 17+** (`java -version`)
- **Maven 3.8+** (or use the included `./mvnw`)
- **Node.js 18+** & **npm**
- **MongoDB** running locally (`localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI

---

### 2. Backend Setup (Spring Boot)

```bash
# Navigate to backend directory
cd server

# Set environment variables (generate a 32-byte secret with openssl)
export MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/vaultflow?retryWrites=true&w=majority"
export JWT_SECRET="$(openssl rand -hex 32)"
export CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

# Run automated test suite (36 tests)
./mvnw test

# Start the Spring Boot REST API
./mvnw spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.

---

### 3. Frontend Setup (React)

```bash
# In a new terminal, navigate to client directory
cd client

# Install dependencies (no flags required)
npm install

# Start Vite development server
npm run dev
```

The React frontend will start on **`http://localhost:5173`**.

---

## 🧪 Automated Backend Tests (36 Tests)

The backend test suite (`server/src/test/java/com/vaultflow/`) includes **36 automated tests**:

```bash
cd server
./mvnw test
```

### Verified Scenarios:
1. **AuthControllerTest (7 tests)**:
   - Registration success returns `201 Created` with signed token
   - Password under 8 characters returns `400 Bad Request`
   - Duplicate email race condition handled with `409 Conflict`
   - Login success with correct credentials returns `200 OK`
   - Login with wrong password returns `401 Unauthorized`
   - Login with non-existent email returns `401 Unauthorized`
   - Unhandled server exception returns `500` with generic sanitized message
2. **TransactionSecurityIntegrationTest (8 tests)**:
   - Real `JwtAuthFilter` authenticates valid User A token and returns transactions (`200 OK`)
   - Real `JwtAuthFilter` rejects token signed with a different secret (`401 Unauthorized`)
   - Real `JwtAuthFilter` rejects expired token (`401 Unauthorized`)
   - Real `JwtAuthFilter` rejects token for deleted/non-existent user ID (`401 Unauthorized`)
   - User A accessing or deleting User B's transaction returns `404 Not Found` (information leak prevented)
   - POST transaction with invalid calendar date like `2026-13-45` returns `400 Bad Request`
   - POST transaction with malformed JSON returns `400 Bad Request`
   - Unsupported HTTP method on `/api/transactions` returns `405 Method Not Allowed`
3. **TransactionControllerTest (7 tests)**:
   - `GET /api/transactions` without token returns `401 Unauthorized`
   - Valid token returns user transactions with total count
   - Invalid `startDate` format returns `400 Bad Request`
   - `startDate` after `endDate` returns `400 Bad Request`
   - Unowned transaction delete returns `404 Not Found`
   - User can delete own transaction (`200 OK`)
   - Negative transaction amount returns `400 Bad Request` validation failure
4. **BudgetControllerTest (6 tests)**:
   - `GET /api/budgets` without token returns `401 Unauthorized`
   - Valid token returns user's category budgets (`200 OK`)
   - Upsert category budget saves with `BigDecimal` limit (`200 OK`)
   - Concurrent insert race recovery: catches `DuplicateKeyException`, re-reads and updates budget (`200 OK`)
   - User A cannot delete User B's budget -> returns `404 Not Found`
   - User A can delete own budget (`200 OK`)
5. **TransactionServiceTest (4 tests)**:
   - Captures MongoDB `Query` via `ArgumentCaptor` and verifies `Pattern.quote` for regex metacharacters `(` and `.*`
   - Invalid `startDate` format throws `BadRequestException`
   - Invalid `endDate` format throws `BadRequestException`
   - `startDate` after `endDate` throws `BadRequestException`
6. **JwtUtilsTest (4 tests)**:
   - Generates signed HS256 tokens and extracts claims correctly
   - Tampered signature fails validation
   - Expired token fails validation
   - Secret shorter than 32 bytes throws `IllegalStateException` on startup

---

## ☁️ Deployment Guide

### A. Deploy Backend to Render or Railway

1. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
2. Point to this repository and set **Root Directory** to `server`.
3. Choose **Docker** environment. Render will use `server/Dockerfile` (Stage 1 uses `maven:3.9-eclipse-temurin-17` to run `mvn -q -DskipTests package`; Stage 2 uses `eclipse-temurin:17-jre` to run the jar with `-Duser.timezone=UTC`, listening on `$PORT`).
4. Set Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Random 32-byte secret generated via `openssl rand -hex 32`.
   - `JWT_EXPIRATION_MS`: `604800000`
   - `CORS_ALLOWED_ORIGINS`: Your Vercel domain (e.g., `https://vaultflow.vercel.app`).
   - `PORT`: `8080`
5. Deploy.

---

### B. Deploy Frontend to Vercel

1. Import this repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Set Environment Variables:
   - `VITE_API_URL`: Your Render backend service URL (e.g. `https://vaultflow-api.onrender.com`).
7. Deploy (uses `client/vercel.json` for SPA rewrites).
