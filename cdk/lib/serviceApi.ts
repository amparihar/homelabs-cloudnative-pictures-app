import * as cdk from "@aws-cdk/core";

import * as _apigw from "@aws-cdk/aws-apigateway";
import * as _lambda from "@aws-cdk/aws-lambda";

export interface IServiceApiProps extends cdk.StackProps {
  serviceFn: {
    getImageFn: _lambda.IFunction;
    deleteImageFn: _lambda.IFunction;
  };
  userPoolArns: string[];
}

export class ServiceApi extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: IServiceApiProps) {
    super(scope, id);

    let {
      serviceFn: { getImageFn, deleteImageFn },
      userPoolArns,
    } = props;

    const serviceApi = new _apigw.RestApi(this, "image-service-api", {
      description: "Service api for image operations",
      endpointTypes: [_apigw.EndpointType.REGIONAL],
      deployOptions: {
        stageName: "dev",
      },
      restApiName: `homeLabs-pip-service-api`,
    });

    const apiAuthorizer = new _apigw.CfnAuthorizer(this, "service-api-auth", {
      name: "service-api-authorizer",
      providerArns: userPoolArns,
      restApiId: serviceApi.restApiId,
      type: _apigw.AuthorizationType.COGNITO,
      identitySource: "method.request.header.Authorization",
    });

    const getImageServiceApiRequestValidationModel = new _apigw.Model(
      this,
      "serviceApi-requestMapping-model",
      {
        contentType: "application/json",
        modelName: "GetImageServiceApiRequestValidationModel",
        restApi: serviceApi,
        schema: {
          schema: _apigw.JsonSchemaVersion.DRAFT4,
          type: _apigw.JsonSchemaType.OBJECT,
          properties: {
            id: { type: _apigw.JsonSchemaType.STRING, minLength: 1 },
          },
          required: ["id"],
        },
      }
    );

    const getImageIntegration = new _apigw.LambdaIntegration(getImageFn, {
      proxy: false,
      passthroughBehavior: _apigw.PassthroughBehavior.WHEN_NO_TEMPLATES,
      requestTemplates: {
        "application/json": `#set($root = $input.path('$'))
            {
              "imageId":"$root.id"
            }`,
      },
      integrationResponses: [
        {
          statusCode: "200",
          responseTemplates: {
            "application/json": `{"status": "Ok", "data": $util.parseJson($input.body)}`,
          },

          responseParameters: {
            "method.response.header.Content-Type": "'application/json'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
        },
        {
          selectionPattern: "(\n|.)+",
          statusCode: "500",
          responseTemplates: {
            "application/json": JSON.stringify({
              status: "Error",
              result: "$util.escapeJavaScript($input.path('$.errorMessage'))",
            }),
          },
          responseParameters: {
            "method.response.header.Content-Type": "'application/json'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
        },
      ],
    });

    const deleteImageIntegration = new _apigw.LambdaIntegration(deleteImageFn, {
      proxy: false,
      requestParameters: {
        "integration.request.querystring.id": "method.request.querystring.id",
      },
      passthroughBehavior: _apigw.PassthroughBehavior.WHEN_NO_TEMPLATES,
      requestTemplates: {
        "application/json": `
            {
              "imageId":"$input.params('id')"
            }`,
      },
      integrationResponses: [
        {
          statusCode: "200",
          responseTemplates: {
            "application/json": `{"status": "Ok", "data": $util.parseJson($input.body)}`,
          },

          responseParameters: {
            "method.response.header.Content-Type": "'application/json'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
        },
        {
          selectionPattern: "(\n|.)+",
          statusCode: "500",
          responseTemplates: {
            "application/json": JSON.stringify({
              status: "Error",
              result: "$util.escapeJavaScript($input.path('$.errorMessage'))",
            }),
          },
          responseParameters: {
            "method.response.header.Content-Type": "'application/json'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
        },
      ],
    });

    const serviceApiImageRoot = serviceApi.root.addResource("image", {
      defaultCorsPreflightOptions: {
        allowOrigins: _apigw.Cors.ALL_ORIGINS,
        statusCode: 200,
      },
    });

    serviceApi.addGatewayResponse("4XX", {
      type: _apigw.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
      },
    });

    // cors
    // serviceApiImageRoot.addMethod(
    //   "OPTIONS",
    //   new _apigw.MockIntegration({
    //     integrationResponses: [
    //       {
    //         statusCode: "200",
    //         responseParameters: {
    //           "method.response.header.Access-Control-Allow-Headers":
    //             "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
    //           "method.response.header.Access-Control-Allow-Origin": "'*'",
    //           "method.response.header.Access-Control-Allow-Methods":
    //             "'OPTIONS,GET,PUT,POST,DELETE'",
    //         },
    //       },
    //     ],
    //     passthroughBehavior: _apigw.PassthroughBehavior.NEVER,
    //     requestTemplates: {
    //       "application/json": '{"statusCode": 200}',
    //     },
    //   }),
    //   {
    //     methodResponses: [
    //       {
    //         statusCode: "200",
    //         responseParameters: {
    //           "method.response.header.Access-Control-Allow-Headers": true,
    //           "method.response.header.Access-Control-Allow-Methods": true,
    //           "method.response.header.Access-Control-Allow-Origin": true,
    //         },
    //       },
    //     ],
    //   }
    // );

    serviceApiImageRoot.addMethod("POST", getImageIntegration, {
      authorizer: { authorizerId: apiAuthorizer.ref },
      authorizationType: _apigw.AuthorizationType.COGNITO,
      requestValidatorOptions: {
        validateRequestBody: true,
        requestValidatorName: "get-image-request-body-validator",
      },
      requestModels: {
        "application/json": getImageServiceApiRequestValidationModel,
      },
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
        {
          statusCode: "500",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    });

    const qsRequestValidator = new _apigw.RequestValidator(
      this,
      "querystring-request-validator",
      {
        restApi: serviceApi,
        validateRequestParameters: true,
        requestValidatorName: "querystring-request-validator",
      }
    );

    serviceApiImageRoot.addMethod("DELETE", deleteImageIntegration, {
      authorizer: { authorizerId: apiAuthorizer.ref },
      authorizationType: _apigw.AuthorizationType.COGNITO,
      requestParameters: {
        "method.request.querystring.id": true,
      },
      requestValidator: qsRequestValidator,

      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
        {
          statusCode: "500",
          responseParameters: {
            "method.response.header.Content-Type": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    });

    // new cdk.CfnOutput(this, "service-api", {
    //   value: serviceApi.url,
    // });
  }
}
