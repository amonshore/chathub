(() => {
    "use strict";
    /**
     * Crea il server http e inizializza il database.
     * Uso: require('./server.js')(options).start();
     * ritorna una promise
     */
    const chalk = require('chalk'),
        bodyParser = require('body-parser'),
        mustacheExpress = require('mustache-express'),
        session = require('express-session'),
        express = require('express'),
        app = express(),
        http = require('http').Server(app),
        io = require('socket.io')(http),
        _ = require('lodash'),
        Q = require('Q'),
        db = require('./controllers/db.js'),
        Ut = require('./controllers/utility.js');

    const defaultOptions = {
        "debug": false,
        "dburl": "mongodb://localhost:27017/chathub",
        "port": 3001
    }

    module.exports = (options) => {
        options = _.extend(defaultOptions, options);

        // registro i file .mustache perche' vengano renderizzati con mustacheExpress
        app.engine('mustache', mustacheExpress());
        app.set('view engine', 'mustache');
        app.set('views', __dirname + '/public/views');
        // disabilito la cache delle viste, da riabilitare in produzione
        app.disable('view cache');
        // log request
        if (options.debug) {
            app.use((req, res, next) => {
                Ut.log(chalk.bgGreen(req.method), req.originalUrl);
                next();
            });
        }
        // parsing application/json
        app.use(bodyParser.json());
        // parsing application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        // intercetto gli errori, cercando di impedire la divulgazione di troppi dettagli sull'applicazione
        //  (vedi errore di sintassi JSON)
        app.use((err, req, res, next) => {
            if (err && err instanceof SyntaxError && /Unexpected token.*JSON/.test(err.toString())) {
                // invio solo il messaggio di errore senza lo stack
                res.status(500).send(err.toString());
            } else {
                next(err);
            }
        });
        // file statici
        app.use(express.static(__dirname + '/public'));
        // sessione
        app.use(session({
            secret: 'chatme koala',
            resave: false,
            saveUninitialized: true
        }));
        // login
        app.post('/login', (req, res) => {
            db.checkUser(req.body.uid, req.body.password)
                .then((user) => {
                    if (user) {
                        req.session.logged = true;
                        req.session.user = user;
                        res.json(_.pick(user, ['uid', 'name']));
                    } else {
                        req.session.destroy((err) => {
                            if (err) {
                                console.log(err);
                            }
                            res.status(401).send('Not authorized');
                        });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    res.status(400).json(db.parseError(err));
                });
        });
        // restituisce l'indicazione dell'utente in sessione
        app.get('/whoami', Ut.checkSession, (req, res) => {
            if (req.session.logged) {
                res.json(_.pick(req.session.user, ['uid', 'name']));
            } else {
                res.status(404).send('Not found');
            }
        });
        // routers
        app.use('/users', require('./controllers/restusers.js'));

        return {
            "http": http,
            "db": db,
            /**
             * Avvia il server.
             *
             * @return     {Promise}  una promessa
             */
            "start": function() {
                return db.init(options.dburl).then(() => {
                    return Q.nfbind(http.listen.bind(http))(options.port).then(() => {
                        Ut.log('server listening on port', chalk.cyan(options.port))
                    });
                }).catch(err => {
                    console.error(err);
                });
            }
        }
    };
})();
