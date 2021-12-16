const AWS = require("aws-sdk");
module.exports.run = async (event, context) => {
    var sqs = new AWS.SQS(),
        ecs = new AWS.ECS();
    
    var sqsParams = {
  QueueUrl: process.env.QUEUE_NAME,
  AttributeNames: [
    "ApproximateNumberOfMessagesVisible"
    ]
};
sqs.getQueueAttributes(sqsParams, function(err, data) {
  if (err) console.log(err, err.message); // an error occurred
  else     console.log("QueueAttributes ", data);           // successful response
});
    
  var ecsParams = {
  services: [
     process.env.ECS_SERVICE
  ]
 };
    ecs.describeServices(params, function(err, data) {
        if (err) console.log(err, err.message); // an error occurred
        else     console.log("ECS Service Attributes", data, data.services[0].desiredCount);           // successful response
    });
    
}
