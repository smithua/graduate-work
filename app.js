
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var users = require('./routes/users');
var im = require('./routes/im');
var http = require('http');
var path = require('path');

var MongoSessionStore = require('express-session-mongo')
    , session_storage = new MongoSessionStore({db: 'fesenko'})
    , cookie = require('cookie');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.cookieParser('KHjLxmkFB3VyKkPSmaLnUB75vA4aZDAF'));
app.use(express.session({
    store: session_storage,
    secret: 'KHjLxmkFB3VyKkPSmaLnUB75vA4aZDAF',
    key: 'sid'
}));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
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
app.get('/logout', users.userAuth.logOut);
app.get('/clear', im.removeAll)

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);
io.configure( function() {
    io.set('log level', 1);

    // Аутентификация пользователей
    io.set('authorization', function (data, accept) {
        // Проверяем переданы ли cookie
        if (!data.headers.cookie)
            return accept('No cookie transmitted.', false);

        // Парсим cookie
        data.cookie = cookie.parse(data.headers.cookie);

        // Получаем идентификатор сессии
        var sid = data.cookie['sid'];

        if (!sid) {
            accept(null, false);
        }

        sid = sid.substr(2).split('.');
        sid = sid[0];
        data.sessionID = sid;

        // Добавляем метод для чтения сессии
        // в handshakeData
        data.getSession = function(cb) {
            // Запрашиваем сессию из хранилища
            session_storage.get(sid, function(err, session) {
                if (err || !session) {
                    console.log(err);
                    accept(err, false);
                    return;
                }
                cb(err, session);
            });
        }
        accept(null, true);
    });
});

io.sockets.on('connection', function (socket) {
    im.IM.parentSocket = io.sockets;
    im.IM.setConnection(socket);
    setInterval(function() {
        io.sockets.socket(socket.id).emit('events', {fn: 'refreshOnline', message: im.IM.userInfo});//console.log(socket.id);
    }, 2000);
    socket.on('events', function(post) {
        socket.handshake.getSession(function(err, session) {
            post['data']['session'] = session;
            im.IM[post.fn](post.data);
        });
    });

    socket.on('disconnect', function () {
        socket.handshake.getSession(function(err, session) {
            if (im.IM.connectedUsers[session._sessionid] !== undefined) {
                im.IM.connectedUsers[session._sessionid].forEach(function(sock, index) {
                    if (sock == socket.id) {
                        im.IM.connectedUsers[session._sessionid].splice(index, 1);
                    }
                });
            }

            if (im.IM.inDialog[session._sessionid] !== undefined) {
                delete im.IM.inDialog[session._sessionid];
            }
        });
    });
});
