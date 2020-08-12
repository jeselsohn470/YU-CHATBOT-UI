

var subButton = document.getElementById('subButton');
var subSearch = document.getElementById('subSearch');

AWS.config.region = //Put region here
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId://Put Identity pool here
});


subButton.addEventListener('click', build_note_json, false);
subSearch.addEventListener('click', build_note_json_search, false);

function build_note_json_search()
{
    if(document.getElementById('notes') == ""){
        return;
    }
    var current_date = new Date();
    emailcontact = document.getElementById('email').value;
    var agent = new connect.Agent();
    name = agent.getName();
    
    let note = {
        email: emailcontact,
        agent: name,
        date:  current_date.toDateString(),
        notes: document.getElementById('notes').value,
    }
    let filepath = "Notes/" + 
        current_date.getFullYear().toString() + "/" + 
        (current_date.getMonth() + 1).toString() + "/" + 
        current_date.getDate().toString() + "/" + 
        current_date.getHours().toString() + ":" +
        current_date.getMinutes().toString() + ":" +
        current_date.getSeconds().toString() + ".json";

    store_note_json(note, filepath);
    
}

function build_note_json()
{
    var current_date = new Date();
    if(document.getElementById('notes') == ""){
        return;
    }
    if(document.getElementById('currentContacts').value == "--Select a Current Contact--"){
        return;
    }
    var agent = new connect.Agent();
    var contacts = agent.getContacts(connect.ContactType.CHAT);
    name = agent.getName();
    emailcontact = document.getElementById('currentContacts').value;
    emailcontact = emailcontact.replace("\"", "" );
    emailcontact = emailcontact.replace("\"", "" );

    let note = {
        email: emailcontact,
        agent: name,
        date:  current_date.toDateString(),
        notes: document.getElementById('notes').value,
    }
    let filepath = "Notes/" + 
        current_date.getFullYear().toString() + "/" + 
        (current_date.getMonth()+1).toString() + "/" + 
        current_date.getDate().toString() + "/" + 
        current_date.getHours().toString() + ":" +
        current_date.getMinutes().toString() + ":" +
        current_date.getSeconds().toString() + ".json";

    store_note_json(note, filepath);
    
}

function store_note_json(note, filepath)
{
    var s3 = new AWS.S3();
    let note_json = JSON.stringify(note);
    var params = {
        Body: note_json,
        Bucket: "macs-notes", 
        Key: filepath, 
    };
    console.log(filepath);
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
    document.getElementById('notes').value = "";
}