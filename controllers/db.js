"use strict";
/**
 * Interfaccia verso il db, definizione schema delle collection.
 * Richiamare db.init() per inizializzare il db, ritorna una promise
 */
const chalk = require('chalk'),
    Q = require('q'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Ut = require('./utility.js');

const DB_URL = 'mongodb://localhost:27017/chathub';

// schema utente
const User = mongoose.model('User', new Schema({
    // codice univoco (usato per la login, min 3)
    uid: { type: String, match: /[a-zA-Z0-9\.]{3,}/, index: { unique: true } },
    // nome di presentazione (min 3)
    name: { type: String, match: /\w{3,}/, required: true },
    // password (min 8)
    // TODO: criptare la password
    password: { type: String, match: /\w{8,}/, required: true },
    // immagine utente, encoding base64
    avatar: String,
    // ruolo dell'utente, 0 utente normale, 1 per amministratore
    role: { type: Number, default: 0 }
}));

// uso Q come promises per mongoose
mongoose.Promise = Q.Promise;

module.exports = {
    /**
     * Ruoli utente
     */
    roles: {
    	DEFAULT: 0,
    	ADMIN: 1
    },

    /**
     * Inizializza il db.
     *
     * @return     {Promise}  promise
     */
    init: function() {
        return mongoose.connect(DB_URL)
            .then(() => {
                Ut.log('mongodb connected on', chalk.green(DB_URL));
                // creo l'utente admin se non esiste
                return User.findOne({ "uid": "admin" }).exec()
                    .then((doc) => {
                        if (!doc) {
                            return this.addUser({
                                "uid": "admin",
                                "password": "admin",
                                "name": "Administrator",
                                "role": 1
                            });
                        }
                    });
            });
    },

    /**
     * Elimina l'intero database.
     *
     * @return     {Promise}  promise
     */
    dropDatabase: function() {
        return mongoose.connection.db.dropDatabase();
    },

    /**
     * Aggiunge un utente nuovo.
     *
     * @param      {User}  user    l'utente da aggiungere
     * @return     {Promise}    nella promise viene ritornato l'utente aggiunto
     */
    addUser: function(user) {
        return new User(user).save();
    },

    /**
     * Modfifica un utente esistente. 
     * L'uid non può essere modificato.
     *
     * @param      {String} uid l'uid dell'utente da modificare
     * @param      {User}  user    l'utente modificato
     * @return     {Promise}  nella promise viene ritornato l'utente modificato
     */
    updateUser: function(uid, user) {
        const update = Object.assign({}, user);
        delete update.uid;
        return User.findOneAndUpdate({ "uid": uid }, update, { select: '-password' }).exec();
    },

    /**
     * Rimuove un utente.
     *
     * @param      {String}  uid     l'uid dell'utente da rimuovere
     * @return     {Promise}  nella promise viene ritornato l'utente rimosso
     */
    removeUser: function(uid) {
        return User.findOneAndRemove({ "uid": uid }, { select: '-password' }).exec();
    },

    /**
     * Verifica l'esistenza di un utente.
     *
     * @param      {String}  uid        l'uid dell'utente
     * @param      {String}  password  la password dell'utente
     * @return     {Promise}  nella promise viene ritornato l'utente trovato
     */
    checkUser: function(uid, password) {
        return User.findOne({ "uid": uid, "password": password }).exec();
    },

    /**
     * Ritorna l'utente in bas al suo uid.
     *
     * @param      {String}  uid     l'uid dell'utente da cercare.
     * @return     {Promise}  promise
     */
    getUser: function(uid) {
        return User.findOne({ "uid": uid }, '-password').exec();
    },

    /**
     * Ritorna tutti gli utenti.
     *
     * @return     {Promise}  promise
     */
    getUsers: function() {
        return User.find({}, '-password').exec();
    },

    /**
     * Verifica se "user" possiede il ruolo indicato da "role".
     *
     * @param      {User}   user    l'utente
     * @param      {Number}   role    il ruolo (vedi roles)
     * @return     {boolean}  true se lo possiede, false altrimenti
     */
    hasRole: function(user, role) {
    	return user && ((user.role & role) === role);
    },

    /**
     * Determina se l'utente individuato da "uid" corrisponde a "user" oppure
     * "user" è un amministratore.
     *
     * @param      {String}   uid     identificativo utente
     * @param      {User}     user    User da confrontare con "uid"
     * @return     {boolean}  true se "user" ha un ruolo da amministratore
     *                        oppure corrisponde a "uid", false altrimenti
     */
    isMeOrAdmin: function(uid, user) {
    	return (uid === user.uid || (user.role & this.roles.ADMIN) === this.roles.ADMIN);
    }
};
