import * as cdk from "@aws-cdk/core";
import * as _iam from "@aws-cdk/aws-iam";

import * as _cognito from "@aws-cdk/aws-cognito";

import { CognitoRole } from "./cognitoRole";

export interface ICognito extends cdk.StackProps {}

export class Cognito extends cdk.Construct {
  private _userPool: _cognito.UserPool;
  public get userPool() {
    return this._userPool;
  }

  private _role: _iam.Role;
  public get role() {
    return this._role;
  }

  constructor(scope: cdk.Construct, id: string, props?: ICognito) {
    super(scope, id);

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
      identityPool: identityPool,
    });

    this._role = authenticatedRole.role;

    new _cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPool-Role-Attachment",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: this._role.roleArn },
      }
    );

    // outputs
    new cdk.CfnOutput(this, "UserPoolId", {
      description: "UserPoolId",
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      description: "UserPoolClientId",
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, "IdentityPoolId", {
      description: "IdentityPoolId",
      value: identityPool.ref,
    });
  }
}
