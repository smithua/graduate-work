var mongo = require('./../node_modules/monk')('localhost/fesenko');
var usersDb = mongo.get('users');
var dialogsDb = mongo.get('dialogs');
var messagesDb = mongo.get('messages');

exports.IM = IM = {
    title: 'Dialogs',
    express: {},
    parentSocket: undefined,
    socket: undefined,
    connectedUsers: {},
    inDialog: [],
    init: function (request, response) {
        this.express = {request: request, response: response};
        if (this.express.request.session.authorized ) {
            if (this.express.request.params.id) {
                this.getDialog(request);
            } else {
                this.buildDialogs();
            }
        }
    },
    setConnection: function (socket) {
        this.socket = socket;
        this.socket.handshake.getSession(function(err, session) {
            if (IM.connectedUsers[session._sessionid] === undefined) {
                IM.connectedUsers[session._sessionid] = [];
            }

            IM.connectedUsers[session._sessionid].push(IM.socket.id);
        });
    },
    buildDialogs: function() {
        dialogsDb.find({}, function(err, dialogs) {
            if (err) throw err;
            if (dialogs.length) {
                IM.express.response.render('im', {
                    title: IM.title,
                    io: require('os').hostname(),
                    error: 'dialogs',
                    dialogs: dialogs
                });
            } else {
                IM.express.response.render('im', {
                    title: IM.title,
                    io: require('os').hostname(),
                    error: 'dialogs_not_found',
                    dialogs: 0
                });
            }
        });
    },
    getDialog: function(request) {
        dialogsDb.find({_id: dialogsDb.id(request.params.id)}, function(err, int) {
            if (err) throw err;
            if (int.length) {
                messagesDb.find({dialog_id: dialogsDb.id(int[0]._id)}, function(err, messages) {
                    if (err) throw err;
                    if (messages.length) {
                        IM.express.response.render('im', {
                            title: 'Dialogs',
                            io: require('os').hostname(),
                            error: 'dialog',
                            dialog: int[0],
                            messages: messages
                        });
                    } else {
                        IM.express.response.render('im', {
                            title: 'Dialogs',
                            io: require('os').hostname(),
                            error: 'dialog',
                            dialog: int[0],
                            messages: 0
                        });
                    }
                });
            } else {
                IM.express.response.render('im', {
                    title: IM.title,
                    io: require('os').hostname(),
                    error: 'dialog'
                });
            }
        });

        Array.prototype.contains = function(k, callback) {
            var self = this;
            return (function check(i) {
                if (i >= self.length) {
                    return callback(false);
                }

                if (self[i] === k) {
                    return callback(true);
                }

                return process.nextTick(check.bind(null, i+1));
            }(0));
        }

        this.inDialog.contains(request.session._sessionid, function(found) {
            if (!found) {
                IM.inDialog.push(request.session._sessionid);
            }
        });

        IM.inDialog.forEach(function(row, index) {
            IM.connectedUsers[row].forEach(function(sock, index) {
                //IM.parentSocket.socket(sock).emit('events', {fn: 'refreshOnline', message: inst});
                console.log(sock);
            });
        });
    },
    addMessage: function(post) {
        messagesDb.insert({text: post.message, owner: post.session.user_id, timestamp: new Date().getTime(), dialog_id: dialogsDb.id(post._id)}, function(err, inst) {
            if (err) throw err;

            IM.inDialog.forEach(function(row, index) {
                IM.connectedUsers[row].forEach(function(sock, index) {
                    IM.parentSocket.socket(sock).emit('events', {fn: 'addMessage', message: inst});
                });
            });
        });
    }
};

exports.buildsDialogs = function(request, response) {
    if (request.session.authorized) {
        IM.init(request, response);
    } else {
        response.redirect('/users/login');
        response.end();
    }
};

exports.createNew = function(request, response) {
    dialogsDb.insert({timestamp: new Date().getTime()}, function (err, dialog) {
        if (err) throw err;
        response.redirect('/dialogs/' + dialog._id);
        response.end();
    });
};