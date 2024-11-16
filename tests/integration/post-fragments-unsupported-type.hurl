# post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments with unsupported Content-Type
POST http://localhost:8080/v1/fragments
# We're sending a payload with an unsupported Content-Type (e.g., application/xml)
Content-Type: application/xml
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`<xml>This is an unsupported fragment!</xml>`

# 1. We expect to get back an HTTP 415 Unsupported Media Type error
HTTP/1.1 415
# We have various assertions about the response that we want to check
[Asserts]
# The error status should be "error"
jsonpath "$.status" == "error"
# The error message should indicate that the media type is not supported
jsonpath "$.error.message" contains "Unsupported content type application/xml"
