var mongo = require('./../node_modules/monk')('localhost/fesenko');
var usersDb = mongo.get('users');
var dialogsDb = mongo.get('dialogs');
var messagesDb = mongo.get('messages');

exports.IM = IM = {
    title: 'Dialogs',
    express: {},
    username: undefined,
    user_id: undefined,
    parentSocket: undefined,
    connectedUsers: {},
    init: function (request, response) {
        this.express = {request: request, response: response};
        if (this.express.request.session.authorized && this.express.request.session.username) {
            this.user_id = this.express.request.session.user_id;
            this.username = this.express.request.session.username;

            //this.connectedUsers[]
            if (this.express.request.params.id) {
                this.getDialog(this.express.request.params.id);
            } else {
                this.buildDialogs();
            }
        }
    },
    buildDialogs: function() {
        dialogsDb.find({$or: [{first_user: dialogsDb.id(this.user_id)}, {second_user: dialogsDb.id(this.user_id)}]}, function(err, dialogs) {
            if (err) throw err;

            IM.express.response.render('im', {title: IM.title, io: require('os').hostname(), error: 'dialogs_not_found'});
        });
    },
    getDialog: function(user_id) {
        dialogsDb.find({_id: dialogsDb.id(user_id)}, function(err, int) {
            if (err) throw err;
            if (int.length) {
                messagesDb.find({dialog_id: dialogsDb.id(int[0]._id)}, function(err, messages) {
                    if (err) throw err;
                    if (messages.length) {

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
    },
    addMessage: function(post) {
        messagesDb.insert({text: post.messages, timestamp: new Date().getTime(), dialog_id: dialogsDb.id(post._id)}, function(err, inst) {

        });
    }
};

exports.buildsDialogs = function(request, response) {
    if (request.session.authorized) {
        IM.init(request, response);
        //response.render('im', {title: IM.title, error: null});
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