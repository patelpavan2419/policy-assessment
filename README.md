# Policy Assessment Solution

## Setup

1. Copy `.env.example` to `.env` and update if needed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start MongoDB locally (this project expects `mongodb://localhost:27017/policy_assessment`).
4. Start server (recommended via monitor which auto-restarts on high CPU):
   ```bash
   npm start
   ```
   Or run server directly for development:
   ```bash
   npm run start:server
   ```
   For auto-reload during development:
   ```bash
   npm run dev
   ```

## Endpoints (quick)

- `POST /api/upload` — upload CSV/XLSX (multipart/form-data, field name `file`)
- `GET /api/policy/search/:username` — search policies by user first name
- `GET /api/policy/aggregate` — aggregate policies by user
- `POST /api/schedule` — schedule message: JSON `{ message, day, time }`
- `GET /api/message` — list scheduled messages

See Postman collection at `/postman/Policy_Assessment_API_Collection.json` for ready requests.
