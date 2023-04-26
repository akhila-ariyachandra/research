import { getData } from "./utils/db";

(async () => {
  const processes = await getData(20000);

  const runTimes = processes.map((process) => process.RunTime).sort();

  console.log(
    "> 25th percentile: ",
    runTimes[Math.round((runTimes.length - 1) * 0.25)]
  );
  console.log(
    "> 50th percentile: ",
    runTimes[Math.round((runTimes.length - 1) * 0.5)]
  );
  console.log(
    "> 75th percentile: ",
    runTimes[Math.round((runTimes.length - 1) * 0.75)]
  );
})();
