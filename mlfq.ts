import { getData } from "./utils/db";

class Process {
  arrivalTime: number;
  burstTime: number;
  estimatedBurstTime: number;
  remainingBurstTime: number;
  priority: number;
  completedTime: number = 0;

  constructor(
    arrivalTime: number,
    burstTime: number,
    estimatedBurstTime?: number
  ) {
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
    this.remainingBurstTime = burstTime;
    this.priority = 1;
    this.estimatedBurstTime = estimatedBurstTime ?? burstTime;
  }
}

class Scheduler {
  private processes: Process[];
  private readyQueue1: Process[];
  private readyQueue2: Process[];
  private readyQueue3: Process[];
  private time: number;
  private completedQueue: Process[] = []; // Array to store process completed at a time unit
  private completedProcesses: Process[] = []; // Array to store all completed processes
  private timeQuantums = [27409, 45686, 62712];
  private contextSwitches = 0;

  constructor(processes: Process[]) {
    this.processes = processes;
    this.readyQueue1 = [];
    this.readyQueue2 = [];
    this.readyQueue3 = [];
    this.time = 1136074694;
  }

  /**
   * Add the processes that match the arrival time to the current time to
   * the 1st queue
   */
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

  private deprioritizeProcess(process: Process) {
    if (process.priority === 2) {
      this.readyQueue2.push(process);
    } else if (process.priority === 3) {
      this.readyQueue3.push(process);
    } else {
      this.readyQueue1.push(process);
    }
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

    console.log("> Context switches: ", this.contextSwitches);
    console.log(
      "> Average turnaround time: ",
      this.completedProcesses
        .map((process) => process.completedTime - process.arrivalTime)
        .reduce((partialSum, a) => partialSum + a, 0) /
        this.completedProcesses.length
    );
  }
}

(async () => {
  const data = await getData(20000);
  const processes = data.map(
    (process) => new Process(process.SubmitTime, process.RunTime)
  );

  const scheduler = new Scheduler(processes);
  scheduler.run();
})();
