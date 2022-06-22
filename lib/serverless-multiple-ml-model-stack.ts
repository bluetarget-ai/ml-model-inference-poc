import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Bucket, BucketEncryption, EventType } from "aws-cdk-lib/aws-s3";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";

import { Construct } from "constructs";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { FileSystem, ThroughputMode } from "aws-cdk-lib/aws-efs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";

import {
  FileSystem as LambdaFileSystem,
  DockerImageFunction,
  DockerImageCode,
} from "aws-cdk-lib/aws-lambda";

export class ServerlessMultipleMLModelStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, "MLVpc");

    const fs = new FileSystem(this, "MLFileSystem", {
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
      throughputMode: ThroughputMode.BURSTING,
      fileSystemName: "ml-models-efs",
    });

    const accessPoint = fs.addAccessPoint("LambdaAccessPoint", {
      createAcl: {
        ownerGid: "1001",
        ownerUid: "1001",
        permissions: "750",
      },
      path: "/export/lambda",
      posixUser: {
        gid: "1001",
        uid: "1001",
      },
    });

    const bucket = new Bucket(this, "MLModelsBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      bucketName: "bluetarget.models",
    });

    const MODEL_DIR = "/mnt/ml";

    const loadFunction = new NodejsFunction(this, "HandleModelUploaded", {
      functionName: "handle-model-uploaded",
      entry: `${__dirname}/functions/model-uploaded/handler.ts`,
      handler: "handler",
      environment: {
        MACHINE_LEARNING_MODELS_BUCKET_NAME: bucket.bucketName,
        MODEL_DIR,
      },
      vpc,
      filesystem: LambdaFileSystem.fromEfsAccessPoint(accessPoint, MODEL_DIR),
    });

    //Permission settings
    bucket.grantRead(loadFunction);

    loadFunction.addEventSource(
      new S3EventSource(bucket, {
        events: [EventType.OBJECT_CREATED],
      })
    );

    const inferenceFunction = new DockerImageFunction(this, "InferenceModel", {
      functionName: "inference-model",
      code: DockerImageCode.fromImageAsset(
        `${__dirname}/functions/model-inference`
      ),
      environment: {
        MODEL_DIR,
      },
      memorySize: 10240,
      timeout: Duration.seconds(30),
      vpc,
      filesystem: LambdaFileSystem.fromEfsAccessPoint(accessPoint, MODEL_DIR),
    });

    const api = new RestApi(this, "ApiGateway", {
      restApiName: "inference-api",
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowMethods: ["*"],
        allowOrigins: ["*"],
      },
    });

    const todos = api.root.addResource("inference");

    todos.addMethod(
      "POST",
      new LambdaIntegration(inferenceFunction, { proxy: true })
    );
  }
}
