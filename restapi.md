REST API
========

### POST /login
* => { user, password }
* <= **200** { user, name }
* <= **403** forbidden

### PUT /users
* => { user, name, password }
* <= **200** { user, name }
* <= **400** user or password not valid, user already exists, name not valid

### GET /contacts
* <= **200** { contacts: [{ user, name }] }

### GET /chatrooms
* <= **200** { chatrooms: [{ rommid, descr, owner }] }

### PUT /chatrooms
* => { descr }
* <= **200** { roomid, descr, created }
* <= **400** descr not valid

### DELETE /chatrooms/:roomid
* <= **200** { roomid }
* <= **403** unauthorized
* <= **404** room not found

### GET /chatrooms/:roomid/messages?from=:date&max=:max
* <= **200** { roomid, from, count, messages: [{ messageid, author, date, content }] }
* <= **403** unauthorized
* <= **404** room not found

### PUT /chatrooms/:roomid/messages
* => { content }
* <= **200** { messageid, author, date, content }
* <= **403** unauthorized
* <= **404** room not found

### DELETE /chatrooms/:roomid/messages/:messageid
* <= **200** { messageid }
* <= **403** unauthorized
* <= **404** room not found