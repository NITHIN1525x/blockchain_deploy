# Decentralized Freelance Marketplace (Escrow)

Full-stack freelance marketplace with escrow workflow using:

- `frontend/`: React (Vite) + plain CSS + JWT auth
- `backend/`: Django + DRF + JWT + SQLite
- `blockchain/`: Hardhat + Solidity escrow contract

---

## Features

- Role-based auth (`client`, `freelancer`)
- Job posting and browsing
- Proposal apply/accept/reject flow
- Project lifecycle with escrow statuses
- Work submission and revision cycle
- Project chat
- Disputes and admin resolution
- MetaMask integration (frontend)
- Blockchain sync endpoints (Django) for on-chain lock/approve events

---

## Project Structure

`marketplace/`

- `backend/`
	- `users/` - authentication, profiles, wallet address, balance
	- `jobs/` - job posting and management
	- `proposals/` - freelancer proposals
	- `projects/` - project and submission workflow
	- `payments/` - MetaMask/contract sync APIs
	- `chat/` - project messaging
	- `disputes/` - dispute workflow
	- `seed.py` - sample users and jobs
- `frontend/`
	- `src/pages/` - all public/dashboard pages
	- `src/components/` - shared UI elements
	- `src/context/` - auth and web3 providers
	- `src/utils/escrowContract.js` - ethers contract helpers
	- `src/css/` - plain CSS styles
- `blockchain/`
	- `contracts/FreelanceEscrow.sol`
	- `scripts/deploy.js`
	- `test/escrow.test.js`

---

## Backend Setup (Django)

From `marketplace/backend`:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python seed.py
python manage.py runserver
```

Backend URL:

- `http://127.0.0.1:8000`

### Environment Notes

Optional blockchain bridge config is in `backend/.env`:

- `WEB3_RPC_URL` (default `http://127.0.0.1:8545`)
- `WEB3_CHAIN_ID` (default `31337`)
- `ESCROW_CONTRACT_ADDRESS` (optional; auto-read from `blockchain/deployment.json`)

---

## Frontend Setup (React)

From `marketplace/frontend`:

```bash
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

---

## Blockchain Setup (Hardhat)

From `marketplace/blockchain`:

```bash
npm install
npx hardhat compile
npx hardhat test
```

Start local chain and deploy:

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

Deployment data is saved to `blockchain/deployment.json`.

---

## API Endpoints

### Auth

- `POST /api/register/`
- `POST /api/login/`
- `GET /api/profile/`
- `PUT /api/profile/`

### Jobs

- `GET /api/jobs/`
- `POST /api/jobs/create/`
- `GET /api/jobs/{id}/`
- `POST /api/jobs/{id}/delete/`

### Proposals

- `POST /api/jobs/{id}/apply/`
- `GET /api/jobs/{id}/proposals/`
- `POST /api/proposals/{id}/accept/`
- `POST /api/proposals/{id}/reject/`

### Projects

- `GET /api/projects/`
- `GET /api/projects/{id}/`
- `POST /api/projects/{id}/lock-payment/` (DB simulation)
- `POST /api/projects/{id}/submit-work/`
- `POST /api/projects/{id}/request-revision/`
- `POST /api/projects/{id}/approve/` (DB simulation)

### Chat

- `GET /api/projects/{id}/messages/`
- `POST /api/projects/{id}/messages/send/`

### Disputes

- `POST /api/projects/{id}/raise-dispute/`
- `GET /api/disputes/`
- `POST /api/disputes/{id}/under-review/`
- `POST /api/disputes/{id}/resolve/`

### Payments / Blockchain Sync

- `GET /api/payments/contract-info/`
- `POST /api/payments/connect-wallet/`
- `POST /api/projects/{id}/lock-payment/onchain-sync/`
- `POST /api/projects/{id}/approve/onchain-sync/`

---

## Test Users

### Admin

- `admin@test.com / admin123`

### Clients

- `john@test.com / test1234`
- `sarah@test.com / test1234`
- `mike@test.com / test1234`

### Freelancers

- `alex@test.com / test1234`
- `priya@test.com / test1234`
- `carlos@test.com / test1234`
- `nina@test.com / test1234`

---

## MetaMask Workflow (Step 19)

1. Freelancer connects wallet from **Wallet Page** (`/freelancer/wallet`) and syncs address.
2. Client opens **Active Projects** and uses **Lock Payment (MetaMask)**.
3. Freelancer submits work (on-chain submit is triggered for blockchain-linked projects).
4. Client reviews and approves; on-chain release is executed and synced to Django.

---

## Django ↔ Contract Workflow (Step 20)

- Frontend executes blockchain transactions with MetaMask.
- Backend receives transaction metadata (`tx_hash`, `onchain_project_id`) via sync APIs.
- Backend updates project/payment states and freelancer balance for dashboard/reporting consistency.

This design keeps private keys in user wallets (MetaMask) while Django remains the source of business records.