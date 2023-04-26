import BasicMLFQ from "@/mlfq-algorithms/basic";
import type { NextApiHandler } from "next";
import type { BasicMLFQResponse } from "@/utils/types";
import { formSchema } from "@/utils/schema";
import { Process } from "@/utils/classes";
import { getData } from "@/utils/db";

const BasicMLFQHandler: NextApiHandler = async (req, res) => {
  const data = await formSchema.parseAsync(req.body);

  const rows = await getData(data?.recs);

  // Get static time quantums
  const runTimes = rows.map((process) => process.RunTime).sort((a, b) => a - b);
  const firstQuantum = runTimes[Math.round((runTimes.length - 1) * 0.25)]; // 25th percentile
  const secondQuantum = runTimes[Math.round((runTimes.length - 1) * 0.5)]; // 50th percentile
  const thirdQuantum = runTimes[Math.round((runTimes.length - 1) * 0.75)]; // 75th percentile

  // Get stating time
  const startTime = rows
    .map((process) => process.SubmitTime)
    .sort((a, b) => a - b)[0];

  const processes = rows.map((row) => new Process(row.SubmitTime, row.RunTime));

  const scheduler = new BasicMLFQ(processes, startTime, [
    firstQuantum,
    secondQuantum,
    thirdQuantum,
  ]);

  const { contextSwitches, avgTurnaroundTime } = scheduler.run();

  const response: BasicMLFQResponse = {
    contextSwitches,
    timeQuantums: [firstQuantum, secondQuantum, thirdQuantum],
    avgTurnaroundTime,
  };

  return res.status(200).json(response);
};

export default BasicMLFQHandler;
