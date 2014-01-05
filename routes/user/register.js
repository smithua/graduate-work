/**
 * Created by arsdj on 12.12.13.
 */
var passHash = require('./../../node_modules/password-hash');
var mongo = require('./../../node_modules/monk')('localhost/fesenko');
var usersDb = mongo.get('users');
var auth = require('./auth');

exports.register = function(req, res){
    if (req.session.sendFromLogin) {
        res.render('user/register', { title: 'Register', sendFromLogin: true });
        delete req.session.sendFromLogin;
    } else {
        res.render('user/register', { title: 'Register', sendFromLogin: false });
    }
};

var createNewUser = function(data, cl) {
    usersDb.insert({user_name: data.user_name, password: passHash.generate(data.password)}, function(err, inserted) {
        if (err) throw err;
        if (undefined !== cl) {
            cl(inserted);
        }
    });
};

exports.processPost = function(request, response) {
    usersDb.find({user_name: request.body.login}, function(err, user) {
        if (err) throw err;
        if (user.length) {
            if (passHash.verify(request.body.password, user[0].password)) {
                auth.login(user[0], request, function() {
                    response.redirect('/dialogs');
                    response.end();
                });
            } else {
                response.render('user/register', { title: 'Register', sendFromLogin: true });
            }
        } else {
            createNewUser({user_name: request.body.login, password: request.body.password}, function (inserted) {
                request.session.authorized = true;
                request.session.username = inserted.user_name;
                request.session.user_id = inserted._id;
                response.redirect('/dialogs');
                response.end();
            });
        }
    });
};