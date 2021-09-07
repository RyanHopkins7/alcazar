# Alcazar: The greatest password-less password manager ever concieved

For this mockup, there are three priorities

1. Speed
2. Security
3. Beauty

## Authentication

### Current schema
* NeDB stores a session ID with expiration time set 15 minutes after Authentication
* Session ID will also be stored on the renderer while vault is open
* Each IPC request requiring authentication will include the session ID 
* The timestamp of the request will be compared to the expiration time
* If the session ID has expried, require new authenticaion
* New authentication will override the NeDB entry for the session ID
* If the session ID is valid, allow the request

#### Vulnerabilities
* Attackers could peek into a currently open vault since authentication timeout only occurs on a new database query
* Attacker could modify the database file to fabricate a valid session
* Bruteforce attack

#### TODO

* Trigger timeout to automatically lock vault on session expiration
* Encrypt database and use hash code validation to ensure data integrity (TPM)
* Enable rate limiting (TPM)

