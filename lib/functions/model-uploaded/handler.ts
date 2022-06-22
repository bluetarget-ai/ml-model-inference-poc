import { S3CreateEvent, S3EventRecord } from "aws-lambda";
import { S3 } from "aws-sdk";
import { writeFileSync } from "fs";
import { basename } from "path";

const s3 = new S3();

const FS_PATH = process.env.MODEL_DIR;

export const handler = async (event: S3CreateEvent): Promise<void> => {
  const promises = event.Records.map(record => processRecord(record));
  await Promise.all(promises);
};

const processRecord = async (record: S3EventRecord): Promise<void> => {
  const file = await getFile(record.s3.object.key);
  const fileName = basename(record.s3.object.key);

  writeFileSync(`${FS_PATH}/${fileName}`, file);
};

export const getFile = async (
  key: string,
  bucket: string = process.env.MACHINE_LEARNING_MODELS_BUCKET_NAME!
): Promise<S3.Body> => {
  const params: S3.GetObjectRequest = {
    Bucket: bucket,
    Key: key,
  };

  const file = await s3.getObject(params).promise();

  if (!file.Body) {
    throw new Error(`File not found ${key} in bucket ${bucket}`);
  }

  return file.Body;
};
