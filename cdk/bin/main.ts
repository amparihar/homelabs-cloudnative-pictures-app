#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { HomeLabsPipBackendStack as BackendStack } from "../lib";

const app = new cdk.App();
new BackendStack(app, "HomeLabs-PipBackend-Stack");
