var nextQuestionIdToUse = 0;
var errors = [];
var errorScrollCoordinates = {
    x: 0,
    y: 0
};
var id = parseAttribute('id');
var letterheadImgData = parseAttribute('letterheadImgData');
var footerImgData = parseAttribute('footerImgData');

/**
 * Prototype class for Questions
 */
class Question {
    constructor(type, value, tag) {
        // Text, Radio Button, Checkbox
        this.type = type;
        this.value = value;
        this.tag = tag;
        // local browser
        this.id = nextQuestionIdToUse;
        // Filled with Objects of {option, fill} (both strings) if dealing with Radio Button or Checkbox
        this.options = [];
        nextQuestionIdToUse++;
    }
}

const NAME_CONTAINER_TEXT_FIELD_ID = "name-container-text-field";
const LETTER_TEXT_AREA_ID = "letter-text-area";
const QUESTIONS_CONTAINER_ID = "questions-container";
const ADD_QUESTION_MODAL_ID = "add-question-modal";
const WARNING_MODAL_ID = "warning-modal";

let letter = "";
var questions = [];
var warningModalFunction;

window.onload = function () {
    setUpEventHandlers();

    if (id) {
        $.ajax({
            url: 'http://localhost:3000/template-editor/template',
            data: {id},
            type: 'GET',
            success: function (data) {
                document.getElementById(LETTER_TEXT_AREA_ID).innerHTML = encodeLetterHTML(data.letter);
                data.questions.forEach(question => {
                    var savedQuestion = new Question(question.type, question.question, question.tag);
                    savedQuestion.options = question.options;
                    questions.push(savedQuestion);
                });
                console.log('success');
                displayQuestions();
                emphasizeTags();
            },
            error: function () {
                console.log('error');
            }
        });
    } else {
        loadDefaultQuestions();
        displayQuestions();
    }
};

function loadDefaultQuestions() {
    var default1 = new Question("Text", "What is your name?", "<!NAME>");
    questions.push(default1);
    var default2 = new Question("Radio Button", "What is your preferred personal pronoun (subject)?", "<!SUB_PRONOUN>");
    default2.options = [constructOptionObject("He", "he"), constructOptionObject("She", "she"), constructOptionObject("They", "they")];
    questions.push(default2);
    var default3 = new Question("Radio Button", "What is your preferred personal pronoun (object)?", "<!OBJ_PRONOUN>");
    default3.options = [constructOptionObject("Him", "him"), constructOptionObject("Her", "her"), constructOptionObject("Them", "them")];
    questions.push(default3);
    var default4 = new Question("Radio Button", "What is your preferred possessive pronoun?", "<!POS_PRONOUN>");
    default4.options = [constructOptionObject("His", "his"), constructOptionObject("Her", "her"), constructOptionObject("Their", "their")];
    questions.push(default4);
}

function setUpEventHandlers() {
    // upload letterhead
    $('#letterhead-upload').submit(function (evt) {
        evt.preventDefault();
        var files = $('#letterhead-upload-file')[0].files;
        if (files && files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#letterhead-preview').attr('src', e.target.result);
                letterheadImgData = e.target.result;
            };

            reader.readAsDataURL(files[0]);
        }

        return false;
    });

    // upload footer
    $('#footer-upload').submit(function (evt) {
        evt.preventDefault();
        var files = $('#footer-upload-file')[0].files;
        if (files && files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#footer-preview').attr('src', e.target.result);
                footerImgData = e.target.result;
            };

            reader.readAsDataURL(files[0]);
        }
        
        return false;
    });
}

window.onclick = function (event) {
    var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
    if (event.target == modal) {
        hideAddQuestionModal();
    }
}

function displayQuestions() {
    // grab the container that will hold all questions
    var container = document.getElementById(QUESTIONS_CONTAINER_ID);

    // fill in with questions
    container.innerHTML = "";
    for (var i = 0; i < questions.length; i++) {
        container.innerHTML += getQuestionHTML(questions[i]);
    }
}

function getQuestionHTML(q) {
    var data_id_attribute = "data-id=\"" + q.id + "\"";
    var delete_onclick_attribute = "onclick=\"deleteQuestionWithWarning(" + q.id + ")\"";
    var multiple_choice_fields_html = getMultipleChoiceFieldsHTML(q);
    var placeholder = "Enter new question here...";

    var question_type_label = "";
    switch (q.type) {
        case "Text":
            question_type_label = "TEXT";
            break;
        case "Radio Button":
            question_type_label = "RADIO BUTTON";
            break;
        case "Checkbox":
            question_type_label = "CHECKBOX";
            break;
        default:
            break;
    }

    return "<h2>" + question_type_label + "</h2>" + "<div class=\"question-outer-container\"" + data_id_attribute + ">" + "<div class=\"question-container\">" + getTextAreaHTML(placeholder, q.value) + multiple_choice_fields_html + "<span class=\"line\"></span>" + "<input data-type=\"tag\" class=\"text-field blue-text\" type=\"text\" placeholder=\"Enter answer tag here...\" value=\"" + q.tag + "\">" + "</div>" + "<button class=\"question-button small-circle-button\" " + delete_onclick_attribute + ">X</button>" + "</div>";
}

// Note: the html needs to be nested within a question-container element in order to properly work
function getMultipleChoiceFieldsHTML(q) {
    if (q.type != "Radio Button" && q.type != "Checkbox") return "";

    var option_placeholder = "Enter option here...";
    var fill_placeholder = "Enter text that will replace the tag... (optional)";
    var html = "<div class=\"multiple-choices-container\">";
    for (var i = 0; i < q.options.length; i++) {
        var data_id_attribute = "data-id=\"" + i + "\"";
        var delete_onclick_attribute = "onclick=\"deleteMultipleChoiceFieldWithWarning(this," + i + ")\"";

        var text_area_elements = "<div class=\"text-area-container\">" + getTextAreaHTML(option_placeholder, q.options[i].option, 'option') + getTextAreaHTML(fill_placeholder, q.options[i].fill) + "</div>";
        html += "<div class=\"multiple-choice-container\"" + data_id_attribute + ">" + text_area_elements + "<button class=\"question-button small-circle-button\" " + delete_onclick_attribute + ">X</button>" + "</div>";
    }
    var add_multiple_choice_attribute = "onclick=\"addMultipleChoiceField(" + q.id + ")\"";
    html += "<button class=\"small-circle-button\" " + add_multiple_choice_attribute + ">+</button>";
    html += "</div>";
    return html;
}

function getTextAreaHTML(placeholder, value, name) {
    if (name) {
        return "<textarea name=\"" + name + "\" data-type=\"value\" class=\"text-area\" type=\"text\" placeholder=\"" + placeholder + "\" onkeyup=\"auto_grow(this)\">" + value + "</textarea>";
    }

    return "<textarea data-type=\"value\" class=\"text-area\" type=\"text\" placeholder=\"" + placeholder + "\" onkeyup=\"auto_grow(this)\">" + value + "</textarea>";
}

// used for allowing text areas to grow in height (trick with onkeyup)
function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
}

function addQuestion() {
    console.log("addQuestion called");
    showAddQuestionModal();
}

function saveTemplate() {
    console.log("saveTemplate called");
    updateQuestions();

    var template = {
        name: document.getElementById(NAME_CONTAINER_TEXT_FIELD_ID).value,
        text: letter,
        questions: getQuestions()
    };

    if (!validate(template)) {
        window.scrollTo(errorScrollCoordinates.x, errorScrollCoordinates.y);
        return;
    }

    if (letterheadImgData) {
        template.letterheadImg = letterheadImgData;
    }

    if (footerImgData) {
        template.footerImg = footerImgData;
    }

    if (id) {
        console.log("updating template");
        $.ajax({
            url: 'http://localhost:3000/template-editor/update',
            data: {
                id: id,
                template: template
            },
            type: 'POST',
            cache: false,
            complete: function (data) {
                console.log('complete');
            },
            success: function (data) {
                console.log('success');
                window.location.href = 'http://localhost:3000/template-dashboard'
            },
            error: function () {
                console.log('error');
            }
        });
    } else {
        console.log("creating template");
        $.ajax({
            url: 'http://localhost:3000/template-editor/create',
            data: {template: template},
            type: 'POST',
            complete: function () {
                console.log('complete');
            },
            success: function (data) {
                id = data.id;

                console.log('success');
                window.location.href = 'http://localhost:3000/template-dashboard'
            },
            error: function () {
                console.log('error');
            }
        });
    }
}

function getQuestions() {
    var dbQuestions = [];
    var questionNumber = 1;

    questions.forEach(question => dbQuestions.push({
        number: questionNumber++,
        type: question.type,
        question: question.value,
        options: question.options,
        tag: question.tag
    }));

    return dbQuestions;
}

function showAddQuestionModal() {
    var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
    modal.style.display = "block";
}

function hideAddQuestionModal() {
    var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
    modal.style.display = "none";
}

function showWarningModal(func) {
    var modal = document.getElementById(WARNING_MODAL_ID);
    modal.style.display = "block";
    warningModalFunction = func;
}

function hideWarningModal() {
    var modal = document.getElementById(WARNING_MODAL_ID);
    modal.style.display = "none";
}

function executeWarningModalFunction() {
    warningModalFunction();
    hideWarningModal();
}

// NOTE: need to push new question AFTER updateQuestions(), since display questions relies on a question being displayed once
// to assign it a data_id
function addTextAnswerQuestion() {
    console.log("addTestAnswerQuestion called");
    updateQuestions();
    questions.push(new Question("Text", "", ""));
    displayQuestions();
    hideAddQuestionModal();
}

function addRadioButtonQuestion() {
    console.log("addRadioButtonQuestion called");
    updateQuestions();
    var question = new Question("Radio Button", "", "");
    question.options.push(constructOptionObject("", ""));
    questions.push(question);
    displayQuestions();
    hideAddQuestionModal();
}

function addCheckboxQuestion() {
    console.log("addCheckboxQuestion called");
    updateQuestions();
    var question = new Question("Checkbox", "", "");
    question.options.push(constructOptionObject("", ""));
    questions.push(question);
    displayQuestions();
    hideAddQuestionModal();
}

function updateQuestions() {
    // update the letter
    letter = decodeLetterHTML(document.getElementById(LETTER_TEXT_AREA_ID).innerHTML);

    // update individual questions
    for (var i = 0; i < questions.length; i++) {
        // grab the question element
        var query = "div[data-id='" + questions[i].id + "'][class='question-outer-container']";
        var question = document.querySelector(query);

        questions[i].value = question.querySelector("[data-type='value']").value;
        questions[i].tag = question.querySelector("[data-type='tag']").value;

        var multipleChoices = question.querySelectorAll("[class='multiple-choice-container'");
        for (var j = 0; j < multipleChoices.length; j++) {
            questions[i].options[j].option = multipleChoices[j].querySelectorAll("[data-type='value']")[0].value;
            questions[i].options[j].fill = multipleChoices[j].querySelectorAll("[data-type='value']")[1].value;
        }
    }
}

function deleteQuestion(id) {
    updateQuestions();
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].id == id) {
            questions.splice(i, 1);
            break;
        }
    }
    displayQuestions();
}

function deleteQuestionWithWarning(id) {
    showWarningModal(() => {
        deleteQuestion(id);
    });
}

function deleteMultipleChoiceFieldWithWarning(el, data_id) {
    showWarningModal(() => {
        deleteMultipleChoiceField(el, data_id);
    })
}

function addMultipleChoiceField(id) {
    var question = getQuestionById(id);
    question.options.push(constructOptionObject("", ""));
    updateQuestions();
    displayQuestions();
}

function constructOptionObject(option, fill) {
    return {
        option: option,
        fill: fill
    };
}

function getQuestionById(id) {
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].id == id) {
            return questions[i];
        }
    }
    return null;
}

// needs the element as well as the data_id of the multiple choice field
function deleteMultipleChoiceField(el, data_id) {
    updateQuestions();

    var questionEl = findAncestor(el, 'question-outer-container');
    var question_data_id = questionEl.getAttribute('data-id');

    var question = getQuestionById(parseInt(question_data_id));
    question.options.splice(parseInt(data_id), 1);
    displayQuestions();
}

function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls)) ;
    return el;
}

function parseAttribute(attr) {
    return document.currentScript.getAttribute(attr) == '' ? null : document.currentScript.getAttribute(attr);
}

function validate(template) {
    clearErrors();
    var isValid = true;

    if (isNotValid(template.name)) {
        var textField = document.getElementById(NAME_CONTAINER_TEXT_FIELD_ID);
        addError(textField, 'template name is required');
        isValid = false;
    }

    if (isNotValid(template.text)) {
        var textField = document.getElementById(LETTER_TEXT_AREA_ID);
        addError(textField, 'letter text is required');
        isValid = false;
    } else if (!isTagsExist(template.text, template.questions)) {
        var textField = document.getElementById(LETTER_TEXT_AREA_ID);
        addError(textField, 'letter contains unknown tags');
        isValid = false;
    }

    for (var i = 0; i < template.questions.length; i++) {
        var question = template.questions[i];
        var query = "div[data-id='" + i + "'][class='question-outer-container']";
        var questionHTML = document.querySelector(query);

        if (isNotValid(question.question)) {
            var textField = questionHTML.querySelector("[data-type='value']");
            addError(textField, 'question field is required');
            isValid = false;
        }

        if (isNotValid(question.tag)) {
            var textField = questionHTML.querySelector("[data-type='tag']");
            addError(textField, 'tag field is required');
            isValid = false;
        } else if (isTagNotValid(question.tag)) {
            var textField = questionHTML.querySelector("[data-type='tag']");
            addError(textField, 'tag field does not match expected pattern');
            isValid = false;
        }

        if (question.type === 'Radio Button' || question.type === 'Checkbox') {
            for (var j = 0; j < question.options.length; j++) {
                var option = question.options[j];

                if (isNotValid(option.option)) {
                    var query = "div[data-id='" + j + "'][class='multiple-choice-container']";
                    var optionHTML = questionHTML.querySelector(query);
                    var textField = optionHTML.querySelector("[name='option']");
                    addError(textField, 'option is required');
                    isValid = false;
                }

                if (isNotValid(option.option)) {
                    option.fill = option.option;
                }
            }
        }
    }

    return isValid;
}

function clearErrors() {
    for (var i = 0; i < errors.length; i++) {
        errors[i].field.classList.remove('error');
        errors[i].error.remove();
    }

    errorScrollCoordinates.x = 0;
    errorScrollCoordinates.y = 0;
}

function isNotValid(field) {
    return field === '' || !field;
}

function addError(field, message) {
    field.classList.add('error');

    var arrow = document.createElement("div");
    arrow.classList.add('arrow-box');
    arrow.innerHTML = getErrorMessage(message);
    arrow.style.position = 'absolute';
    document.body.appendChild(arrow);

    var bounds = field.getBoundingClientRect();
    var coordinates = getCoordinates(field, arrow);
    arrow.style.left = coordinates.x + 'px';
    arrow.style.top = coordinates.y + 'px';

    errors.push({
        field: field,
        error: arrow
    });
}

function getErrorMessage(message) {
    return '\<p class="arrow-text"\>Error: ' + message + '.\</p\>'
}

function getCoordinates(field, arrow) {
    var bounds = field.getBoundingClientRect();
    var coordinates = {
        x: bounds.right + window.scrollX + 60,
        y: bounds.top + ((bounds.bottom - bounds.top) / 2) + window.scrollY - (arrow.offsetHeight / 2)
    };

    if (errorScrollCoordinates.x == 0 && errorScrollCoordinates.y == 0) {
        errorScrollCoordinates.x = window.scrollX;
        errorScrollCoordinates.y = bounds.top + window.scrollY - 50;
    }

    return coordinates;
}

function isTagNotValid(tag) {
    return !/\<\![a-z0-9_]+\>/i.test(tag);
}

function deemphasizeTags() {
    var letterHTML = document.getElementById(LETTER_TEXT_AREA_ID).innerHTML;
    document.getElementById(LETTER_TEXT_AREA_ID).innerHTML = letterHTML.replace(/\<span class\="tag"\>/gi, '').replace(/\<\/span\>/gi, '');
}

function emphasizeTags() {
    var letterHTML = document.getElementById(LETTER_TEXT_AREA_ID).innerHTML;
    var letterHTMLWithTagEmphasis = letterHTML.replace(/&lt;\![a-z0-9_]+&gt;/gi, function (match) {
        return '<span class="tag">' + match + '</span>';
    });
    letterHTMLWithTagEmphasis = isNotValid(letterHTMLWithTagEmphasis) ? letterHTML : letterHTMLWithTagEmphasis;
    document.getElementById(LETTER_TEXT_AREA_ID).innerHTML = letterHTMLWithTagEmphasis;
}

function isTagsExist(letter, questions) {
    var tags = letter.match(/\<\![a-z0-9_]+\>/gi);

    for (var i = 0; i < tags.length; i++) {
        var question = questions.find(function (question) {
            return question.tag === tags[i]
        });

        if (!question) {
            return false;
        }
    }

    return true;
}

function encodeLetterHTML(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\n/gi, '<br>');
}

function decodeLetterHTML(text) {
    return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'").replace(/\<span class\="tag"\>/gi, '').replace(/\<\/span\>/gi, '').replace(/\<div\>/gi, '\n').replace(/\<\/div\>/gi, '').replace(/\<br\>/gi, '\n');
}