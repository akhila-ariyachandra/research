import type { DbProcess } from "./types";
import { PrismaClient } from "@prisma/client";
import { convertToInputAndOutputArrays } from "./machine-learning";
import { MIN_BURST_TIME } from "./constants";

const prisma = new PrismaClient();

export const getData = async (noOfRecs: number) => {
  const processes = (await prisma.job.findMany({
    take: noOfRecs,
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
    where: {
      RunTime: {
        gte: MIN_BURST_TIME,
      },
    },
  })) as DbProcess[];

  return processes;
};

export const getTrainingData = async (noOfRecs: number) => {
  const processes = await getData(noOfRecs);

  const { INPUTS, OUTPUTS } = convertToInputAndOutputArrays(processes);

  return {
    INPUTS,
    OUTPUTS,
  };
};
