import { PrismaClient, Job } from "@prisma/client";
import { encodeString } from "./helpers";

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

export async function getData() {
  const processes = (await prisma.job.findMany({
    take: 20,
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

  return {
    INPUTS,
    OUTPUTS,
  };
}
