import MLScheduler from "./ml";
import { ExtendedProcess } from "@/utils/classes";
import { MIN_BURST_TIME } from "@/utils/constants";

export default class EnhancedScheduler extends MLScheduler {
  protected calculateTimeQuantum(queue: ExtendedProcess[], priority: number) {
    const position = priority - 1;
    let timeQuantum = this.timeQuantums[position];

    if (queue.length === 1) {
      timeQuantum = queue[0].estimatedBurstTime;
    } else if (queue.length >= 1) {
      // Using Manhattan Distance from paper "Performance Evaluation of Dynamic Round Robin Algorithms for CPU Scheduling"
      let min = queue[0].estimatedBurstTime;
      let max = queue[0].estimatedBurstTime;

      for (let i = 1; i < queue.length; i++) {
        const currentEstimatedBurstTime = queue[i].estimatedBurstTime;
        if (currentEstimatedBurstTime < min) {
          min = currentEstimatedBurstTime;
        }
        if (currentEstimatedBurstTime > max) {
          max = currentEstimatedBurstTime;
        }
      }

      const diff = max - min;
      timeQuantum = diff >= MIN_BURST_TIME ? diff : MIN_BURST_TIME;
    }

    if (priority === 1) {
      // Limit to smaller than Time Quantum of 2nd queue
      if (this.timeQuantums[1] !== 0 && timeQuantum >= this.timeQuantums[1]) {
        timeQuantum = this.timeQuantums[1] - 1;
      }
    } else if (priority === 2) {
      // Should be more than 1st time quantum and less then 3rd time quantum
      if (this.timeQuantums[0] !== 0 && timeQuantum <= this.timeQuantums[0]) {
        timeQuantum = this.timeQuantums[0] + 1;
      } else if (
        this.timeQuantums[2] !== 0 &&
        timeQuantum >= this.timeQuantums[2]
      ) {
        timeQuantum = this.timeQuantums[2] - 1;
      }
    } else if (priority === 3) {
      // Limit to bigger than Time Quantum of 2nd queue
      if (this.timeQuantums[1] !== 0 && timeQuantum <= this.timeQuantums[1]) {
        timeQuantum = this.timeQuantums[1] + 1;
      }
    }

    this.timeQuantums = this.timeQuantums.map((oldQuantum, index) =>
      position === index ? timeQuantum : oldQuantum
    );
  }

  public run() {
    const response = super.run();

    return response;
  }
}
