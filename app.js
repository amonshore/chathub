/**
 * ChatHub v1.0 by narsenico
 */
const chalk = require('chalk'),
	dateformat = require('dateformat'),
	express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);
const PORT = 3001;

function log(...args) {
	console.log(chalk.gray(dateformat('HH:mm:ss.l')), ...args);
}

app.use((req, res, next) => {
	log(chalk.bgGreen(req.method), req.originalUrl);
	next();
});
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
	log('socket connected', socket.id);
});

http.listen(PORT, () => {
	log('listening on port', chalk.cyan(PORT))
});