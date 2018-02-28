var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
    res.render('pages/letter-preview', {
        title: 'Letter Preview',
    });
});

router.post('/', function(req, res, next) {

	var recommendeeName = req.body.title;


    res.render('pages/letter-preview', {
        title: `LETTER PREVIEW - ${recommendeeName}`,
    });
});

module.exports = router;