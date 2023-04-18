class Process {
  name: string;
  arrivalTime: number;
  burstTime: number;
  remainingBurstTime: number;
  priority: number;

  constructor(name: string, arrivalTime: number, burstTime: number) {
    this.name = name;
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
    this.remainingBurstTime = burstTime;
    this.priority = 1;
  }
}

class Scheduler {
  private processes: Process[];
  private readyQueue1: Process[];
  private readyQueue2: Process[];
  private readyQueue3: Process[];
  private time: number;
  private completedQueue: Process[];
  private timeQuantums = [5, 10, 15];

  constructor(processes: Process[]) {
    this.processes = processes;
    this.readyQueue1 = [];
    this.readyQueue2 = [];
    this.readyQueue3 = [];
    this.time = 0;
    this.completedQueue = [];
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
      console.log(
        `Process ${process.name} finished at time ${this.time} on queue ${process.priority}`
      );
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
        }
      } else if (priority === 2) {
        if (runningTime === this.timeQuantums[0] + this.timeQuantums[1]) {
          queue.shift();
          process.priority++;
          this.deprioritizeProcess(process);
        }
      } else if (priority === 3) {
        const timeRunningOnQ3 =
          runningTime - this.timeQuantums[0] - this.timeQuantums[1];

        if (timeRunningOnQ3 % this.timeQuantums[2] === 0) {
          // Move the process to the end of the queue in the lowest priority queue
          queue.push(queue.shift() as Process);
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
  }
}

// Example usage:
const processes = [
  new Process("P1", 0, 5),
  new Process("P2", 2, 3),
  new Process("P3", 4, 1),
  new Process("P4", 5, 2),
  new Process("P5", 6, 4),
];

const scheduler = new Scheduler(processes);
scheduler.run();
