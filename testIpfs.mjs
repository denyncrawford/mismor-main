//import Room  from 'ipfs-pubsub-room';
import IPFS from 'ipfs'
import { join }  from 'path';
import { homedir } from 'os';
import EventEmitter from 'events'
import { nanoid } from 'nanoid'

const ipfs = await IPFS.create({
  init: true,
  start: true,
  repo: join(homedir(), '/.jsipfs2'),
  relay: {
    enabled: true,
    hop: {
      enabled: true,
      active: true
    }
  },
  config: {
    Routing: {
      Type: 'dht'
    },
    API: {
      HTTPHeaders: {
        "Access-Control-Allow-Origin": [
          "*"
        ],
        "Access-Control-Allow-Methods": ["PUT", "POST", "GET", "DELETE"],
        "Access-Control-Allow-Credentials": true,
      }
    },
    Addresses: { 
      Swarm: [
        "/ip4/0.0.0.0/tcp/4004",
        "/ip4/0.0.0.0/tcp/4005/ws",
      ],
      Gateway: "/ip4/0.0.0.0/tcp/8082", 
      API: "/ip4/127.0.0.1/tcp/5002" 
    },
    Discovery: {
      MDNS: {
        Enabled: true,
        Interval: 10
      }
    }
  }
})
//const room = new Room(ipfs, 'room-name')

export class RtManager extends EventEmitter {
  constructor (pubSub, identifier) {
    super();
    this._pubSub = pubSub;
    this._id = identifier;
    this._stamp = nanoid()
    this._subscribers = [];
  }

  async subscribe(channel) {
    const channelName = `${this._id}:${channel}`
    const foundSub = this._subscribers.find((v) => v.channelName == channelName);
    if (typeof foundSub === undefined) return foundSub;
    const subscriber = new Subscriber(channelName, this._pubSub);
    await subscriber.init();
    this._subscribers.push(subscriber)
    return subscriber;
  }

  async unsubscribe(channel) {
    const channelName = `${this._id}:${channel}`
    const sub = this._subscribers.find((v) => v.channelName === channelName);
    if (!sub) return
    const index = this._subscribers.indexOf(sub);
    await sub.end();
    sub.on('end', (...args) => {
      this.emit('unsubscribed', ...args)
    })
    this._subscribers.splice(index, 1);
  }

}

class Subscriber extends EventEmitter {
  constructor (channelName, pubSub) {
    super();
    this.channelName = channelName;
    this.pubSub = pubSub;
    this._id = nanoid();
  }
  async init() {
    await this.pubSub.subscribe(this.channelName, msg => {
      const prepare = JSON.parse(new TextDecoder().decode(msg.data));
      this.emit(prepare.eventName, prepare.data, msg)
    })
  }

  async trigger(eventName, data) {
    const prepare = JSON.stringify({ eventName, data });
    await this.pubSub.publish(this.channelName, prepare)
  }

  async end() {
      await this.pubsub.unsubscribe(this.channelName, (msg) => {
      const prepare = JSON.parse(msg.data.toString());
      this.emit('end', prepare.data, msg)
    });
  }
}

const manager = new RtManager(ipfs.pubsub, 'denyncrawford');

const notificationChannel = await manager.subscribe('notifications');

notificationChannel.on('new', msg => console.log(msg))

await notificationChannel.trigger('new', '213')