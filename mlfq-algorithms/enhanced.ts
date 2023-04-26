import MLScheduler from "./ml";
import { ExtendedProcess } from "@/utils/classes";

export default class EnhancedScheduler extends MLScheduler {
  protected calculateTimeQuantum(queue: ExtendedProcess[], priority: number) {
    const position = priority - 1;
    let timeQuantum = this.timeQuantums[position];

    if (queue.length >= 1) {
      let total = 0;

      for (let i = 0; i < queue.length; i++) {
        total = total + queue[i].estimatedBurstTime;
      }

      timeQuantum = Math.round(total / queue.length);
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
}
