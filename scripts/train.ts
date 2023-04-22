import * as tf from "@tensorflow/tfjs-node-gpu";
import { getData } from "../utils/db";
import { MODEL_PATH, MODEL_JSON_PATH } from "../utils/constants";

/**
 * Normalize the values in the input values tensor
 */
function normalize(tensor: tf.Tensor2D) {
  const result = tf.tidy(() => {
    // Get minimum values
    const MIN_VALUES = tf.min(tensor, 0);

    // Get maximum values
    const MAX_VALUES = tf.max(tensor, 0);

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
}

async function train(
  model: tf.LayersModel,
  inputTensor: tf.Tensor,
  outputTensor: tf.Tensor1D
) {
  // Compile the model with the defined optimizer and specify a loss function to use.
  model.compile({
    optimizer: "adam", // Adam changes the learning rate over time which is useful.
    loss: "meanSquaredError",
    metrics: ["accuracy"],
  });

  // Finally do the training itself
  let results = await model.fit(inputTensor, outputTensor, {
    shuffle: true, // Ensure data is shuffled again before using each time.
    validationSplit: 0.2,
    batchSize: 512,
    epochs: 20000,
    /* callbacks: {
      onEpochEnd: (epoch, logs) => console.log("Data for epoch " + epoch, logs),
    }, */
  });

  const errorLoss = results.history.loss as number[];
  const validationErrorLoss = results.history.val_loss as number[];
  console.log(
    "Average error loss: " + Math.sqrt(errorLoss[errorLoss.length - 1])
  );
  console.log(
    "Average validation error loss: " +
      Math.sqrt(validationErrorLoss[validationErrorLoss.length - 1])
  );

  // Save model
  await model.save(MODEL_PATH, {
    includeOptimizer: true,
  });
}

async function main() {
  const { INPUTS, OUTPUTS } = await getData();

  // Shuffle inputs and outputs
  tf.util.shuffleCombo(INPUTS, OUTPUTS);

  const INPUTS_TENSOR = tf.tensor2d(INPUTS);

  const OUTPUTS_TENSOR = tf.tensor1d(OUTPUTS);

  // Normalize input values
  const FEATURE_RESULTS = normalize(INPUTS_TENSOR);
  // console.log("Normalized Values:");
  // FEATURE_RESULTS.NORMALIZED_VALUES.print();

  // console.log("Min Values:");
  // FEATURE_RESULTS.MIN_VALUES.print();

  // console.log("Max Values:");
  // FEATURE_RESULTS.MAX_VALUES.print();

  INPUTS_TENSOR.dispose();

  // Load/Create model
  let model: tf.Sequential | null = null;
  try {
    model = (await tf.loadLayersModel(MODEL_JSON_PATH)) as tf.Sequential;
    console.log("> Saved model loaded");
  } catch {
    model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [15],
        units: 32,
        activation: "relu",
      })
    );
    model.add(tf.layers.dense({ units: 16, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1, activation: "linear" }));
  }

  if (model) {
    model.summary();

    // Train the model
    await train(model, FEATURE_RESULTS.NORMALIZED_VALUES, OUTPUTS_TENSOR);

    model.dispose();
  }

  FEATURE_RESULTS.NORMALIZED_VALUES.dispose();
  OUTPUTS_TENSOR.dispose();

  // Temp cleanup
  FEATURE_RESULTS.MIN_VALUES.dispose();
  FEATURE_RESULTS.MAX_VALUES.dispose();

  console.log("> Tensorflow memory: ", tf.memory());
}

main();
