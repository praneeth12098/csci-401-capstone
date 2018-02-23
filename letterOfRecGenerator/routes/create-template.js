var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('pages/create-template', {
        title: 'CREATE A NEW TEMPLATE',
    });
});

module.exports = router;