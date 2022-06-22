# Serverless multiple machine learning inferece

You can take advantage of Lambda benefits for machine learning model inference with large libraries or pre-trained models.

## Architecture overview

The following diagram illustrates the architecture of the solution.

![Architecture overview](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4v1of2nlckfatsr8cuen.png)

## AWS services

- Amazon VPC ( requires for Amazon EFS )
- Amazon S3
- Amazon EFS
- AWS Lambda
- Amazon API Gateway

## Requeriments

- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [CDK V2](https://www.npmjs.com/package/aws-cdk)
- [node@v16.x.x](https://nodejs.org/es/download/)

## Step to deploy

- Configure your AWS CLI credentials. ![here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
- In `bin/main.ts` configure your AWS account number and AWS region
- `npm i` install dependencies
- `cdk bootstrap` for the first time
- `cdk deploy ServerlessMultipleMLModelStack`

## Useful commands [CDK V2]

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
