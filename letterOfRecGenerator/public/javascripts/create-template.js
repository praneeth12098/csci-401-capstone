var nextQuestionIdToUse = 0;

/**
 * Prototype class for Questions
 */
class Question {
    constructor(type, value) {
        // text, radio, checkbox
        this.type = type;
        this.value = value;
        this.id = nextQuestionIdToUse;
        nextQuestionIdToUse++;
    }
}

const QUESTIONS_CONTAINER_ID = "questions-container";
const ADD_QUESTION_MODAL_ID = "add-question-modal";
var questions = [];

window.onload = function() {
    questions.push(new Question("text", ""));
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
    return "<div class=\"question-container\">" +
        "<textarea class=\"text-field\" type=\"text\" placeholder=\"Enter new question here...\" onkeyup=\"auto_grow(this)\"" + data_id_attribute + ">"
        + q.value + "</textarea>" + "</div>";
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
    updateQuestionValues();
    questions.push(new Question("text", ""));
    displayQuestions();
}

function updateQuestionValues() {
    for (var i = 0; i < questions.length; i++) {
        var query = "textarea[data-id='" + questions[i].id +"']";
        var textarea = document.querySelector(query);
        questions[i].value = textarea.value;
    }
}