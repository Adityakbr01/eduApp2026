import {
  ListTasksCommand,
  RunTaskCommand,
} from "@aws-sdk/client-ecs";
import { ecsClient } from "../config/aws";

const ECS_CLUSTER = process.env.ECS_CLUSTER!;
const TASK_DEFINITION = process.env.ECS_TASK_DEFINITION!;
const TASK_FAMILY = process.env.ECS_TASK_FAMILY!;

const ECS_SUBNETS = process.env.ECS_SUBNETS!.split(",");
const ECS_SECURITY_GROUPS = process.env.ECS_SECURITY_GROUPS!.split(",");

const TEMP_BUCKET = process.env.VIDEO_BUCKET_TEMP!;
const PROD_BUCKET = process.env.VIDEO_BUCKET_PROD!;


if(!ECS_CLUSTER || !TASK_DEFINITION || !TASK_FAMILY || !ECS_SUBNETS.length || !ECS_SECURITY_GROUPS.length || !TEMP_BUCKET || !PROD_BUCKET){
  throw new Error("One or more ECS or Bucket environment variables are missing");
}


interface RunVideoTaskParams {
  key: string;
  videoId: string;
}

export async function runVideoTask({ key, videoId }: RunVideoTaskParams) {
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
            { name: "VIDEO_BUCKET_TEMP", value: TEMP_BUCKET },
            { name: "VIDEO_BUCKET_PROD", value: PROD_BUCKET },
            { name: "VIDEO_KEY", value: key },
            { name: "VIDEO_ID", value: videoId },
            { name: "AWS_REGION", value: process.env.AWS_REGION! },
          ],
        },
      ],
    },
  });

  return ecsClient.send(command);
}

export async function hasRunningVideoTask() {
  const res = await ecsClient.send(
    new ListTasksCommand({
      cluster: ECS_CLUSTER,
      family: TASK_FAMILY,
      desiredStatus: "RUNNING",
    })
  );

  return (res.taskArns?.length || 0) > 0;
}
