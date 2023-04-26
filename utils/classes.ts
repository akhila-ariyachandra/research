export class Process {
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

export class ExtendedProcess extends Process {
  timeOnQueue = 0;
}
