import { ListTasksCommand, RunTaskCommand } from "@aws-sdk/client-ecs";
import { AWS_REGION, ecsClient } from "../config/aws";

const ECS_CLUSTER = process.env.ECS_CLUSTER!;
const TASK_DEFINITION = process.env.ECS_TASK_DEFINITION!;
const ECS_TASK_FAMILY = process.env.ECS_TASK_FAMILY! || "video-processor-task-defination-eduapp"; // ✅ ONLY FAMILY


const ECS_SUBNETS = process.env.ECS_SUBNETS!.split(",");
const ECS_SECURITY_GROUPS = process.env.ECS_SECURITY_GROUPS!.split(",");

const TEMP_BUCKET = process.env.VIDEO_BUCKET_TEMP!;
const PROD_BUCKET = process.env.VIDEO_BUCKET_PROD!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;
const MONGODB_URI = process.env.MONGODB_URI!;
const DYNAMO_TABLE = process.env.DYNAMO_TABLE! || "video-processing-jobs";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

interface RunVideoTaskParams {
  key: string;
  videoId: string;
  receiptHandle: string;
}

export async function runVideoTask({
  key,
  draftId,
  receiptHandle,
}: {
  key: string;
  draftId: string;
  receiptHandle: string;
}) {
  return ecsClient.send(
    new RunTaskCommand({
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
              { name: "VIDEO_KEY", value: key },
              { name: "DRAFT_ID", value: draftId },
              { name: "SQS_RECEIPT_HANDLE", value: receiptHandle },

              { name: "VIDEO_BUCKET_TEMP", value: process.env.VIDEO_BUCKET_TEMP! },
              { name: "VIDEO_BUCKET_PROD", value: process.env.VIDEO_BUCKET_PROD! },
              { name: "AWS_REGION", value: process.env.AWS_REGION! },
              { name: "MONGODB_URI", value: process.env.MONGODB_URI! },
              { name: "MONGODB_DB_NAME", value: process.env.MONGODB_DB_NAME! },
              { name: "DYNAMO_TABLE", value: process.env.DYNAMO_TABLE! },
            ],
          },
        ],
      },
    })
  );
}


export async function hasActiveVideoTask(): Promise<boolean> {
  const running = await ecsClient.send(
    new ListTasksCommand({
      cluster: ECS_CLUSTER,
      family: ECS_TASK_FAMILY,
      desiredStatus: "RUNNING",
    })
  );

  if (running.taskArns?.length) return true;

  const pending = await ecsClient.send(
    new ListTasksCommand({
      cluster: ECS_CLUSTER,
      family: ECS_TASK_FAMILY,
      desiredStatus: "PENDING",
    })
  );

  return (pending.taskArns?.length ?? 0) > 0;
}
