#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { App } from '../lib/ecs-stack';

const app = new App();

