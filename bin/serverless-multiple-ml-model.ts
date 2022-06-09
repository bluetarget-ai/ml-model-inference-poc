#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ServerlessMultipleMlModelStack } from '../lib/serverless-multiple-ml-model-stack';

const app = new cdk.App();
new ServerlessMultipleMlModelStack(app, 'ServerlessMultipleMlModelStack');
