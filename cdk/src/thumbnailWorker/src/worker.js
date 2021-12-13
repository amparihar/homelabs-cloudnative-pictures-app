const AWS = require("aws-sdk");


var sqs = AWS.sqs(),
    queueUrl = process.env.THUMBNAIL_QUEUE;

var receiveMessageParams = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    
};

sqs.receiveMessage(receiveMessageParams, (err, data) => {
    if (err) {
        console.log("Receive Message Error", err);
    }
    else {
        console.log("Received Messages", data);
    }
})

