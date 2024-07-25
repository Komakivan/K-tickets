import nats, { Stan } from 'node-nats-streaming';

// The purpose of this warpper class is to expose initiate connection just
// like mongoose and also to expose the client
/*
  The properties and methods to return from the natsWrapper class are;
  1: client
  2: connect(): Promise<void> method -> recieves a clusterId, clientId and url
*/

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access client before connecting');
    }
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this.client.on('error', (err) => reject(err));
    });
  }
}

export const natsWrapper = new NatsWrapper();
