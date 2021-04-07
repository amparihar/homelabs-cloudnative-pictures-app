const AWS = require("aws-sdk"),
  uuid = require("uuid");

const rekognition = new AWS.Rekognition(),
  s3 = new AWS.S3(),
  db = new AWS.DynamoDB.DocumentClient();

exports.run = async (event, context) => {
  try {
    const { Records: records = [] } = event;

    for (let idx = 0; idx < records.length; idx++) {
      const record = records[idx],
        body = JSON.parse(record.body) || { Records: [] },
        bodyRecords = body.Records;

      for (let jdx = 0; jdx < bodyRecords.length; jdx++) {
        const bodyRecord = bodyRecords[jdx];
        let name = bodyRecord.s3.bucket.name,
          key = decodeS3Key(bodyRecord.s3.object.key);

        const labels = await detectImageLabels(name, key);
        await saveImageLabels(key, labels.Labels);
      }
    }
  } catch (err) {
    console.log(
      `RekFn failed, ${err.message} \nMore information in CloudWatch Log Stream: ${context.logStreamName}`
    );
    throw new Error(err);
  }
};

const detectImageLabels = async (name, key) => {
  let request = {
      Image: {
        S3Object: {
          Bucket: name,
          Name: key,
        },
      },
      MinConfidence: 80,
    },
    labels = [];
  labels = await rekognition.detectLabels(request).promise();
  return labels;
};

const saveImageLabels = async (key, labels) => {
  if (!labels.length) return;
  const params = {
    TableName: process.env.IMAGE_TABLE,
    Item: {
      // id: uuid.v4(),
      ikey: key,
      labels: labels.map((label) => label.Name),
    },
  };

  await db.put(params).promise();
};

const decodeS3Key = (key) => {
  return key.replace("%3A", ":");
};
