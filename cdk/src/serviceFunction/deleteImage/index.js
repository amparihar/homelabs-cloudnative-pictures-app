const AWS = require("aws-sdk");

const s3 = new AWS.S3(),
  db = new AWS.DynamoDB.DocumentClient();

exports.run = async (event, context) => {
  const iKey = decodeS3Key(event.imageKey);
  try {
    await deleteFromBucket(iKey);
    return await deleteFromTable(iKey);
  } catch (ex) {
    throw new Error(ex.message);
  }
};

const deleteFromTable = async (key) => {
  const params = {
    TableName: process.env.IMAGE_TABLE,
    Key: {
      ikey: key,
    },
  };

  try {
    const queryResponse = await db.delete(params).promise();
    return "Image deleted";
  } catch (error) {
    console.log(`There was an error while deleting image data for ${key}`);
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

const decodeS3Key = (key) => {
  return key.replace("%3A", ":");
};

