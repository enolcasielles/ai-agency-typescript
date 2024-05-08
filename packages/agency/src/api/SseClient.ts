export class SseClient {
  private client: any;

  constructor(
    public threadId: string,
    client: any,
  ) {
    this.client = client;
  }

  send(data: any) {
    this.client.send(JSON.stringify(data));
  }

  close() {
    this.client.close();
  }
}
