# Security Improvements

## Overview

Four security layers added to the Express server:

| # | Feature | Package | Purpose |
|---|---------|---------|---------|
| 1 | Security Headers | `helmet` | Sets HTTP headers to prevent common attacks (XSS, clickjacking, MIME sniffing) |
| 2 | Input Sanitization | `express-mongo-sanitize` | Strips MongoDB operators (`$gt`, `$ne`, etc.) from request data to prevent NoSQL injection |
| 3 | Rate Limiting | `express-rate-limit` | Throttles requests to prevent brute-force and abuse |
| 4 | Global Error Handler | Built-in middleware | Catches unhandled errors and returns a safe response without leaking stack traces |

## Middleware Order

```
Request
  -> helmet()              # Security headers
  -> cors()                # CORS
  -> express.json()        # Body parser
  -> mongoSanitize()       # Strip NoSQL operators from req.body & req.params
  -> loginLimiter          # 10 req / 15 min on /api/auth/login
  -> apiLimiter            # 100 req / 15 min on /api
  -> Routes
  -> Error handler         # Catch-all for unhandled errors
Response
```

## Testing

Start the server first:

```bash
npm start
```

### 1. Helmet - Security Headers

```bash
curl -I http://localhost:5000/api/health
```

**Expected:** Response headers include:

```
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-xss-protection: 0
content-security-policy: default-src 'self'; ...
```

### 2. Input Sanitization - NoSQL Injection Prevention

**Without sanitization**, this payload would bypass authentication by matching any user where email is greater than empty string:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$gt": ""}, "password": "x"}'
```

**Expected:** The `$gt` operator is stripped from the request body before it reaches the route handler. Login fails normally with an authentication error, not a NoSQL bypass.

### 3. Rate Limiting

#### Login Rate Limit (10 requests per 15 minutes)

```bash
for i in $(seq 1 11); do
  echo "--- Attempt $i ---"
  curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}'
  echo
done
```

**Expected:**
- Attempts 1-10: Normal login failure response
- Attempt 11: HTTP 429 with `{"error":"Too many login attempts, please try again later"}`

#### General API Rate Limit (100 requests per 15 minutes)

```bash
for i in $(seq 1 101); do
  echo "--- Request $i ---"
  curl -s http://localhost:5000/api/health
  echo
done
```

**Expected:**
- Requests 1-100: Normal `{"status":"ok", ...}` response
- Request 101: HTTP 429 with `{"error":"Too many requests, please try again later"}`

### 4. Global Error Handler

Trigger an error by passing an invalid MongoDB ObjectId:

```bash
curl http://localhost:5000/api/events/notavalidmongoobjectid
```

**Expected:**
- Response: `{"error":"Something went wrong"}`
- No stack trace is leaked to the client
- Server logs the full error stack to the console for debugging
