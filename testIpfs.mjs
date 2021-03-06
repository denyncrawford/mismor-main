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
    this._channels = [];
  }

  async subscribe(channel_name) {
    const channelName = `${this._id}:${channel_name}`
    const foundChannel = this._channels.find((v) => v.channelName == channelName);
    if (typeof foundChannel === undefined) return foundChannel.addSubscriber();
    const channel = new Channel(channelName, this._pubSub);
    const subscriber = await channel.init();
    this._channels.push(channel)
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

class Channel {
  constructor (channelName, pubSub) {
    this.channelName = channelName;
    this.pubSub = pubSub;
    this._id = nanoid();
    this._subscribers = [];
  }

  async init() {
      const firstSubscriber = new Subscriber(this.pubSub, this.channelName, this.removeSubscriber.bind(this));
      console.log(firstSubscriber);
      this._subscribers.push(firstSubscriber);
      await this.pubSub.subscribe(this.channelName, msg => {
          const prepare = JSON.parse(new TextDecoder().decode(msg.data));
          this._subscribers.forEach(s => s.emit(prepare.eventName, prepare.data, msg));
      })
    return firstSubscriber;
  }

  removeSubscriber(id) { 
    const index = this._subscribers.findIndex(s => s._id === id);
    this._subscribers.splice(index, 1);
  }

  addSubscriber() { 
    const subscriber = new Subscriber(this.pubSub, this.channelName, this.removeSubscriber.bind(this));
    this._subscribers.push(subscriber);
    return subscriber;
  }

  async end() {
      await this.pubsub.unsubscribe(this.channelName, (msg) => {
      const prepare = JSON.parse(msg.data.toString());
      this._subscribers.forEach((s, i) => { 
        s.emit('end', prepare.data, msg)
        s.kill()
        this._subscribers.splice(i, 1);
      });
    });
  }
}

class Subscriber extends EventEmitter {
  constructor(pubSub, channelName, removeMethod) {
    super();
    this._id = nanoid();
    this._pubSub = pubSub;
    this.channelName = channelName;
    this.removeMethod = removeMethod;
    this.available = true;
  }

  async trigger(eventName, data) {
    if (!this.available) return;
    const prepare = JSON.stringify({ eventName, data });
    await this._pubSub.publish(this.channelName, prepare);
  }
  
  kill() {
    this.available = false;
    this.removeMethod(this._id);
    this.off();
  }
}

const manager = new RtManager(ipfs.pubsub, 'denyncrawford');

const notificationChannel = await manager.subscribe('notifications');

notificationChannel.on('new', msg => console.log(msg))

await notificationChannel.trigger('new', '213')

//notificationChannel.kill()