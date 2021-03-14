#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { HomeLabsPipStack } from "../lib";

const app = new cdk.App();
new HomeLabsPipStack(app, "homelabs-pip-stack-dev");
