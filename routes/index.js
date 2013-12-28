
/*
 * GET home page.
 */

exports.index = function(req, res){
    if (req.session.authorized) {
        res.render('index', { title: 'Fesenko', user_name: req.session.username });
    } else {
        res.render('index', { title: 'Fesenko', user_name: undefined });
    }
};