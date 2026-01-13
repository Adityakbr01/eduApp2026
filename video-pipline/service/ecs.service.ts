import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { AWS_REGION, ecsClient } from "../config/aws";

const ECS_CLUSTER = process.env.ECS_CLUSTER!;
const TASK_DEFINITION = process.env.ECS_TASK_DEFINITION!;

const ECS_SUBNETS = process.env.ECS_SUBNETS!.split(",");
const ECS_SECURITY_GROUPS = process.env.ECS_SECURITY_GROUPS!.split(",");

const TEMP_BUCKET = process.env.VIDEO_BUCKET_TEMP!;
const PROD_BUCKET = process.env.VIDEO_BUCKET_PROD!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;
const MONGODB_URI = process.env.MONGODB_URI!;
const DYNAMO_TABLE = process.env.DYNAMO_TABLE! || "video-processing-jobs";

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

interface RunVideoTaskParams {
  key: string;
  videoId: string;
  receiptHandle: string;
}

export async function runVideoTask({ key, videoId,receiptHandle }: RunVideoTaskParams) {
  const command = new RunTaskCommand({
    cluster: ECS_CLUSTER,
    taskDefinition: TASK_DEFINITION,
    launchType: "FARGATE",

    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ECS_SUBNETS,
        securityGroups: ECS_SECURITY_GROUPS,
        assignPublicIp: "ENABLED",
      },
    },

    overrides: {
      containerOverrides: [
        {
          name: "video-worker",
          environment: [
            {name:"AWS_ACCESS_KEY_ID,", value:process.env.AWS_ACCESS_KEY_ID!},
            {name:"AWS_SECRET_ACCESS_KEY", value:process.env.AWS_SECRET_ACCESS_KEY!},
            { name: "VIDEO_BUCKET_TEMP", value: TEMP_BUCKET },
            { name: "VIDEO_BUCKET_PROD", value: PROD_BUCKET },
            { name: "VIDEO_KEY", value: key },
            { name: "VIDEO_ID", value: videoId },
            { name: "AWS_REGION", value: AWS_REGION },
            { name: "MONGODB_URI", value: MONGODB_URI },
            { name: "MONGODB_DB_NAME", value: MONGODB_DB_NAME },
            { name: "DYNAMO_TABLE", value: DYNAMO_TABLE },
            {name:"SQS_QUEUE_URL", value: SQS_QUEUE_URL},
            {
              name: "SQS_RECEIPT_HANDLE",
              value: receiptHandle,
            },
          ],
        },
      ],
    },
  });

  return ecsClient.send(command);
}
