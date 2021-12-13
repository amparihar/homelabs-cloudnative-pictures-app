const AWS = require("aws-sdk");
const https = require('https');
const { Consumer } = require('sqs-consumer');

var s3 = new AWS.S3(),
    queueUrl = process.env.THUMBNAIL_QUEUE,
    agent = new https.Agent({
        keepAlive: true
    });

const app = Consumer.create({
    queueUrl,
    handleMessageBatch: async (message) => {
        console.log("Message =>", message);
    },
    sqs: new AWS.SQS({
        httpOptions: {
            agent
        }
    }),
    batchSize: 10,
});

app.on('error', (err, message) => {
    console.log("Queue Error", err.message);
});

app.on('processing_error', (err) => {
    console.log("Message processing error", err.message);
});

app.on("response_processed", () => {
    console.log("Batch messages processed.")
})

app.start();

// var receiveMessageParams = {
//     QueueUrl: queueUrl,
//     MaxNumberOfMessages: 10,
//     WaitTimeSeconds: 20

// };

// sqs.receiveMessage(receiveMessageParams, (err, data) => {
//     if (err) {
//         console.log("Receive Message Error", err);
//     }
//     else {
//         const messages = (data.Messages) || [];
//         for (var idx=0; idx < messages.length; idx++){
//             var message = messages[idx];
//             console.log("Message =>", message);
//             deleteMessage(message.ReceiptHandle);
//         }
//     }
// })

// const deleteMessage = (receiptHandle) => {
//     var deleteParams = {
//         QueueUrl: queueUrl,
//         ReceiptHandle: receiptHandle
//     };
//     sqs.deleteMessage(deleteParams, function(err, data) {
//       if (err) {
//         console.log("Delete Message Error", err);
//       } else {
//         console.log("Message Deleted", data);
//       }
//     });
// }
