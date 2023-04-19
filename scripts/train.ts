import * as tf from "@tensorflow/tfjs-node-gpu";
import { getData } from "../utils/db";

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
  model: tf.Sequential,
  inputTensor: tf.Tensor2D,
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
    batchSize: 512, // Update weights after every 512 examples.
    epochs: 50, // Go over the data 50 times!
    callbacks: {
      onEpochEnd: (epoch, logs) => console.log("Data for epoch " + epoch, logs),
    },
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
  // await train(model, INPUTS_TENSOR, OUTPUTS_TENSOR);

  // Temp cleanup
  OUTPUTS_TENSOR.dispose();
  FEATURE_RESULTS.NORMALIZED_VALUES.dispose();
  FEATURE_RESULTS.MIN_VALUES.dispose();
  FEATURE_RESULTS.MAX_VALUES.dispose();
  model.dispose();

  console.log("> Tensorflow memory: ", tf.memory());
}

main();
