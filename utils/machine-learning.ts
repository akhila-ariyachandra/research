import * as tf from "@tensorflow/tfjs-node";
import type { DbProcess } from "./types";
import { encodeString } from "./helpers";

/**
 * Normalize the values in the input values tensor
 */
export const normalize = (
  tensor: tf.Tensor2D,
  min?: tf.Tensor<tf.Rank>,
  max?: tf.Tensor<tf.Rank>
) => {
  const result = tf.tidy(() => {
    // Get minimum values
    const MIN_VALUES = min ?? tf.min(tensor, 0);

    // Get maximum values
    const MAX_VALUES = max ?? tf.max(tensor, 0);

    // Reduce values by minimum values
    const TENSOR_SUBTRACT_MIN_VALUE = tf.sub(tensor, MIN_VALUES);

    // Get range of values
    const RANGE_SIZE = tf.sub(MAX_VALUES, MIN_VALUES);

    // Get normalized values by dividing subtracted values with rangeW
    const NORMALIZED_VALUES = tf.divNoNan(
      TENSOR_SUBTRACT_MIN_VALUE,
      RANGE_SIZE
    );

    return { NORMALIZED_VALUES, MIN_VALUES, MAX_VALUES };
  });

  return result;
};

export const convertToInputAndOutputArrays = (jobs: DbProcess[]) => {
  const INPUTS = jobs
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

  const OUTPUTS = jobs
    .filter((process) => process.RunTime !== null)
    .map((process) => process.RunTime);

  return {
    INPUTS,
    OUTPUTS,
  };
};
