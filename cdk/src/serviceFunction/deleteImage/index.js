const AWS = require("aws-sdk");

const s3 = new AWS.S3(),
  db = new AWS.DynamoDB.DocumentClient();

exports.run = async (event, context) => {
  try {
    const imageRow = await getImageFromTable(event.imageId);
    const key = imageRow[0].image;
    await deleteFromBucket(key);
    await deleteFromTable(event.imageId);
  } catch (ex) {
    throw new Error(ex.message);
  }
};

const getImageFromTable = async (imageId) => {
  const params = {
    TableName: process.env.IMAGE_TABLE,
    KeyConditionExpression: "id=:id",
    ExpressionAttributeValues: {
      ":id": imageId,
    },
  };

  try {
    const queryResponse = await db.query(params).promise();
    return queryResponse.Items;
  } catch (error) {
    console.log(`There was an error while querying image for ${imageId}`);
    console.log("error", error);
    console.log("params", params.ExpressionAttributeValues);
    throw new Error(`No image or error occured`);
  }
};

const deleteFromTable = async (imageId) => {
  const params = {
    TableName: process.env.IMAGE_TABLE,
    Key: {
      id: imageId,
    },
  };

  try {
    const queryResponse = await db.delete(params).promise();
    return "Image deleted";
  } catch (error) {
    console.log(`There was an error while deleting image data for ${imageId}`);
    console.log("error", error);
    console.log("params", params.Key);
    throw new Error(`No image or error occured`);
  }
};

const deleteFromBucket = async (key) => {
  const params = {
    Bucket: process.env.IMAGE_BUCKET,
    Key: key,
  };
  try {
    return await s3.deleteObject(params).promise();
  } catch (error) {
    console.log(`There was an error while deleting image object for ${key}`);
    console.log("error", error);
    console.log("params", params.Key);
    throw new Error(`No image or error occured`);
  }
};
