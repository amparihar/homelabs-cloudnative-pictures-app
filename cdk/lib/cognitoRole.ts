import * as cdk from "@aws-cdk/core";

import * as _iam from "@aws-cdk/aws-iam";

import * as _cognito from "@aws-cdk/aws-cognito";
import { FederatedPrincipal } from "@aws-cdk/aws-iam";

export interface ICognitoRole extends cdk.StackProps {
  identityPool: _cognito.CfnIdentityPool;
}

export class CognitoRole extends cdk.Construct {
  private _role: _iam.Role;
  public get role() {
    return this._role;
  }

  constructor(scope: cdk.Construct, id: string, props: ICognitoRole) {
    super(scope, id);

    let { identityPool } = props;

    // For each identity type, there is an assigned role.
    // This role has a policy attached to it which dictates which AWS services that role can access.
    // When Amazon Cognito receives a request, the service will determine the identity type,
    // determine the role assigned to that identity type, and use the policy attached to that role to respond.
    // By modifying a policy or assigning a different role to an identity type,
    // you can control which AWS services an identity type can access.

    // This policy defines that we want to allow federated users from cognito-identity.amazonaws.com to assume this role. 
    // Additionally, we make the restriction that the aud(recipient) of the token, in our case the identity pool ID, matches our identity pool. 
    // Finally, we specify that the amr of the token contains the value authenticated.

    this._role = new _iam.Role(this, "identity_role", {
      assumedBy: new FederatedPrincipal(
        "cognito-identity.amazonaws.com", // Principal
        {
          StringEquals: {
            "cognito-identity.amazonaws:aud": [identityPool.ref],
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity" // Action
      ),
      
    });

    
  }
}
