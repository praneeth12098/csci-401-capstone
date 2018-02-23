var express = require('express');
var router = express.Router();
var link = require('../models/link');

/* GET login page. */
router.get('/:hash', function(req, res, next) {
    console.log(req.params.hash);
    query = link.find({link: req.params.hash});
    query.exec(function(err, result) {
      if (err || result[0] == undefined) {
        res.send("Form not found.");
      } else {
        res.send("Form " + result[0].link + " created at " + result[0].createdAt + ".");
      }
    });
    
});

module.exports = router;