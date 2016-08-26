REST API
========

### POST /login
esegue la login utente, valida la sessione
* => { uid, password }
* <= **200** { uid, name }
* <= **403** non autorizzato

### PUT /users
crea un nuovo utente
* => { uid, name, password }
* <= **200** { uid, name, avatar }
* <= **400** uid o password non validi, uid già esistente, nome non valido

### POST /users/:uid
modifica un utente esistente, i parametri non inviati non verranno modificati, per eliminare l'avatar inviare { avatar: null }
* => { name, password, avatar }
* <= **200** { uid, name }
* <= **403** non autorizzato, l'utente non è amministratore e non è :uid
* <= **404** utente non trovato

### GET /users/:uid/avatar
restituisce l'avatar dell'utente, immagine codificata con base64
* <= **200** { avatar }
* <= **404** utente non trovato

### GET /contacts
restituisce l'elenco dei contatti dell'utente in sessione (per ora tutti gli utenti)
* <= **200** { contacts: [{ uid, name }] }

### GET /chatrooms
restituisce le chatroom a cui l'utente in sessione è iscritto
* <= **200** { chatrooms: [{ rommid, descr, owner, users: [{ uid, name }] }] }

### PUT /chatrooms
crea una nuova chatroom
* => { descr, users: [uid] }
* <= **200** { rommid, descr, owner, users: [{ uid, name }] }
* <= **400** descr non valida

### POST /chatrooms/:roomid
modifica una chatroom
* => { descr, users: [uid] }
* <= **200** { rommid, descr, owner, users: [{ uid, name }] }
* <= **403** non autorizzato, solo l'amministratore o il proprietario della chatroom possono farlo
* <= **404** room non trovata
* <= **400** descr non valida

### DELETE /chatrooms/:roomid
rimuove una chatroom
* <= **200** { roomid }
* <= **403** non autorizzato, solo l'amministratore o il proprietario della chatroom possono farlo
* <= **404** room non trovata

### PUT /chatrooms/:roomid/users
aggiunge uno o più utenti alla chatroom
* => { users: [uid] }
* <= **200** { rommid, descr, owner, users: [{ uid, name }] }
* <= **403** non autorizzato, solo l'amministratore o il proprietario della chatroom possono farlo
* <= **404** room non trovata

### DELETE /chatrooms/:roomid/users/:uid
rimuove un utente dalla chatroom
* <= **200** { rommid, descr, owner, users: [{ uid, name }] }
* <= **403** non autorizzato, solo l'amministratore o il proprietario della chatroom possono farlo
* <= **404** room non trovata, utente non trovato

### GET /chatrooms/:roomid/messages?from=:date&max=:max
restituisce gli ultimi messaggi (per un massimo di :max) da una certa data :from (RFC2822 o ISO 8601)
* <= **200** { roomid, from, count, messages: [{ messageid, author, date, content }] }
* <= **403** non autorizzato, l'utente non è iscritto alla chatroom
* <= **404** chatroom non trovata

### PUT /chatrooms/:roomid/messages
invia un messaggio alla chatroom
* => { content }
* <= **200** { messageid, author, date, content }
* <= **403** non autorizzato, l'utente non è iscritto alla chatroom
* <= **404** chatroom non trovata

### DELETE /chatrooms/:roomid/messages/:messageid
elimina un messaggio dalla chatroom, il messaggio non verrà eliminato fisicamente ma verrà modificato il contenuto in "messaggio eliminato da XXX"
* <= **200** { messageid, author, date, content }
* <= **403** non autorizzato, l'utente non è amministratore o non è l'autore del messaggio
* <= **404** chatroom non trovata