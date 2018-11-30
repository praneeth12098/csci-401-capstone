var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var nodemailer = require('nodemailer');
var credentials = require('../config/auth');
var googleAuth = require('google-auth-library');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var letterParser = require('./letter-parser');
const HummusRecipe = require('hummus-recipe');
const fs = require('fs');
const Readable = require('stream').Readable;
const fileUpload = require('express-fileupload');
const opn = require('opn')
const downloadsFolder = require('downloads-folder');


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

router.post('/drive', function(req,res,next) {
    var user = req.user;
    user.getForm(req.body.id, function(err, form) {
        if(err){
            console.log(err)
        } else {
            var break_lines = "<br><br>";
            var smaller_break_lines = "<br><br>";
            var date_raw = req.body.date;
            var actual_date = letterParser.getDate(date_raw);
            var formatted_date = break_lines + actual_date + smaller_break_lines;
            var letter = req.body.letter;
            var formatted_letter = formatted_date + letter;
            var template = form.getTemplate();
            var templateName = template.name;
            console.log("THIS IS FORMATTED:" + formatted_letter);

            var text = letterParser.htmlstuff(formatted_letter)
            var longText = text.replace(/(\r\n|\n|\r)/gm, "<br>");
            // text = text.replace(/(\n)/gm, '')
            var fname = form.responses[0].response;
            var lname = form.responses[1].response;
            var length = longText.length;
            console.log("TEXT:" + text)
            var stringWords = longText.split(' ');
            console.log("words: " + stringWords)
            var para = longText.split('<br>');
            console.log("PAR:" + para)
            var stringlen = stringWords.length;
            console.log("LEN: " + stringlen)
            console.log("PARAG:" + para.length)
            var firstPage = "";
            var secondPage = "";
            // If it is larger than one page break it into two
            if (stringlen > 510){
                 
                for(var i = 0; i < 510; i++){
                   
                    if(stringWords[i].includes("<br>")){
                        console.log("Hello")
                        stringWords[i] = stringWords[i].replace("<br><br>", "\n\n")
                        stringWords[i] = stringWords[i].replace("<br>", "\n")
                        stringWords[i] = stringWords[i].replace("<br> <br>", "\n \n")
                        console.log("WORD: " + stringWords[i])
                    }
                    firstPage += stringWords[i];
                    firstPage += " ";
                }
                // Write on first page up until last paragraph
                console.log("WTF")
                var counter = 510;

                while(counter < stringlen){
                    console.log("POOP: " + stringWords[counter])
                    if(stringWords[counter].includes("<br>")){
                        console.log("BRUH")
                        var index = stringWords[counter].indexOf("<br>");
                        var first = stringWords[counter].substr(0, index);
                        var second = stringWords[counter].substr(index);
                        // stringWords[counter] = stringWords[counter].replace("<br><br>", "\n\n")
                        // stringWords[counter] = stringWords[counter].replace("<br>", "\n")
                        // stringWords[counter] = stringWords[counter].replace("<br> <br>", "\n \n")

                        console.log("INSIDE: " + stringWords[counter])
                        console.log("first:" + first);
                        console.log("second:" + second)
                        // firstPage += stringWords[counter];
                        // firstPage += " ";
                        firstPage += first;
                        firstPage += " ";
                        // Attach second part to next word inside array
                        var next = stringWords[counter + 1];
                        stringWords[counter + 1] = second + " " + next;
                        counter = counter + 1;
                        break;
                    }
                    else {
                        firstPage += stringWords[counter];
                        firstPage += " ";
                        counter = counter + 1;
                    } 
                    
                }

                console.log("LOOP")
                console.log("Counter: " + counter)

                var remain = stringlen - counter;
                
                for(var i = counter; i < stringlen;i++){
                    if(stringWords[i].includes("<br>")){
                        stringWords[i] = stringWords[i].replace("<br><br>", "\n\n")
                        stringWords[i] = stringWords[i].replace("<br>", "\n")
                        stringWords[i] = stringWords[i].replace("<br> <br>", "\n \n")
                    }
                    secondPage += stringWords[i];
                    console.log(stringWords[i])
                    secondPage += " ";
                }

            }

            // console.log("REMAIN: " + remain)
            var headerPath = __dirname + '/uploads/' + 'uploaded.pdf';
            var signaturePath = __dirname + '/uploads/' + 'signature.pdf';

            var outputName = templateName + "_Template_" + fname + "_" + lname + ".pdf";
            var downloadFolder = downloadsFolder() + '/';
            var output = downloadFolder + outputName;
            var fontDirectory = __dirname + '/fonts/TIMES.ttf';
            
            const HummusRecipe = require('hummus-recipe');
            const pdfDoc = new HummusRecipe(headerPath, output);
            pdfDoc.registerFont('Times', fontDirectory);

            // console.log("COUNTER: " + counter)
            var signature_pos = remain + 50;
            /**  
             * The current problem is that bolded text that use <strong>txt</strong> can't be
             * converted and kept bold. So we need to find where the location of the text
             * and bold it through hummus-reciper (can be found on npm website for hummus-recipe)
             * but this cannot be done right now.
            */
            if(stringlen > 520){
                pdfDoc
                // edit 1st page
                .editPage(1)
                .text(firstPage, 80, 85, {
                    color: '000000',
                    font: 'Times',
                    fontSize: 11,
                    align: 'left',
                    textBox: {
                        width: 480,
                        lineHeight: 12,
                        style: {
                            lineWidth: 1
                        }
                    }
                })
                .endPage()
                .editPage(2)
                .text(secondPage, 80, 75, {
                    color: '000000',
                    font: 'Times',
                    fontSize: 11,
                    align: 'left',
                    textBox: {
                        width: 480,
                        lineHeight: 12,
                        style: {
                            lineWidth: 1
                        }
                    }
                })
                .image(signaturePath, 20, signature_pos , {width: 500, keepAspectRatio: true})
                .endPage()
                .endPDF();
            }
            else {
                // One page but find out where signature needs to go
                if(stringlen > 300){ 
                    pdfDoc
                // edit 1st page
                    .editPage(1)
                    .text(text, 80, 85, {
                        color: '000000',
                        font: 'Times',
                        fontSize: 11,
                        align: 'left',
                        textBox: {
                            width: 480,
                            lineHeight: 14,
                            style: {
                                lineWidth: 1
                            }
                        }
                    })
                    .endPage()
                    .insertPage(1, signaturePath, 1)
                    .endPDF();
                } else {
                    // Keep it on the first page
                     pdfDoc
                    // edit 1st page
                    .editPage(1)
                    .text(text, 80, 85, {
                        color: '000000',
                        font: 'Times',
                        fontSize: 11,
                        align: 'left',
                        textBox: {
                            width: 480,
                            lineHeight: 14,
                            style: {
                                lineWidth: 1
                            }
                        }
                    })
                    .image(signaturePath, 20, 400, {width: 600, keepAspectRatio: true})
                    .endPage()
                    .endPDF();
                }
                
            }
            opn(output);
            res.redirect('/recommender-dashboard');
        }

    })
})



module.exports = router;