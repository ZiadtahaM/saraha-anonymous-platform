# Saraha Anonymous Platform

An anonymous inbox API. Every user gets a public link. Anyone can send them a message without an account, and the owner reads, answers publicly, blocks or reports it. Built with Node.js, Express and MongoDB.

## What works

Verified by the test suite in `test/api.test.js` (9 tests, run against an in-memory MongoDB):

- Register and login with Joi validation, bcrypt password hashing and short-lived JWTs
- Public profile at `GET /api/users/:username` showing the username, whether the inbox is open, and publicly answered messages only
- Anonymous send at `POST /api/users/:username/messages`, no login, 500 character limit, 5 messages per 10 minutes per address
- Inbox with pagination and an unread filter, mark as read, delete
- Answer a message to show it on the public profile
- Block a sender and report a message. The sender is stored only as an HMAC of the IP and is never returned by any endpoint
- Owner switch to close the inbox, and delete account (removes the user and all their messages)
- Helmet headers, 10kb body limit, rate limiting on login and register

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | no | create account |
| POST | `/api/auth/login` | no | get a token |
| GET | `/api/users/:username` | no | public profile and answers |
| POST | `/api/users/:username/messages` | no | send anonymous message |
| GET | `/api/users/me` | yes | own account |
| PATCH | `/api/users/me/settings` | yes | open or close inbox |
| DELETE | `/api/users/me` | yes | delete account and messages |
| GET | `/api/messages` | yes | inbox (`page`, `limit`, `unread=true`) |
| PATCH | `/api/messages/:id/read` | yes | mark read |
| POST | `/api/messages/:id/answer` | yes | answer publicly |
| POST | `/api/messages/:id/report` | yes | flag a message |
| POST | `/api/messages/:id/block` | yes | block the sender |
| DELETE | `/api/messages/:id` | yes | delete a message |

## Run it

```bash
cp .env.example .env   # set MONGO_URI, JWT_SECRET, FINGERPRINT_SECRET
npm install
npm start
npm test
```

## Not built yet

- No frontend, this is the API only
- No email verification or password reset
- No Google login, OTP email or image upload. The unfinished prototype files for those were removed from the repo
- No content moderation beyond block and report, and reports are only flagged, nothing reviews them yet
- Rate limits are in memory, so they reset on restart and do not share state across instances

## Licence

ISC
