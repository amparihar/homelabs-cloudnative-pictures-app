import * as cdk from "@aws-cdk/core";
import * as _iam from "@aws-cdk/aws-iam";
import * as _cognito from "@aws-cdk/aws-cognito";

export interface ICognito extends cdk.StackProps {
  imageBucketArn: string;
}

export class Cognito extends cdk.Construct {
  private _userPool: _cognito.UserPool;
  public get userPool() {
    return this._userPool;
  }

  constructor(scope: cdk.Construct, id: string, props: ICognito) {
    super(scope, id);

    const { imageBucketArn } = props;

    // Directory of users
    this._userPool = new _cognito.UserPool(this, "user-pool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: true },
      autoVerify: { email: false },
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
    // For each identity type, there is an assigned role.
    // This role has a policy attached to it which dictates which AWS services that role can access.
    // When Amazon Cognito receives a request, the service will determine the identity type,
    // determine the role assigned to that identity type, and use the policy attached to that role to respond.
    // By modifying a policy or assigning a different role to an identity type,
    // you can control which AWS services an identity type can access.

    // This policy defines that we want to allow federated users from cognito-identity.amazonaws.com to assume this role.
    // Additionally, we make the restriction that the aud(recipient) of the token, in our case the identity pool ID, matches our identity pool.
    // Finally, we specify that the amr of the token contains the value authenticated.

    const role = new _iam.Role(this, "auth_role", {
      assumedBy: new _iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com", // Principal
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity" // Action
      ),
    });

    // Define access policies for the authenticated user

    role.addToPolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["s3:GetObject", "s3:PutObject"],
        resources: [
          imageBucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
        ],
      })
    );

    role.addToPolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["s3:ListBucket"],
        resources: [imageBucketArn],
        conditions: {
          StringLike: {
            "s3:prefix": ["/private/${cognito-identity.amazonaws.com:sub}/*"],
          },
        },
      })
    );

    new _cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPool-Role-Attachment",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: role.roleArn },
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
