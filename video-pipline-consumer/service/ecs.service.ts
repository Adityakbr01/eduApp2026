import { ListTasksCommand, RunTaskCommand } from "@aws-sdk/client-ecs";
import { ecsClient } from "../config/aws";

const ECS_CLUSTER = process.env.ECS_CLUSTER!;
const TASK_DEFINITION = process.env.ECS_TASK_DEFINITION!;
const ECS_TASK_FAMILY = process.env.ECS_TASK_FAMILY!;

const ECS_SUBNETS = process.env.ECS_SUBNETS!.split(",");
const ECS_SECURITY_GROUPS = process.env.ECS_SECURITY_GROUPS!.split(",");


export async function runVideoTask({
  key,
  receiptHandle,
}: {
  key: string;
  receiptHandle: string;
}) {
  console.log("🚀 [runVideoTask] Starting ECS task");
  console.log("📦 VIDEO_KEY:", key);
  console.log("🧾 ReceiptHandle:", receiptHandle);


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
            { name: "VIDEO_KEY", value: key },
            { name: "SQS_RECEIPT_HANDLE", value: receiptHandle },
            { name: "SQS_QUEUE_URL", value: process.env.SQS_QUEUE_URL },
            { name: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID },
            { name: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY },

            { name: "VIDEO_BUCKET_TEMP", value: process.env.VIDEO_BUCKET_TEMP },
            { name: "VIDEO_BUCKET_PROD", value: process.env.VIDEO_BUCKET_PROD },
            { name: "AWS_REGION", value: process.env.AWS_REGION },
            { name: "MONGODB_URI", value: process.env.MONGODB_URI },
            { name: "MONGODB_DB_NAME", value: process.env.MONGODB_DB_NAME },
            { name: "DYNAMO_TABLE", value: process.env.DYNAMO_TABLE },
          ].filter(e => e.value), // 🔥 prevent undefined being sent
        },
      ],
    },
  });

  const res = await ecsClient.send(command);

  console.log("✅ ECS RunTask response:", {
    taskArns: res.tasks?.map(t => t.taskArn),
    failures: res.failures,
  });

  return res;
}

/**
 * ⏳ Check if ANY video task is active
 */
export async function hasActiveVideoTask(): Promise<boolean> {
  console.log("🔍 Checking active ECS tasks...");

  const running = await ecsClient.send(
    new ListTasksCommand({
      cluster: ECS_CLUSTER,
      family: ECS_TASK_FAMILY,
      desiredStatus: "RUNNING",
    })
  );

  console.log("🏃 RUNNING tasks:", running.taskArns?.length ?? 0);

  if (running.taskArns?.length) return true;

  const pending = await ecsClient.send(
    new ListTasksCommand({
      cluster: ECS_CLUSTER,
      family: ECS_TASK_FAMILY,
      desiredStatus: "PENDING",
    })
  );

  console.log("⏳ PENDING tasks:", pending.taskArns?.length ?? 0);

  return (pending.taskArns?.length ?? 0) > 0;
}
