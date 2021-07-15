
import EventEmitter from 'events'
import { nanoid } from 'nanoid'

export default class RtManager extends EventEmitter {
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
    if (foundChannel) return foundChannel.addSubscriber();
    const channel = new Channel(channelName, this._pubSub);
    const subscriber = await channel.init();
    this._channels.push(channel)
    return subscriber;
  }

  async unsubscribe(channel_name) {
    const channelName = `${this._id}:${channel_name}`
    const sub = this._channels.find((v) => v.channelName === channelName);
    if (!sub) return
    const index = this._channels.indexOf(sub);
    await sub.end();
    sub.on('end', (...args) => {
      this.emit('unsubscribed', ...args)
    })
    this._channels.splice(index, 1);
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
      const firstSubscriber = this.addSubscriber();
      await this.pubSub.subscribe(this.channelName, async msg => {
          const prepare = JSON.parse(new TextDecoder().decode(msg.data));
          await Promise.all(this._subscribers.map(s => s.emit(prepare.eventName, prepare.data, msg)))
      })
    return firstSubscriber;
  }

  removeSubscriber(id) { 
    const index = this._subscribers.findIndex(s => s._id === id);
    const sub = this._subscribers.find(s => s._id === id);
    sub.kill()
    this._subscribers.splice(index, 1);
  }

  addSubscriber() { 
    const subscriber = new Subscriber(this.pubSub, this.channelName, this.removeSubscriber.bind(this));
    subscriber.on('unsubscribe', (id) => {  
      this.removeSubscriber(id)
    });
    this._subscribers.push(subscriber);
    return subscriber;
  }

  async end() {
      await this.pubsub.unsubscribe(this.channelName, (msg) => {
      const prepare = JSON.parse(msg.data.toString());
      this._subscribers.forEach((s, i) => { 
        s.emit(prepare.eventName || 'end', prepare.data, msg)
        this.removeSubscriber(s._id)
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

  async unsubscribe() {
    await Promise.resolve(this.emit('unsubscribe', this._id));
  }
  
  kill() {
    this.available = false;
    this.removeAllListeners();
  }
}