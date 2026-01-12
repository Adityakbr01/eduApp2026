// deploy.ts
import { exec } from "child_process";
import util from "util";
import {
  ECSClient,
  RegisterTaskDefinitionCommand,
  UpdateServiceCommand,
} from "@aws-sdk/client-ecs";

const execAsync = util.promisify(exec);

const REGION = "us-east-1";
const ECR_REPO = "121635831580.dkr.ecr.us-east-1.amazonaws.com/video-worker-repo";
const IMAGE_TAG = `${Date.now()}`; // har deploy ke liye unique tag
const TASK_FAMILY = "video-processing-task-Defination";
const CLUSTER_NAME = "video-processing-cluster";
const SERVICE_NAME = "video-worker-service";


const ecs = new ECSClient({ region: REGION });

async function dockerBuildPush() {
  console.log(`🔹 Building Docker image ${ECR_REPO}:${IMAGE_TAG}`);
  await execAsync(`docker build -t ${ECR_REPO}:${IMAGE_TAG} .`);

  console.log(`🔹 Logging in to ECR`);
  const loginCmd = `aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REPO.split("/")[0]}`;
  await execAsync(loginCmd);

  console.log(`🔹 Pushing Docker image to ECR`);
  await execAsync(`docker push ${ECR_REPO}:${IMAGE_TAG}`);
}

async function updateTaskDefinition() {
  console.log("🔹 Registering new ECS task definition");

  // Fetch the current task definition
  const { taskDefinition } = await ecs.send(
    new RegisterTaskDefinitionCommand({
      family: TASK_FAMILY,
      executionRoleArn: `arn:aws:iam::121635831580:role/ecsTaskExecutionRole`,
       taskRoleArn: "arn:aws:iam::121635831580:role/video-worker-task-role",
      containerDefinitions: [
        {
          name: "video-processing-Container",
          image: `${ECR_REPO}:${IMAGE_TAG}`,
          essential: true,
          memory: 2048,
          cpu: 1024,
          portMappings: [{ containerPort: 80, protocol: "tcp" }],
          logConfiguration: {
            logDriver: "awslogs",
            options: {
              "awslogs-group": `/ecs/${TASK_FAMILY}`,
              "awslogs-region": REGION,
              "awslogs-stream-prefix": "ecs",
            },
          },
        },
      ],
      requiresCompatibilities: ["FARGATE"],
      networkMode: "awsvpc",
      memory: "2048",
      cpu: "1024",
    })
  );

  return taskDefinition?.taskDefinitionArn!;
}

async function updateService(taskDefArn: string) {
  console.log("🔹 Updating ECS service to use new task definition");
  await ecs.send(
    new UpdateServiceCommand({
      cluster: CLUSTER_NAME,
      service: SERVICE_NAME,
      taskDefinition: taskDefArn,
      forceNewDeployment: true,
    })
  );
}

(async () => {
  try {
    await dockerBuildPush();
    const taskDefArn = await updateTaskDefinition();
    await updateService(taskDefArn);
    console.log("✅ Deployment completed successfully!");
  } catch (err) {
    console.error("❌ Deployment failed", err);
    process.exit(1);
  }
})();
