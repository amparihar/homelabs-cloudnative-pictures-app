const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient();

exports.run = async (event, context) => {
  const iKey = decodeS3Key(event.imageKey);
  const params = {
    TableName: process.env.IMAGE_TABLE,
    KeyConditionExpression: "ikey=:ikey",
    ExpressionAttributeValues: {
      ":ikey": iKey,
    },
  };

  try {
    const queryResponse = await db.query(params).promise();
    return queryResponse.Items;
  } catch (error) {
    console.log(`There was an error while querying image for ${iKey}`);
    console.log("error", error);
    console.log("params", params.ExpressionAttributeValues);
    throw new Error(`No image or error for ${iKey}`);
  }
};

const decodeS3Key = (key) => {
  return key.replace("%3A", ":");
};
