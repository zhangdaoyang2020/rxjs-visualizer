export class StreamData {
  message: string;
  color: string;
  timestamp: number;

  constructor(data) {
    this.message = data.message;
    this.color = data.color || 'rgb(126, 126, 226)';
    this.timestamp = Date.now();
  }
}
