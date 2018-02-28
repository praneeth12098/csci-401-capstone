var nextQuestionIdToUse = 0;

/**
 * Prototype class for Questions
 */
class Question {
    constructor(type, value, tag) {
        // text, radio, checkbox
        this.type = type;
        this.value = value;
        this.tag = tag;
        this.id = nextQuestionIdToUse;
        nextQuestionIdToUse++;
    }
}

const QUESTIONS_CONTAINER_ID = "questions-container";
const ADD_QUESTION_MODAL_ID = "add-question-modal";
var questions = [];

window.onload = function() {
    questions.push(new Question("text", "", ''));
    displayQuestions();
}

window.onclick = function(event) {
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
    var delete_onclick_attribute = "onclick=\"deleteQuestion(" + q.id + ")\"";   
    return "<div class=\"question-outer-container\"" + data_id_attribute + ">" +
                "<div class=\"question-container\">" +
                    "<textarea data-type=\"value\" class=\"text-area underlined\" type=\"text\" placeholder=\"Enter new question here...\" onkeyup=\"auto_grow(this)\">"
                    + q.value + "</textarea>" +
                    "<span class=\"line\"></span>" +
                    "<input data-type=\"tag\" class=\"text-field blue-text\" type=\"text\" placeholder=\"Enter answer tag here... (optional)\" value=\""
                    + q.tag + "\">" +
                "</div>" +
                "<button class=\"question-button small-circle-button\" " + delete_onclick_attribute + ">X</button>" +
            "</div>";
}

// used for allowing textareas to grow in height (trick with onkeyup)
function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

function addQuestion() {
    console.log("addQuestion called");
    showAddQuestionModal();
}

function saveTemplate() {
    console.log("saveTemplate called");
    updateQuestions();

    var template = {}
    template["name"] = "temp";
    templateQuestions = []
    for (q of questions) {
        templateQuestions.push({
            type: q.type,
            question: q.value,
            number: q.id,
            tag: q.tag || "",
        });
    }
    template["questions"] =  templateQuestions;

    console.log(JSON.stringify(template));
}

function showAddQuestionModal() {
    var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
    modal.style.display = "block";
}

function hideAddQuestionModal() {
    var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
    modal.style.display = "none";
}

function addTextAnswerQuestion() {
    console.log("addTestAnswerQuestion called");
    updateQuestions();
    questions.push(new Question("text", "", ""));
    displayQuestions();
    hideAddQuestionModal();
}

function updateQuestions() {
    for (var i = 0; i < questions.length; i++) {
        var query = "div[data-id='" + questions[i].id +"']";
        var question = document.querySelector(query);

        questions[i].value = question.querySelector("[data-type='value']").value;
        questions[i].tag = question.querySelector("[data-type='tag']").value;
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