(() => {
    "use strict";
    const assert = require('assert'),
        request = require('supertest'),
        server = require('../server.js')({ "debug": false, "port": 3001 });

    describe('Start server', () => {
        it('avvio il server sulla porta 3001', function(done) {
            server.start().done(done);
        });
    });

    describe('Login', () => {
        // non so se sto facendo bene
        // ma i test vengono skippati se il server non è attivo
        // e i test sono riportati come "pending"
        const agent = request(server.http);
        it('utente non autorizzato', function(done) {
            if (server.http.listening) {
                agent
                    .post('/login')
                    .send({ "uid": "fake", "password": "xxx" })
                    .expect(401, done);
            } else {
                this.skip();
            }
        });
        it('login con admin', function(done) {
            if (server.http.listening) {
                agent
                    .post('/login')
                    .send({ "uid": "admin", "password": "admin" })
                    .expect(200, done);
            } else {
                this.skip();
            }
        });
        it('sono chi dico di essere', function(done) {
            if (server.http.listening) {
                agent
                    .get('/whoami')
                    .set('X-chathub-uid', 'imemine')
                    .expect(200, {
                        "uid": "imemine",
                        "name": "imemine"
                    }, done);
            } else {
                this.skip();
            }
        });
    });
})();
