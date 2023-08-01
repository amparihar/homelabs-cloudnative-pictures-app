const AWS = require("aws-sdk"),
    sqs = new AWS.SQS(),
    ecs = new AWS.ECS(),
    cloudwatch = new AWS.CloudWatch();

module.exports.run = async (event, context) => {
    var queueAttributes,
        ecsServices;

    const sqsParams = {
        QueueUrl: process.env.QUEUE_URL,
        AttributeNames: [
            "ApproximateNumberOfMessages",
            "ApproximateNumberOfMessagesDelayed",
            "ApproximateNumberOfMessagesNotVisible"
        ]
    };

    ({ Attributes: queueAttributes = { ApproximateNumberOfMessages: "0" } } = await sqs.getQueueAttributes(sqsParams).promise());

    const ecsParams = {
        services: [process.env.ECS_SERVICE_NAME],
        cluster: process.env.ECS_CLUSTER_NAME
    };
    ({ services: ecsServices = [{ desiredCount: 0 }] } = await ecs.describeServices(ecsParams).promise());


    // Cloud Watch putMerticdata
    var cwParams = {
        MetricData: [{
            MetricName: 'ApproximateNumberOfMessages',
            Dimensions: [{
                Name: 'ClusterName',
                Value: process.env.ECS_CLUSTER_NAME
            }, {
                Name: 'ServiceName',
                Value: process.env.ECS_SERVICE_NAME
            }],
            Timestamp: new Date,
            Unit: "None",
            Value: ecsServices[0].desiredCount > 0 ? (parseInt(queueAttributes.ApproximateNumberOfMessages) / ecsServices[0].desiredCount) : 0,
        }],
        Namespace: 'ECS'
    };
    
    const putMetricResponse = await cloudwatch.putMetricData(cwParams).promise();
    console.log("putMetricResponse", putMetricResponse);

}