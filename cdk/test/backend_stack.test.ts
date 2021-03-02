import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as BackendStack from '../lib';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BackendStack.BackendStackStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
