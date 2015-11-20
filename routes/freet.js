var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	// a get request to /freet/ gives a new freet to create
    var user = req.session['user'];
	res.render('freet',{"user":user,"text":"","_id":""});
});

router.post('/', function(req, res) {
	// a post request to /freet/ updates an existing freet, or allows it to be deleted
	var _id = req.body._id;
    var user = req.session['user'];
	var freetsdb = req.db.get('freets');
	freetsdb.find({"_id":_id}, function(err, freets){
		var text = freets[0]["text"];
		res.render('freet',{"user":user,"text":text,"_id":_id});
	})
});


router.post('/post', function(req, res) {
	// this updates an existing freet or creates a new freet
	var freetsdb = req.db.get('freets');
	var _id = req.body._id;
	var text = req.body.text;
	// if there is an id provided, update that selected freet
	// otherwise, insert a new freet
	if(_id){
		freetsdb.update({"_id":_id},{$set:{"text":text}});
	}
	else{
		freetsdb.insert({"user": req.session["user"], "text": text,"timestamp":Date()});
	}
	res.redirect("../");
});


router.post('/delete', function(req,res){
	var _id = req.body._id;
	req.db.get('freets').remove({"_id":_id});
	res.redirect("../");
});

module.exports = router;