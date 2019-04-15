var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var nodemailer = require('nodemailer');
var credentials = require('../config/auth');
var googleAuth = require('google-auth-library');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var letterParser = require('./letter-parser');
//const HummusRecipe = require('hummus-recipe');
var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs');
var path = require('path');


router.get('/', function (req, res, next) {
    req.user.getForm(req.query.id, function (err, form) {
        if (err) {
            console.log("get /  error in letter-preivew: " + err );
        } else {
            res.render('pages/letter-preview', {
                title: form.email,
                id: req.query.id,
                form: form,
            });
        }
    });
});

router.get('/form', function (req, res, next) {
    req.user.getForm(req.query.id, function (err, form) {
        if (err) {
            console.log(err);
        } else {
            res.json(form);
        }
    });
});


router.post('/save', function (req, res, next) {
    Form.completeForm(req.body.id, req.body.letter, function (err, form) {
        if (err) {
            console.log(err);
        } else {
            res.render('pages/letter-preview', {
                title: form.email,
                id: req.query.id,
                form: form,
            });
        }
    });
});

router.post('/templateUpload', function (req,res, next) {
    const filePath = __dirname + '/uploads/' + 'letterTemplate';
    try{
        //Check if a template has already been uploaded
        if(fs.existsSync(filePath)){
            var user = req.user;

            var pulled_text; //text that were getting and moving to docxtemplater
     
            user.getForm(req.body.formID, function (err, form) {
            if (err) {
                console.log(err);
            } else {

                pulled_text = form.letter;
                res.json(form);

                console.log(pulled_text);
                var formatted_text = letterParser.htmlstuff(pulled_text);

                var content = fs
                        .readFileSync(filePath, 'binary');

                var zip = new JSZip(content); //JSZip used to download file to client

                var doc = new Docxtemplater(); //Docxtemplater is what is used to edit the uploaded template docx file with text stored in form
                doc.loadZip(zip);
                //enable linebreaks
                doc.setOptions({linebreaks:true});

                //set the templateVariables
                doc.setData({
                    
                    //text with the line breaks included
                    description: formatted_text
                });

                try {
                    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                    doc.render()
                }
                catch (error) {
                    var e = {
                        message: error.message,
                        name: error.name,
                        stack: error.stack,
                        properties: error.properties,
                    }
                    console.log(JSON.stringify({error: e}));
                    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                    throw error;
                }
                var buf = doc.getZip()
                 .generate({type: 'nodebuffer'});

                // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
                //Template docx with injected form content (now complete letter) is stored in output.docx on server which is eventually dished back to client when they hit download button
                fs.writeFileSync(path.resolve('./routes/uploads', 'output.docx'), buf);
                 
            }
            });
        }
        //Reach here if no template docx was uploaded
        else{
        //create new document with a blank template (since no template was uploaded by user)
        console.log(req.body.formID);
        var user = req.user;
        console.log("user:**********************");
        console.log(user._id);

        var pulled_text; //text that were getting and moving to docxtemplater

        //console.log(req.body.formID);
        user.getForm(req.body.formID, function (err, form) {
        if (err) {
            console.log(err);
        } else {

            pulled_text = form.letter;
            res.json(form);

            var formatted_text = letterParser.htmlstuff(pulled_text);

            var content = fs
                    .readFileSync(path.resolve('./routes/uploads', 'input.docx'), 'binary');

            var zip = new JSZip(content);

            var doc = new Docxtemplater();
            doc.loadZip(zip);
            //enable linebreaks
            doc.setOptions({linebreaks:true});

            //set the templateVariables
            doc.setData({
                
                //text with the line breaks included
                description: formatted_text
            });

            try {
                // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                doc.render()
            }
            catch (error) {
                var e = {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    properties: error.properties,
                }
                console.log(JSON.stringify({error: e}));
                // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
                throw error;
            }
            var buf = doc.getZip()
             .generate({type: 'nodebuffer'});

            // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
            fs.writeFileSync(path.resolve('./routes/uploads', 'output.docx'), buf);
        }
        });

        }
    } catch(err){
        console.log(err);
    }
})


router.get('/downloads', function(req, res) {
    var file = path.resolve('./routes/uploads', 'output.docx');
    res.download(file);
});




module.exports = router;