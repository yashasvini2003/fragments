# Step 1: Create a New Text Fragment
# We are sending an authenticated POST request to create a new text fragment with the body "Hello S3!"
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
# Include HTTP Basic Auth credentials for the authorized user (user1@email.com)
[BasicAuth]
user1@email.com:password1

# The body of the request contains the text fragment "Hello S3!"
`Hello S3!`

# Step 2: Capture the Location Header
# After creating the fragment in Step 1, we capture the "Location" header value from the server's response and store it in a variable named "url."
HTTP/1.1 201
[Captures]
url: header "Location"

# Step 3: Retrieve the Created Fragment
# Now, we send an authenticated GET request using the captured URL to retrieve the previously created fragment.
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Step 4: Verify the Fragment Content
# We confirm that the server responds with a status code 200, the content type is "text/plain," and the body of the fragment is "Hello S3!"
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello S3!"

# Step 5: Delete the Fragment
# We send an authenticated DELETE request using the captured URL to delete the fragment.
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Step 6: Confirm Deletion
# We confirm that the server responds with a status code 200 after successfully deleting the fragment.
HTTP/1.1 200

# Step 7: Attempt to Retrieve the Deleted Fragment
# Now, we send another authenticated GET request using the same URL to try to retrieve the deleted fragment.
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Step 8: Verify Deletion
# We verify that the server responds with a status code 404, indicating that the fragment is no longer available (since it has been deleted).
HTTP/1.1 404
