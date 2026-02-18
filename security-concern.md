Security Concerns
1. No error handler middleware — if something unexpected crashes, the server sends raw error details to the client.
2. No input sanitization — vulnerable to NoSQL injection. Someone could send {"username": {"$gt": ""}} and bypass login.
3. No rate limiting — someone could spam your login endpoint with thousands of requests trying to guess passwords.
4. No helmet — missing security headers that protect against clickjacking, XSS, etc.
Quick Wins Worth Adding
Let me know which ones you want — I'd recommend all four since they're quick to add:These are all things the evaluator would notice and give you points for under "scalability of implementation."
