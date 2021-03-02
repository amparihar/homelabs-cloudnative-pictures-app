const AWS = require("aws-sdk"),
  uuid = require("uuid");

const rekognition = new AWS.Rekognition(),
  s3 = new AWS.S3(),
  db = new AWS.DynamoDB.DocumentClient();

module.exports.run = async (event, context, lambdaCallback) => {
  try {
    const records = event.Records;

    for (let index = 0; index < records.length; index++) {
      const record = records[index],
        name = record.s3.bucket.name,
        key = record.s3.object.key;

      const labels = await detectImageLabels(name, key);
      await saveImageLabels(key, labels.Labels);
      lambdaCallback(null);
    }
  } catch (err) {
    lambdaCallback(err);
  }
};

const detectImageLabels = async (name, key) => {
  const request = {
    Image: {
      S3Object: {
        Bucket: name,
        Name: key,
      },
    },
    MinConfidence: 80,
  };
  const labels = await rekognition.detectLabels(request).promise();
  return labels;
};

const saveImageLabels = async (key, labels) => {
  if (!labels.length) return;
  const params = {
    TableName: process.env.IMAGE_TABLE,
    Item: {
      id: uuid.v4(),
      image: key,
      labels: labels.map((label) => label.Name),
    },
  };

  await db.put(params).promise();
};

const serialize = (object) => {
  return JSON.stringify(object, null, 2);
};
