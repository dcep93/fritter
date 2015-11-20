var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    var user = req.session['user'];
    var display = req.session['display'];
    var freetsdb = req.db.get('freets');
    freetsdb.find({},function(err,freets){

        // if a user is signed in, we need to know which freets he has favorited and which users he is following
        // otherwise, we will always display all freets and not give the option to favorite freets or follow users
        if(user){
            var userdb = req.db.get('users');
            userdb.find({"user":user.toLowerCase()},function(err,results){
                user_data = results[0];
                var follow_test = function(freet){return user_data.following[freet.user.toLowerCase()];}
                var favorites_test = function(freet){return user_data.favorites[freet._id];}
                if(display=="Only Following"){
                    var display_test = following_test;
                }
                else if(display=="Only Favorite"){
                    var display_test = favorites_test;
                }
                else{
                    var display_test = function(freet){return true;}
                }
                res.render('index',{'user':user,'display':display,'freets':freets,'display_test':display_test,'favorites_test':favorites_test,'follow_test':follow_test});
            });
        }


        else{
            var display_test = favorites_test = follow_test = function(freet){return true;}
            res.render('index',{'user':user,'display':display,'freets':freets,'display_test':display_test,'favorites_test':favorites_test,'follow_test':follow_test});
        }
    })
});


router.get('/clear', function(req, res) {
    // if logged in as the admin, this url will clear all users and freets
    // otherwise, logs the user out as punishment for trying to clear all data
    // useful for debugging, but causes heaps of problems if users are online when this is performed
    if(req.session['user']=='admin'){
        req.db.get('users').remove();
        req.db.get('freets').remove();
        res.redirect('../')
    }
    else{
        res.redirect('../logout');
    }
});


router.get('/logout', function(req, res) {
    delete req.session['user'];
    res.redirect('../');
});

router.post('/follow', function(req, res) {
    // follows an unfollowed user and unfollows a followed user
    var usersdb = req.db.get('users');
    var user = req.session['user'].toLowerCase();
    usersdb.find({"user":user},function(err,result){
        var following = result[0].following;
        var follow = req.body.follow.toLowerCase();
        following[follow] = !(following[follow]);
        usersdb.update({"user":user},{$set:{"following":following}});
        res.redirect('../');
    });
});

router.post('/favorites', function(req, res) {
    // favorites an unfavorited freet and unfavorites a favorited freet
    var usersdb = req.db.get('users');
    var user = req.session['user'].toLowerCase();
    usersdb.find({"user":user},function(err,result){
        var favorites = result[0].favorites;
        var _id = req.body._id;
        favorites[_id] = !(favorites[_id]);
        usersdb.update({"user":user},{$set:{"favorites":favorites}});
        res.redirect('../');
    });
});

router.post('/showAll', function(req,res) {
    // with no display in the session, displays all freets by default
    delete req.session['display'];
    res.redirect('../');
});

router.post('/showFollowing', function(req,res) {
    // sets the variable to only show freets from followed users
    req.session['display'] = "Only Following";
    res.redirect('../');
});

router.post('/showFavorites', function(req,res) {
    // sets the variable to only show favorited freets
    req.session['display'] = "Only Favorite";
    res.redirect('../');
});

router.get('/test', function(req,res) {
    res.render('test');
})

module.exports = router;