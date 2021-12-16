const AWS = require("aws-sdk"),
    sqs = new AWS.SQS(),
    ecs = new AWS.ECS(),
    cloudwatch = new AWS.CloudWatch();

module.exports.run = async (event, context) => {
    var queueAttributes,
        ecsServices;

    const sqsParams = {
        QueueUrl: process.env.QUEUE_NAME,
        AttributeNames: [
            "ApproximateNumberOfMessages",
            "ApproximateNumberOfMessagesDelayed",
            "ApproximateNumberOfMessagesNotVisible"
        ]
    };

    ({ Attributes: queueAttributes = {} } = await sqs.getQueueAttributes(sqsParams).promise());

    const ecsParams = {
        services: [process.env.ECS_SERVICE],
        cluster: process.env.CLUSTER
    };
    ({ services: ecsServices = [] } = await ecs.describeServices(ecsParams).promise());



    var cwParams = {
        MetricData: [{
            MetricName: 'STRING_VALUE',
            Dimensions: [{
                Name: 'STRING_VALUE',
                Value: 'STRING_VALUE'
            }],
            Timestamp: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
            Unit: "None",
            Value: parseInt(queueAttributes.ApproximateNumberOfMessages) / ecsServices[0].desiredCount,
        }],
        Namespace: 'STRING_VALUE'
    };

}
