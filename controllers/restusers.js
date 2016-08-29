"use strict";
/**
 * Router per la gestione utenti
 */
const express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    db = require('./db.js'),
    Ut = require('./utility.js');

/**
 * Aggiunge un utente.
 * body { uid, name, password, avatar, role }
 */
router.put('/', (req, res) => {
    if (req.body.role !== undefined && !db.hasRole(req.session.user, db.roles.ADMIN)) {
        // solo l'amministratore può creare un utente amministratore
        res.status(403).send('Not authorized: only an administrator can change the role');
    } else {
        db.addUser(req.body)
            .then((user) => {
                res.json(_.pick(user, ['uid', 'name']));
            })
            .catch((err) => {
                console.error(err);
                res.status(400).json(Ut.parseError(err));
            });
    }
});

/**
 * Modifica un utente.
 * body { name, password, avatar, role }
 */
router.post('/:uid', Ut.checkSession, (req, res) => {
    if (!db.isMeOrAdmin(req.params.uid, req.session.user)) {
        // è permesso solo all'amministratore o l'utente stesso
        res.status(403).send('Not authorized');
    } else if (req.body.role !== undefined && !db.hasRole(req.session.user, db.roles.ADMIN)) {
        // solo l'amministratore può modificare il ruolo
        res.status(403).send('Not authorized: only an administrator can change the role');
    } else {
        db.updateUser(req.params.uid, req.body)
            .then((user) => {
                // TODO user è quello precedente alla modfica
                if (user) {
                    res.json(_.pick(user, ['uid', 'name']));
                } else {
                    res.status(404).send('Not found');
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(400).json(Ut.parseError(err));
            });
    }
});

/**
 * Rimuove un utente.
 */
router.delete('/:uid', Ut.checkSession, (req, res) => {
    if (!db.isMeOrAdmin(req.params.uid, req.session.user)) {
        // è permesso solo all'amministratore o l'utente stesso
        res.status(403).send('Not authorized');
    } else {
        db.removeUser(req.params.uid, req.body)
            .then((user) => {
                if (user) {
                    res.json(_.pick(user, ['uid', 'name']));
                } else {
                    res.status(404).send('Not found');
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(400).json(Ut.parseError(err));
            });
    }
});

/**
 * Restituisce tutti gli utenti.
 */
router.get('/', Ut.checkSession, (req, res) => {
    if (!db.hasRole(req.session.user, db.roles.ADMIN)) {
        // è permesso solo all'amministratore
        res.status(403).send('Not authorized');
    } else {
        return db.getUsers()
            .then((users) => {
                res.json((users || []).map(user => _.pick(user, ['uid', 'name', 'role'])));
            })
            .catch((err) => {
                console.error(err);
                res.status(400).json(Ut.parseError(err));
            });
    }
})

module.exports = router;
