var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var link = require('../models/link');

router.use(function (req, res, next) {
    res.locals.statusMessage = null;
    next();
});

router.get('/', function(req, res, next) {
    res.render('pages/recommender-dashboard', {
        title: 'RECOMMENDER DASHBOARD',
    });
});

router.post('/', function(req, res, next) {
    // nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'jsc6d5nbhjlppqts@ethereal.email',
            pass: 'xZdzQ5HHMwNKN2esxS'
        }
    });

    // grab the email from the form
    var email = req.body.email;

    if (!email.length) {
        res.render('pages/recommender-dashboard', {
            title: 'RECOMMENDER DASHBOARD',
            statusMessage: 'Please provide a valid email'
        });
        return;
    }

    // setup email data with unicode symbols
    const hash = crypto.createHash('md5').update(email + '<no-reply@example.com>').digest("hex");
    link.create({link: hash});
    let mailOptions = {
        from: '<no-reply@example.com>', // sender address
        to: email, // list of receivers
        subject: 'Invitation to Fill Recommendation Letter Questionairre', // Subject line
        text: 'Please click the following questionairre link.', // plain text body
        html: '<p>Please click the following questionairre <a href = "localhost:3000/rec/' + hash + '">link.</a></p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });

    res.render('pages/recommender-dashboard', {
        title: 'RECOMMENDER DASHBOARD',
        statusMessage: 'Email invitation sent!'
    });
});

module.exports = router;