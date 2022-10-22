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

# /chat

All paths here are protected and require authorization token.

## GET

View all chats for logged in user.

If successful, responds with json object containing a list of all the users available chats and with whom they are with.

## POST

Create a new chat with another user.

If successful, responds with json object containing ID for the chat. ID is used in path for that chat eg. `/chat/:chatid`.

If a chat already exists with requested user then an error stating so is returned.

### Body

`username` (required) Name of account to create a new chat with.

# /chat/:chatid

Path for a specific chat with another user.

## GET

Responds with json object containing all messages in chronological order

## POST

Send new message in chat

### Body

`message` (required) Content of message to send in chat

## DELETE

Removes requesting user from the chat.

If all users leave then all messages and the chat are deleted.
