#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ServerlessMultipleMLModelStack } from "../lib/serverless-multiple-ml-model-stack";

const app = new cdk.App();

new ServerlessMultipleMLModelStack(app, "ServerlessMultipleMLModelStack", {
  env: {
    account: process.env.ACCOUNT,
    region: process.env.REGION,
  },
});
