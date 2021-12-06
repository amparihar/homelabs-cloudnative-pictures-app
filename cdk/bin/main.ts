#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";

import { HomeLabsPipStack } from "../lib";
import { S3StaticWebStack } from "../lib/s3StaticWeb"

const app = new cdk.App();
new HomeLabsPipStack(app, "homelabs-pip-backend-stack");
new S3StaticWebStack(app, "homelabs-pip-frontend-stack");
