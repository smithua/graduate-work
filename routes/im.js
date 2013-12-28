var mongo = require('./../node_modules/monk')('localhost/fesenko');
var usersDb = mongo.get('users');
var dialogsDb = mongo.get('dialogs');


IM = {
    express: {},
    username: undefined,
    user_id: undefined,
    init: function (request, response) {
        this.express = {request: request, response: response};
        if (this.express.request.session.authorized && this.express.request.session.username) {
            this.user_id = this.express.request.session.user_id;
            this.username = this.express.request.session.username;

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

            IM.express.response.render('im', {title: 'Dialogs!', error: 'dialogs_not_found'});
        });
    },
    getDialog: function(user_id) {
        usersDb.find({_id: usersDb.id(user_id)}, function(err, int) {
            if (err) throw err;
            if (int.length) {
                IM.express.response.render('im', {title: 'Dialogs', error: null, io: require('os').hostname()});
                //request.headers
            } else {
                IM.express.response.render('im', {title: 'Dialogs!', error: 'int_not_found'});
            }
        });
    }
};

exports.buildsDialogs = function(request, response) {
    if (request.session.authorized) {
        IM.init(request, response);
        //response.render('im', {title: 'Dialogs!', error: null});
    } else {
        response.redirect('/users/login');
        response.end();
    }
};

exports.createNew = function(request, response) {
    usersDb.find({_id: {$nin: [usersDb.id(request.session.user_id)]}}, function(err, users) {
        if (err) throw err;
        if (users.length) {
            response.render('selectnewuser', {title: 'Select User', users: users});
        } else {
            response.render('selectnewuser', {title: 'Select User', users: null});
        }
    });
};