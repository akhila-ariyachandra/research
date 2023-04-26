Number of records with `RunTime >= 0`: 347611
Number of records with `RunTime >= 1`: 339314

| Minimum `RunTime` | Maximum `RunTime` | Average `RunTime` |
| :---------------: | :---------------: | :---------------: |
|       10005       |      259549       |    54383.9384     |

# Run Times

| 25th Percentile | 50th Percentile | 75th Percentile |
| :-------------: | :-------------: | :-------------: |
|      25691      |      36233      |      54689      |

# Training runs

| Epochs | Average error loss | Average validation error loss |
| -----: | ------------------ | ----------------------------- |
|  10000 | 22904.249387395343 | 22329.400171074903            |
|  20000 | 21013.118188407927 | 22353.115934920574            |
|  25000 | 20074.494862885094 | 21104.655789659304            |
|  30000 | 19468.34148046515  | 19905.559424442206            |
|  35000 | 18763.60391822424  | 19996.642918250054            |
|  45000 | 18248.780342806476 | 18502.249809144832            |
|  50000 | 17870.57201099058  | 18694.71625887914             |
|  60000 | 17661.359404077593 | 17956.762291682764            |
|  80000 | 16979.322954699932 | 18464.35788214689             |
|  90000 | 16848.68469643847  | 17316.868077109095            |
| 170000 | 15718.11693556197  | 16577.446848052325            |
| 270000 | 15188.856968185592 | 16673.42604265842             |
| 290000 | 14995.468115400732 | 16469.906617828772            |
| 310000 | 15210.81562573158  | 15400.753747787801            |
| 330000 | 15132.308217849648 | 15240.220470846214            |
| 340000 | 14764.981815092086 | 16345.474725440066            |
| 360000 | 14884.957238769617 | 15420.408814295424            |
| 370000 | 14904.967225727134 | 16146.545389029816            |
| 390000 | 14743.634287379757 | 16973.987628132643            |
| 410000 | 14999.904533029536 | 16421.772864097227            |

# Basic Multi Level Feedback Queue Algorithm

```typescript
class Process {
  name: string;
  arrivalTime: number;
  burstTime: number;
  remainingBurstTime: number;
  priority: number;
  completedTime: number = 0;

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
  private completedQueue: Process[] = []; // Array to store process completed at a time unit
  private completedProcesses: Process[] = []; // Array to store all completed processes
  private timeQuantums = [5, 10, 15];
  private contextSwitches = 0;

  constructor(processes: Process[]) {
    this.processes = processes;
    this.readyQueue1 = [];
    this.readyQueue2 = [];
    this.readyQueue3 = [];
    this.time = 0;
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

// Example usage:
const processes = [
  new Process("P1", 0, 15),
  new Process("P2", 2, 3),
  new Process("P3", 4, 20),
  new Process("P4", 5, 2),
  new Process("P5", 6, 4),
];

const scheduler = new Scheduler(processes);
scheduler.run();
```
