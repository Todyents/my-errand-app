# My Errand App

My Errand App is a marketplace-style service platform for booking, managing, and paying for errands. It supports three main user roles: clients, delivery agents, and administrators. Clients can request errands and pay via PayPal or wallet funds, agents can accept errands and receive payouts, and admins can verify agents and monitor payments.

## What this app does

- Client registration and login
- Delivery agent registration and login
- Admin dashboard for agent verification and payment history
- Create and manage errands with pickup/dropoff details
- Accept errands for delivery agents
- Payment processing via PayPal and Paystack wallet deposits
- Escrow-style wallet flow: client spendable balance → escrow → runner withdrawable balance
- Real-time communication using Socket.IO
- Internationalization support using `react-i18next`

## Architecture

- `server.js` — entry point for the backend API and Socket.IO server
- `routes/` — Express API routes for clients, agents, payments, admin, and errands
- `config/` — database connectivity for MySQL and MongoDB
- `utils/` — wallet and payment helper utilities
- `client/` — React frontend application powered by Webpack
- `scripts/` — database setup scripts

## Tech stack

- Backend: Node.js, Express, MySQL, MongoDB, JWT, Socket.IO
- Frontend: React, Webpack, `react-i18next`, Axios
- Payments: PayPal, Paystack
- Security: bcrypt, helmet, express-rate-limit, express-validator

## Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/Todyents/my-errand-app.git
   cd my-errand-app
   ```

2. Install root dependencies:

   ```bash
   npm install
   ```

3. Install client dependencies:

   ```bash
   npm run install-client
   ```

4. Create environment variables. Example `.env`:

   ```env
   PORT=5000
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=errandsplace
   JWT_SECRET=your_jwt_secret
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_SECRET=your_paypal_secret
   ```

5. Prepare your database schema. Use the SQL files in `database/` and the scripts in `scripts/` as needed.

For local MariaDB, copy `.env.example` to `.env`, then run:

```bash
npm run db:start
npm run server
```

The MariaDB data is stored in the `mariadb_data` Docker volume. The schema files are applied only when that volume is initialized.

### WordPress linking

WordPress cannot connect directly to a MariaDB container running in this workspace. Deploy the frontend and backend to public HTTPS URLs, then add a normal WordPress button or link to the frontend URL:

```html
<a href="https://app.example.com" target="_blank" rel="noopener">Open My Errand App</a>
```

Set the deployed backend's `CLIENT_URL` and `FRONTEND_URL` to the WordPress site's origin if WordPress makes browser requests to the API. Do not expose MariaDB publicly; expose only the HTTPS API.

## Running the app

### Development

```bash
npm run dev
```

### Cordova Android build

Cordova packages the production Webpack output from `client/dist` into `www/` before building the native shell.

Install the prerequisites and verify them in a terminal:

```bash
npm install -g cordova
javac -version
adb --version
```

Set `JAVA_HOME` to your JDK directory and `ANDROID_HOME` to your Android SDK directory. Add these directories to `PATH`:

- `$JAVA_HOME/bin`
- `$ANDROID_HOME/platform-tools`
- `$ANDROID_HOME/cmdline-tools/latest/bin`

Initialize the Android platform and plugins once:

```bash
cordova platform add android
cordova plugin add cordova-plugin-dialogs
cordova plugin add cordova-plugin-inappbrowser
cordova plugin add cordova-plugin-statusbar
```

The Android platform provides the current splash screen behavior, so the legacy `cordova-plugin-splashscreen` plugin is not used with the configured Android platform version.

Build or run the app after setting `API_BASE` to the reachable backend URL:

```bash
API_BASE=https://your-backend.example.com npm run build:cordova
cordova build android
cordova run android
```

The debug APK is created under `platforms/android/app/build/outputs/apk/debug/`.

This runs the backend and client concurrently:
- backend on `http://localhost:5000`
- client on `http://localhost:3001`

### Production build for client

```bash
npm run build
npm run build:prod
```

## Deployment

### Production Architecture

- **Frontend**: Deployed to Cloudflare Pages (static hosting)
- **Backend**: Deployed to Render (Node.js hosting)
- **Database**: MongoDB Atlas (cloud database)

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `PAYPAL_CLIENT_ID`: Your PayPal client ID
   - `PAYPAL_CLIENT_SECRET`: Your PayPal client secret
   - `CLIENT_URL`: Your Cloudflare Pages domain (e.g., `https://your-app.pages.dev`)
   - `EMAIL_USER`: Your email for notifications
   - `EMAIL_PASSWORD`: Your email app password
   - `NODE_ENV`: `production`

4. Set build command: `npm install`
5. Set start command: `npm start`

### Frontend Deployment (Cloudflare Pages)

1. Create a new Pages project on Cloudflare
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `cd client && npm run build`
   - Build output directory: `client/dist`
4. Set environment variable:
   - `API_BASE`: Your backend URL (e.g., `https://your-app.onrender.com`)
5. Configure a custom domain in Cloudflare Pages to `https://myerrand.name.ng`

### Database Setup

1. Create a MongoDB Atlas cluster
2. Get your connection string and add it to Render environment variables
3. The app will automatically create collections and indexes on first run

### Post-Deployment

1. Update CORS in `app.js` if needed for your specific domain
2. Test API endpoints and frontend-backend communication
3. Verify payment processing works in production

## API highlights

### Client routes
- `POST /api/clients/register` — register a new client
- `POST /api/clients/login` — client login

### Agent routes
- `POST /api/agents/register` — register a delivery agent
- `POST /api/agents/login` — agent login

### Payment routes
- `POST /api/payments/capture-order/:orderId` — capture a PayPal order and confirm an errand
- `POST /api/payments/deposit` — deposit funds into a wallet
- `POST /api/payments/withdraw` — withdraw funds from a wallet
- `GET /api/admin/payments` — admin payment history

## Frontend

The React client lives in `client/`. It uses:

- `webpack` for bundling
- `react-router-dom` for routes
- `axios` for API requests
- `react-i18next` for localization

## Notes

- The backend assumes a MySQL database schema with clients, delivery agents, errands, wallets, and transactions.
- PayPal is configured for sandbox mode by default in the payment route.
- Wallets are structured with `spendable`, `escrow`, and `withdrawable` balances.
- There is also a `server/` folder in the repository that appears to contain additional backend scaffolding; the main app entrypoint is at the repository root.

## Recommended next steps

- Add a proper `.env.example` file to make setup easier
- Complete database migration scripts and example data
- Add a production-ready PayPal environment config
- Add validation and auth middleware to all payment and wallet endpoints

## Contact

If you want help expanding the app, I can also document the exact client/agent/admin user flows and the important database tables.