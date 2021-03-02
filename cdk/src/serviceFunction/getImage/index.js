const AWS = require("aws-sdk");

const db = new AWS.DynamoDB.DocumentClient();

module.exports.run = async (event, context) => {
  const params = {
    TableName: process.env.IMAGE_TABLE,
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": event.imageId,
    },
  };

  try {
    const queryResponse = await db.query(params).promise();
    return queryResponse.Items;
  } catch (error) {
    console.log(`There was an error while querying image for ${event.imageId}`);
    console.log("error", error);
    console.log("params", params.ExpressionAttributeValues);
    throw new Error(`No image or error for ${event.imageId}`);
  }
};
