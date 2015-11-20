var express = require('express');
var router = express.Router();


// hashes the password for the user's security
// currently doesn't modify the provided password, so passwords are stored in plaintext until a hash function is created
var hash = function(string){return string;}


router.get('/', function(req, res) {
  // if there is a message in the session, display it, then delete it
  var message = req.session['login_message'];
  delete req.session['login_message'];
  res.render('login', {'message':message});
});


router.post('/login', function(req,res, next){
  var user = req.body.login_user;
  var password = req.body.login_password;

  // regardless of the provided password, anyone can sign into the admin account, for now
  if(user=="admin"){
    req.session['user'] = "admin";
    res.redirect("/");
  }

  else{
    var users = req.db.get('users');
    users.find({"user":user.toLowerCase()},function(err,result){
      // if no users in the database match the provided username
      if(!result.length){
        req.session['login_message'] = "Username " + user + " does not exist.";
        res.redirect("./");
      }
      // wrong password
      else if(result[0]["password"] != hash(password)){
        req.session['login_message'] = "Incorrect password";
        res.redirect("./");
      }
      // login successful, sign in
      else{
        req.session['user'] = user;
        res.redirect("/");
      }
    })
  }
});


router.post('/register', function(req, res, next) {
  var user = req.body.register_user;
  var password = req.body.register_password;
  var password_confirm = req.body.register_password_confirm;
  // if provided username is the empty string
  if(!user){
    req.session['login_message'] = "You need to have a username";
    res.redirect("./");
  }
  // if a protected username is provided
  else if(user.toLowerCase()=="guest" || user.toLowerCase()=="admin"){
    req.session['login_message'] = user + " cannot be a username";
    res.redirect("./");
  }
  else if(password.length<4){
    req.session['login_message'] = "Passwords must be at least 4 characters long";
    res.redirect("./");
  }
  else if(password != password_confirm){
    req.session['login_message']   = "Passwords do not match";
    res.redirect("./");
  }
  else{
    var users = req.db.get('users');
    users.find({"user":user.toLowerCase()},function(err,result){
      if(result.length){
        req.session['login_message'] = "Username " + user + " already exists.";
        res.redirect("./");
      }
      // registration successful
      else{
        users.insert({"user": user.toLowerCase(), "password": hash(password), "favorites": {}, "following": {}});
        req.session['user'] = user;
        res.redirect("/");
      }
    })
  }
});

module.exports = router;