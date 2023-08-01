const AWS = require("aws-sdk");
const https = require('https');
const sharp = require("sharp");
const { Consumer } = require('sqs-consumer');

var s3 = new AWS.S3(),
    queueUrl = process.env.THUMBNAIL_QUEUE,
    agent = new https.Agent({
        keepAlive: true
    });

const app = Consumer.create({
    queueUrl,
    handleMessageBatch: async (message) => {
        const records = message || [];

        for (let idx = 0; idx < records.length; idx++) {
            const record = records[idx],
                body = JSON.parse(record.Body) || { Message: {} },
                bodyRecords = JSON.parse(body.Message).Records || [];

            for (let jdx = 0; jdx < bodyRecords.length; jdx++) {
                const bodyRecord = bodyRecords[jdx];
                let name = bodyRecord.s3.bucket.name,
                    key = decodeS3Key(bodyRecord.s3.object.key);

                const params = {
                    Bucket: name,
                    Key: key
                };
                var origimage = await s3.getObject(params).promise();
                const width = 200;
                var buffer = await sharp(origimage.Body).resize(width).toBuffer();

                const destparams = {
                    Bucket: process.env.THUMBNAIL_BUCKET,
                    Key: key,
                    Body: buffer,
                    ContentType: "image"
                };

                const putResult = await s3.putObject(destparams).promise();
                console.log('Successfully resized ' + params.Bucket + '/' + params.Key + ' and uploaded to ' + destparams.Bucket + '/' + destparams.Key);
            }
        }
    },
    sqs: new AWS.SQS({
        httpOptions: {
            agent
        }
    }),
    batchSize: 10,
});

app.on('error', (err, message) => {
    console.log("Thumnnail Worker: Queue Error", err.message);
});

app.on('processing_error', (err) => {
    console.log("Thumnnail Worker: Message processing error", err.message);
});

app.on('message_received', (message) => {
    console.log("Thumnnail Worker: Message received");
});

app.on('message_processed', (message) => {
    console.log("Thumnnail Worker: Message successfully processed and removed from queue");
});

app.on("response_processed", () => {
    console.log("Thumnnail Worker: Batch messages processed successfully.")
});

const decodeS3Key = (key) => {
    return key.replace("%3A", ":");
};

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