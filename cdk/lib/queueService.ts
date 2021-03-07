import * as cdk from "@aws-cdk/core";

import * as _sqs from "@aws-cdk/aws-sqs";

export class QueueService extends cdk.Construct {
  private _imageQueue: _sqs.Queue;
  public get imageQueue(): _sqs.Queue {
    return this._imageQueue;
  }

  constructor(scope: cdk.Construct, id: string, props?: any) {
    super(scope, id);

    this._imageQueue = new _sqs.Queue(this, "imageQueue", {
      visibilityTimeout: cdk.Duration.seconds(30), // this is the default
      receiveMessageWaitTime: cdk.Duration.seconds(20), // long polling
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deadLetterQueue: {
        maxReceiveCount: 2,
        queue: new _sqs.Queue(this, "dlImageQueue", {
          visibilityTimeout: cdk.Duration.seconds(30), // this is the default
          receiveMessageWaitTime: cdk.Duration.seconds(20), // long polling
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      },
    });
  }
}
