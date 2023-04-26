import { Process } from "@/utils/classes";

export default class BasicScheduler {
  private processes: Process[];
  private readyQueue1: Process[] = [];
  private readyQueue2: Process[] = [];
  private readyQueue3: Process[] = [];
  private time: number;
  private completedQueue: Process[] = []; // Array to store process completed at a time unit
  private completedProcesses: Process[] = []; // Array to store all completed processes
  private timeQuantums: [number, number, number];
  private contextSwitches = 0;

  constructor(
    processes: Process[],
    startTime: number,
    timeQuantums: [number, number, number]
  ) {
    this.processes = processes;
    this.time = startTime;
    this.timeQuantums = timeQuantums;
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

  private deprioritizeProcess(process: Process) {
    if (process.priority === 2) {
      this.readyQueue2.push(process);
    } else if (process.priority === 3) {
      this.readyQueue3.push(process);
    } else {
      this.readyQueue1.push(process);
    }
  }

  private executeProcess(queue: Process[], priority: number) {
    if (queue.length === 0) {
      return;
    }

    // Run the 1st process in the queue
    const process = queue[0];
    process.remainingBurstTime = process.remainingBurstTime - 1;
    if (process.remainingBurstTime === 0) {
      // The process completes execution
      queue.shift(); // Remove the process from the queue
      this.completedQueue.push(process); // And add to completed queue
    } else {
      const runningTime = process.burstTime - process.remainingBurstTime;

      // Check if the process has completed a time quantum cycle
      if (priority === 1) {
        if (runningTime === this.timeQuantums[0]) {
          queue.shift();
          process.priority++;
          this.deprioritizeProcess(process);
          this.contextSwitches++; // Increase context switch count as process is paused
        }
      } else if (priority === 2) {
        if (runningTime === this.timeQuantums[0] + this.timeQuantums[1]) {
          queue.shift();
          process.priority++;
          this.deprioritizeProcess(process);
          this.contextSwitches++; // Increase context switch count as process is paused
        }
      } else if (priority === 3) {
        const timeRunningOnQ3 =
          runningTime - this.timeQuantums[0] - this.timeQuantums[1];

        if (timeRunningOnQ3 % this.timeQuantums[2] === 0) {
          // Move the process to the end of the queue in the lowest priority queue
          queue.push(queue.shift() as Process);
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

    return {
      contextSwitches: this.contextSwitches,
      avgTurnaroundTime,
    };
  }
}
