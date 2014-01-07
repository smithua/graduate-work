/**
 * Created by arsdj on 12.12.13.
 */
var passHash = require('./../../node_modules/password-hash');
var mongo = require('./../../node_modules/monk')('localhost/fesenko');
var usersDb = mongo.get('users');

var login = function(data, request, cl) {
    request.session.authorized = true;
    request.session.username = data.user_name;
    request.session.user_id = data._id;
    cl();
};

exports.auth = function(req, res){
    res.render('user/auth', { title: 'Login' });
};

exports.processPost = function(request, response) {
    usersDb.find({user_name: request.body.login}, function(err, user) {
        if (err) throw err;
        if (user.length) {
            login(user[0], request, function(){
                response.redirect('/dialogs');
                response.end();
            });
        } else {
            request.session.sendFromLogin = true;
            response.redirect('/users/register');
            response.end();
        }
    });
};

exports.logOut = function(request, response) {
    request.session.authorized = false;
    delete request.session.username;
    delete request.session.user_id;

    response.redirect('/');
    response.end();
};

exports.login = login;