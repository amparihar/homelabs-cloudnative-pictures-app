# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* cdk init app --language typescript

* `npm run build`           compile typescript to js
* `npm run watch`           watch for changes and compile
* `npm run test`            perform the jest unit tests
* `cdk deploy`              deploy this stack to your default AWS account/region
* `cdk diff`                compare deployed stack with current state
* `cdk synth >> cfn.txt`    emits the synthesized CloudFormation template
* 

* `aws s3 cp . s3://<name>/private/ --recursive`       
* `aws s3 rm  s3://<name> --recursive` 
* `aws dynamodb scan  --table-name <table-name>` 
