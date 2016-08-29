"use strict";
const chalk = require('chalk'),
    dateformat = require('dateformat');

module.exports = {
    log: (...args) => {
        console.log(chalk.gray(dateformat('HH:mm:ss.l')), ...args);
    },

    /**
     * Descrizione errori
     */
    errors: {
        1001: "ValidationError",
        11000: "Duplicate key"
    },
    
    /**
     * Elabora un errore restituito dal DB e ne restuituisce 
     * una versione edulcorata da informazioni non sicure.
     *
     * @param      {Object}  err     l'errore
     * @return     {Object}  ritorna un oggetto con il solo codice errore e la descrizione
     */
    parseError: function(err) {
        if (err.code) {
            return { "code": err.code, "descr": this.errors[err.code] || "Generic error" };
        } else if (err.name === 'ValidationError') {
            return {
                "code": 1001,
                "descr": this.errors[1001],
                "message": Object.keys(err.errors).map((key) => {
                    return err.errors[key].message;
                }).join(', ')
            };
        }
    },

    checkSession: (req, res, next) => {
        const uid = req.get('X-chathub-uid');
        if (uid) {
            req.session.logged = true;
            req.session.user = {
                "uid": uid,
                "name": uid,
                "role": +req.get('X-chathub-role') || 0,
                "fake": true
            };
            next();
        } else if (!req.session.logged) {
            res.status(401).send('Not authorized');
        } else {
            next();
        }
    }
}
