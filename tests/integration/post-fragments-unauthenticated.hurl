# post-fragments-unauthenticated.hurl
# Unauthenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
`This is an unauthenticated fragment!`

# 1. We expect to get back an HTTP 401 Unauthorized error
HTTP/1.1 401
# We have various assertions about the response that we want to check
[Asserts]
# The error status should be "error"
jsonpath "$.status" == "error"
# The error message should indicate that authentication is required
jsonpath "$.error.message" contains "Unauthorized"
