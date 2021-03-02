import * as cdk from "@aws-cdk/core";
import * as _s3 from "@aws-cdk/aws-s3";

import * as _cognito from "@aws-cdk/aws-cognito";

import { CognitoRole } from "./cognitoRole";

export interface ICognito extends cdk.StackProps {
  imageBucket: _s3.Bucket;
}

export class Cognito extends cdk.Construct {
  private _userPool: _cognito.UserPool;
  public get userPool() {
    return this._userPool;
  }

  constructor(scope: cdk.Construct, id: string, props: ICognito) {
    super(scope, id);

    let { imageBucket } = props;

    // Directory of users
    this._userPool = new _cognito.UserPool(this, "user-pool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // required for making unauthenticated api calls (signUp, signIn, forgot password)
    const userPoolClient = new _cognito.UserPoolClient(
      this,
      "user-pool-client",
      {
        userPool: this.userPool,
        generateSecret: false,
        
      }
    );

    // Provide temp. credentials for auth and unauth(guest) users.
    // Temp credentials are associated with an IAM roles which defines a set of permissions (policies) to access AWS resources

    // Configure Cognito Identity Pool to accept users federated with Cognito User Pool by supplying the User Pool Name and User Pool Client ID.
    const identityPool = new _cognito.CfnIdentityPool(this, "identity-pool", {
      
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
      
    });

    // role assumed by identity when authenticated
    const authenticatedRole = new CognitoRole(this, "authenticated-role", {
      imageBucket: imageBucket,
      identityPool: identityPool,
    });

    new _cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPool-Role-Attachment",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: authenticatedRole.role.roleArn },
      }
    );

    // outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });
  }
}
