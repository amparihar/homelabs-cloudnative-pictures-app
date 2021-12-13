const AWS = require("aws-sdk");


var sqs = new AWS.SQS(),
    s3 = new AWS.S3(),
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
        const messages = (data.Messages) || [];
        for (var idx=0; idx < messages.length; idx++){
            var message = messages[idx];
            console.log("Message =>", message);
            deleteMessage(message.ReceiptHandle);
        }
    }
})

const deleteMessage = (receiptHandle) => {
    var deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle
    };
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log("Delete Message Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
}

