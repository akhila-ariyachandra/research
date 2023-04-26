import { Job } from "@prisma/client";

interface BasicResponse {
  contextSwitches: number;
  avgTurnaroundTime: number;
}

export interface BasicMLFQResponse extends BasicResponse {
  timeQuantums: [number, number, number];
}

export interface MLMLFQResponse extends BasicResponse {}

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

export type DbProcess = {
  [P in keyof PickedFields]-?: NonNullable<PickedFields[P]>;
};
