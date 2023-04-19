import * as tf from "@tensorflow/tfjs-node-gpu";
import { PrismaClient, Job } from "@prisma/client";
import { encodeString } from "../utils/helpers";

type PickedFields = Pick<
  Job,
  | "SubmitTime"
  | "UsedMemory"
  | "ReqNProcs"
  | "ReqTime"
  | "ReqMemory"
  | "UserID"
  | "GroupID"
  | "QueueID"
  | "PartitionID"
  | "OrigSiteID"
  | "WaitTime"
  | "NProc"
  | "Status"
  | "ExecutableID"
  | "LastRunSiteID"
  | "RunTime"
>;

type Process = { [P in keyof PickedFields]-?: NonNullable<PickedFields[P]> };

const prisma = new PrismaClient();

async function train(model: tf.Sequential) {}

async function main() {
  const processes = (await prisma.job.findMany({
    take: 100,
    select: {
      SubmitTime: true,
      UsedMemory: true,
      ReqNProcs: true,
      ReqTime: true,
      ReqMemory: true,
      UserID: true,
      GroupID: true,
      QueueID: true,
      PartitionID: true,
      OrigSiteID: true,
      WaitTime: true,
      NProc: true,
      Status: true,
      ExecutableID: true,
      LastRunSiteID: true,
      RunTime: true,
    },
  })) as Process[];

  const INPUTS = processes
    .filter((process) => process.RunTime !== null)
    .map((process) => [
      process.SubmitTime,
      process.UsedMemory,
      process.ReqNProcs,
      process.ReqTime,
      process.ReqMemory,
      encodeString(process.UserID),
      encodeString(process.GroupID),
      encodeString(process.QueueID),
      encodeString(process.PartitionID),
      encodeString(process.OrigSiteID),
      process.WaitTime,
      process.NProc,
      process.Status,
      encodeString(process.ExecutableID),
      encodeString(process.LastRunSiteID),
    ]);

  const OUTPUTS = processes
    .filter((process) => process.RunTime !== null)
    .map((process) => process.RunTime);

  // Shuffle inputs and outputs
  tf.util.shuffleCombo(INPUTS, OUTPUTS);

  const INPUTS_TENSOR = tf.tensor2d(INPUTS);

  const OUTPUTS_TENSOR = tf.tensor1d(OUTPUTS);

  // Define model
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [15],
      units: 32,
      activation: "relu",
    })
  );
  model.add(tf.layers.dense({ units: 16, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" }));

  model.summary();

  // Train the model
  await train(model);

  // Temp cleanup
  INPUTS_TENSOR.dispose();
  OUTPUTS_TENSOR.dispose();
}

main();
