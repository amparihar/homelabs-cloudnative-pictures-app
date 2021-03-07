import * as cdk from "@aws-cdk/core";

import * as _logs from "@aws-cdk/aws-logs";

export class CloudwatchLogs extends cdk.Construct {
  private _rekFnLogGroup: _logs.LogGroup;
  public get rekFnLogGroup(): _logs.LogGroup {
    return this._rekFnLogGroup;
  }

  constructor(scope: cdk.Construct, id: string, props?: any) {
    super(scope, id);

    this._rekFnLogGroup = new _logs.LogGroup(this, "rekFn-logs", {
      retention: _logs.RetentionDays.THREE_DAYS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
