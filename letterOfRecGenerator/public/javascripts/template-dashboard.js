function saveTemplate() {
    console.log("@@@@@@@@@@@@@@@@ HERE @@@@@@@@@@@@@@@@@@@@@@");
    var template = document.getElementById("template").value;
    $.ajax({
        url: 'http://68.181.97.191.xip.io:3000/template-dashboard/uploadLetterTemplate',
        data: {
            template: template
        },
        type: 'POST',
        success: function(d){
            console.log("success in drive")
            window.location.href = 'http://68.181.97.191.xip.io:3000/template-dashboard';
        },
        error: function() {
            console.log("error in drive")
        }
    })
}

