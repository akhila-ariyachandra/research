import MLMLFQ from "@/mlfq-algorithms/ml";
import * as tf from "@tensorflow/tfjs-node-gpu";
import type { NextApiHandler } from "next";
import type { MLMLFQResponse } from "@/utils/types";
import { formSchema } from "@/utils/schema";
import { getData, getTrainingData } from "@/utils/db";
import { ExtendedProcess } from "@/utils/classes";
import { NO_OF_TRAINING_RECS, MODEL_JSON_PATH } from "@/utils/constants";
import {
  normalize,
  convertToInputAndOutputArrays,
} from "@/utils/machine-learning";

const MLMLFQHandler: NextApiHandler = async (req, res) => {
  const data = await formSchema.parseAsync(req.body);

  const rows = await getData(data?.recs);

  // Get starting time
  const startTime = rows
    .map((process) => process.SubmitTime)
    .sort((a, b) => a - b)[0];

  // Get training data
  const { INPUTS, OUTPUTS } = await getTrainingData(NO_OF_TRAINING_RECS);
  const INPUTS_TENSOR = tf.tensor2d(INPUTS);
  const OUTPUTS_TENSOR = tf.tensor1d(OUTPUTS);
  // Normalize input values
  const FEATURE_RESULTS = normalize(INPUTS_TENSOR);

  // Get estimated burst values
  const ML_ROWS = convertToInputAndOutputArrays(rows);
  const ML_INPUTS_TENSOR = tf.tensor2d(ML_ROWS.INPUTS);
  const ML_OUTPUTS_TENSOR = tf.tensor1d(ML_ROWS.OUTPUTS);
  const ML_FEATURE_RESULTS = normalize(
    ML_INPUTS_TENSOR,
    FEATURE_RESULTS.MIN_VALUES,
    FEATURE_RESULTS.MAX_VALUES
  );
  const model = (await tf.loadLayersModel(MODEL_JSON_PATH)) as tf.Sequential;
  let output = model.predict(
    ML_FEATURE_RESULTS.NORMALIZED_VALUES
  ) as tf.Tensor2D;
  const calculatedValues = await output.data();
  const estimatedBurstTimes = calculatedValues.map((value) =>
    value < 10000 ? 10000 : Math.round(value)
  );

  // Convert jobs to processes for the scheduler
  const processes: ExtendedProcess[] = [];
  for (let i = 1; i < rows.length; i++) {
    processes.push(
      new ExtendedProcess(
        rows[i].SubmitTime,
        rows[i].RunTime,
        estimatedBurstTimes[i]
      )
    );
  }

  // Run the scheduler
  const scheduler = new MLMLFQ(processes, startTime);
  const { contextSwitches, avgTurnaroundTime } = scheduler.run();

  // Cleanup
  INPUTS_TENSOR.dispose();
  OUTPUTS_TENSOR.dispose();
  FEATURE_RESULTS.MIN_VALUES.dispose();
  FEATURE_RESULTS.MAX_VALUES.dispose();
  FEATURE_RESULTS.NORMALIZED_VALUES.dispose();
  ML_INPUTS_TENSOR.dispose();
  ML_OUTPUTS_TENSOR.dispose();
  ML_FEATURE_RESULTS.MIN_VALUES.dispose();
  ML_FEATURE_RESULTS.MAX_VALUES.dispose();
  ML_FEATURE_RESULTS.NORMALIZED_VALUES.dispose();
  model.dispose();

  return res.status(200).json({
    contextSwitches,
    avgTurnaroundTime,
  } satisfies MLMLFQResponse);
};

export default MLMLFQHandler;
