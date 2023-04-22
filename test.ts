import { getData } from "./utils/db";

(async () => {
  let min = 0;
  let max = 0;
  let total = 0;

  const { OUTPUTS } = await getData();

  for (let i = 0; i < OUTPUTS.length; i++) {
    const value = OUTPUTS[i];

    if (i === 0 || value < min) {
      min = value;
    }

    if (value > max) {
      max = value;
    }

    total = total + value;
  }

  console.log("> min: ", min);
  console.log("> max: ", max);
  console.log("> average: ", total / OUTPUTS.length);
})();
