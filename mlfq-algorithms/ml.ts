import { ExtendedProcess } from "@/utils/classes";
import { MIN_BURST_TIME } from "@/utils/constants";

export default class MLScheduler {
  private processes: ExtendedProcess[];
  private readyQueue1: ExtendedProcess[] = [];
  private readyQueue2: ExtendedProcess[] = [];
  private readyQueue3: ExtendedProcess[] = [];
  private time: number;
  private completedQueue: ExtendedProcess[] = []; // Array to store process completed at a time unit
  private completedProcesses: ExtendedProcess[] = []; // Array to store all completed processes
  protected timeQuantums: number[] = [0, 0, 0];
  private contextSwitches = 0;

  constructor(processes: ExtendedProcess[], startTime: number) {
    this.processes = processes;
    this.time = startTime;
  }

  private addArrivingProcesses() {
    // Get all processes that match the arrival time
    const newProcesses = this.processes.filter(
      (process) => process.arrivalTime === this.time
    );

    // Get aLL remaining process
    const otherProcesses = this.processes.filter(
      (process) => process.arrivalTime !== this.time
    );

    this.readyQueue1 = [...this.readyQueue1, ...newProcesses];
    this.processes = [...otherProcesses];
  }

  /**
   * Display details about complete processes and cleanup queue
   */
  private cleanupCompleted() {
    while (this.completedQueue.length > 0) {
      const process = this.completedQueue[0];
      process.completedTime = this.time;
      this.completedProcesses.push(process);
      this.completedQueue.shift();
    }
  }

  private deprioritizeProcess(process: ExtendedProcess) {
    if (process.priority === 2) {
      this.readyQueue2.push(process);
    } else if (process.priority === 3) {
      this.readyQueue3.push(process);
    } else {
      this.readyQueue1.push(process);
    }
  }

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

    this.timeQuantums = this.timeQuantums.map((oldQuantum, index) =>
      position === index ? timeQuantum : oldQuantum
    );
  }

  private executeProcess(queue: ExtendedProcess[], priority: number) {
    if (queue.length === 0) {
      return;
    }

    // 1st process in queue
    const process = queue[0];

    // Calculate Time Quantum if process just started running in queue
    if (process.timeOnQueue === 0) {
      this.calculateTimeQuantum(queue, priority);
    }

    // Run the 1st process in the queue
    process.remainingBurstTime = process.remainingBurstTime - 1;
    process.timeOnQueue = process.timeOnQueue + 1;
    if (process.startTime === null) {
      process.startTime = this.time;
    }

    if (process.remainingBurstTime === 0) {
      // The process completes execution
      queue.shift(); // Remove the process from the queue
      this.completedQueue.push(process); // And add to completed queue
    } else {
      // Check if the process has completed a time quantum cycle
      if (priority === 1) {
        if (process.timeOnQueue === this.timeQuantums[0]) {
          queue.shift();
          process.priority++;
          process.timeOnQueue = 0;
          this.deprioritizeProcess(process);
          this.contextSwitches++; // Increase context switch count as process is paused
        }
      } else if (priority === 2) {
        if (process.timeOnQueue === this.timeQuantums[1]) {
          queue.shift();
          process.priority++;
          process.timeOnQueue = 0;
          this.deprioritizeProcess(process);
          this.contextSwitches++; // Increase context switch count as process is paused
        }
      } else if (priority === 3) {
        if (process.timeOnQueue === this.timeQuantums[2]) {
          process.timeOnQueue = 0;
          // Move the process to the end of the queue in the lowest priority queue
          queue.push(queue.shift() as ExtendedProcess);
          this.contextSwitches++; // Increase context switch count as process is paused
        }
      }
    }
  }

  public run() {
    while (
      this.processes.length > 0 ||
      this.readyQueue1.length > 0 ||
      this.readyQueue2.length > 0 ||
      this.readyQueue3.length > 0
    ) {
      this.addArrivingProcesses();

      this.executeProcess(this.readyQueue1, 1);
      this.executeProcess(this.readyQueue2, 2);
      this.executeProcess(this.readyQueue3, 3);
      this.time++;

      this.cleanupCompleted();
    }

    const avgTurnaroundTime =
      this.completedProcesses
        .map((process) => process.completedTime - process.arrivalTime)
        .reduce((partialSum, a) => partialSum + a, 0) /
      this.completedProcesses.length;
    const avgResponseTime =
      this.completedProcesses
        .map((process) => process.startTime - process.arrivalTime)
        .reduce((partialSum, a) => partialSum + a, 0) /
      this.completedProcesses.length;

    return {
      contextSwitches: this.contextSwitches,
      avgTurnaroundTime,
      avgResponseTime,
    };
  }
}
