AWS.config.region = //Put region here
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId:  //Put Identity pool here
});
var s3 = new AWS.S3();

document.getElementById("getButton").addEventListener('click', printTranscriptandNotes, false);
document.getElementById("getSearch").addEventListener('click', search, false);


function search(){
    document.getElementById('transcriptdisp').value = '';
    document.getElementById('notesdisp').value = '';
    email = document.getElementById('searchmail').value; 
    email = email.replace(".", "_");
    email = email + ".json";
    var params = {
        Bucket: 'macs-users',
        Key: email, 
    };
    getFromS3(params);
}


function printTranscriptandNotes(){
    document.getElementById('transcriptdisp').value = '';
    document.getElementById('notesdisp').value = '';
    var params = {
      Bucket: 'macs-users',
        Key: getKey(), 
    };
    getFromS3(params);
}

function getKey(){
    var agent = new connect.Agent();
    var contacts = agent.getContacts(connect.ContactType.CHAT);
    //email = JSON.stringify(contacts[0].getAttributes().EmailAddress.value);
    email = document.getElementById('currentContacts').value;
    email = email.replace("\"", "" );
    email = email.replace("\"", "" );
    email = email.replace(".", "_");
    email = email + ".json";
    return email;
}

function getFromS3(params){
    s3.getObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else{
            
            var json = JSON.parse(data.Body.toString('ascii'));
            console.log(json);
            console.log(params);
            json.transcript_address_list.forEach(element => {
                getTranscript(element.Bucket, element.Key);
            });
            console.log(json.note_address_list);
            
            for (let i = 0; i < json.note_address_list.length; i++) {
                const element = json.note_address_list[i];
                getNotes(element.Bucket, element.Key);
            }
        } 
    }); 
}

//Parsing Function

function getTranscript(bucket, key){
    var transcriptParams = {
        Bucket: bucket,
        Key: key,
    }
    s3.getObject(transcriptParams, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else{
            console.log(bucket);
            var json = JSON.parse(data.Body.toString('utf-8'));
            log(parse(json.Transcript));
        }
    });
};
function getNotes(bucket, key){
    var notesParam = {
        Bucket: bucket,
        Key: key,
    }
    s3.getObject(notesParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else{
            console.log(notesParam);

            var json = JSON.parse(data.Body.toString('utf-8'));
            document.getElementById('notesdisp').value +=  'Agent: ' + json.agent +'\n' ;
            document.getElementById('notesdisp').value +=  'Date: ' + json.date +'\n' ;
            document.getElementById('notesdisp').value +=  'Notes: ' + '\n' + json.notes +'\n' ;
            document.getElementById('notesdisp').value +=  '\n' ;
        }
    });
}   

var output = [];
function parse(transcript)
{
    output = [];
    let date = parseDate(transcript[0].AbsoluteTime)
    output.push(date)
    transcript.forEach(parseMessages)
    return output
}
function parseDate(timeStamp)
{
    arr = timeStamp.split("");
    year = arr[0] + arr[1] + arr[2] + arr[3];
    month = arr[5] + arr[6]
    day = arr[8] + arr[9]
    return (month + "/" + day + "/" + year);
}
function parseMessages(message)
{
    if (message.ContentType == "application/vnd.amazonaws.connect.event.participant.joined")
    {
        output.push("** " + message.DisplayName + " has joined the chat **");
    }

    else if (message.ContentType == "text/plain")
    {
        name = (message.ParticipantRole == "SYSTEM")? "MACS" : message.DisplayName;
        output.push(name + ": " + message.Content)
    }
}
function log(output_array)
{
    output_array.forEach(function(line){
        document.getElementById('transcriptdisp').value += line + '\n' + '\n';
    });
}