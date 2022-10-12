# Chat App

Chat application API

Goals: 
* Users can create accounts and send private message to each other.
* Users can have multiple chats with multiple different users.
* Realtime (socket.io?)

Express, MongoDB

# /user

## POST

Given a unique username and a password user can create a new account.

If successful, responds with a JWT.

### Body

`username` (required) Name for user account and what other users see as name

`password` (required) Password for logging in

# /login

## POST

Supply username and password in request body to log into account.

If successful, responds with a JWT.

### Body

`username` (required) Name for user account and what other users see as name

`password` (required) Password for logging in