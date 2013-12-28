
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var users = require('./routes/users');
var im = require('./routes/im');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('Fesenko'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users/login', users.userAuth.auth);
app.post('/users/login', users.userAuth.processPost);
app.get('/users/register', users.register.register);
app.post('/users/register', users.register.processPost);
app.get('/dialogs', im.buildsDialogs);
app.get('/dialogs/new', im.createNew);
app.get('/dialogs/:id', im.buildsDialogs);

var io = require('socket.io').listen((app.get('port') + 1));
io.sockets.on('connection', function (socket) {
    console.log(socket);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
