"use strict";
/**
 * ChatHub v1.0 by narsenico
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
    db = require('./controllers/db.js'),
    Ut = require('./controllers/utility.js');
const PORT = 3001;

// registro i file .mustache perche' vengano renderizzati con mustacheExpress
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/public/views');
// disabilito la cache delle viste, da riabilitare in produzione
app.disable('view cache');
// log request
app.use((req, res, next) => {
    Ut.log(chalk.bgGreen(req.method), req.originalUrl);
    next();
});
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
// restituisce l'indicazione dell'utente in sessione
app.get('/whoami', (req, res) => {
    if (req.session.logged) {
        res.json(_.pick(req.session.user, ['uid', 'name']));
    } else {
        res.status(404).send('Not found');
    }
});
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
// router
app.use('/users', require('./controllers/restusers.js'));

// io.on('connection', (socket) => {
//  log('socket connected', socket.id);
// });

db.init().then(() => {
    http.listen(PORT, () => {
        Ut.log('server listening on port', chalk.cyan(PORT))
    });
}).catch(err => {
    console.error(err);
});
