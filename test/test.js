"use strict";
const assert = require('assert'),
    request = require('supertest'),
    http = require('../app.js');

describe('Login', () => {
    const agent = request(http);
    it('utente non autorizzato', (done) => {
        agent
            .post('/login')
            .send({ "uid": "fake", "password": "xxx" })
            .expect(401, done);
    });
    it('login con admin', (done) => {
        agent
            .post('/login')
            .send({ "uid": "admin", "password": "admin" })
            .expect(200, done);
    });
    it('sono chi dico di essere', (done) => {
        agent
            .get('/whoami')
            .set('X-chathub-uid', 'imemine')
            .expect(200, {
                "uid": "imemine",
                "name": "imemine"
            }, done);
    });
});
