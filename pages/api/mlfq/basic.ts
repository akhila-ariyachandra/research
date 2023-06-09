import BasicMLFQ from "@/mlfq-algorithms/basic";
import * as z from "zod";
import type { NextApiHandler } from "next";
import type { BasicMLFQResponse } from "@/utils/types";
import { formSchema } from "@/utils/schema";
import { Process } from "@/utils/classes";
import { getData } from "@/utils/db";

const requestSchema = formSchema.extend({
  timeQuantums: z.array(z.number()).length(3),
});

const BasicMLFQHandler: NextApiHandler = async (req, res) => {
  const data = await requestSchema.parseAsync(req.body);

  const rows = await getData(data?.recs);

  // Static Time Quantums
  const [firstQuantum, secondQuantum, thirdQuantum] = data.timeQuantums;

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

  const { contextSwitches, avgTurnaroundTime, avgResponseTime } =
    scheduler.run();

  const response: BasicMLFQResponse = {
    contextSwitches,
    timeQuantums: [firstQuantum, secondQuantum, thirdQuantum],
    avgTurnaroundTime,
    avgResponseTime,
  };

  return res.status(200).json(response);
};

export default BasicMLFQHandler;
