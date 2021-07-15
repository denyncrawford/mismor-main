
import EventEmitter from 'events'
import { nanoid } from 'nanoid'

export default class RtManager extends EventEmitter {
  constructor (pubSub, identifier = 'rtm_') {
    super();
    this._pubSub = pubSub;
    this._id = identifier;
    this._stamp = nanoid();
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
    const channel = this._channels.find((v) => v.channelName === channelName);
    if (!channel) return
    const index = this._channels.indexOf(channel);
    await channel.end();
    const formated = this.format(channel);
    this.emit('unsubscribed', formated);
    this._channels.splice(index, 1);
    return formated
  }

  async ls() {
    return await Promise.all(this._channels.map((v) => { 
      return this.format(v);
    }));
  }

  format(channel) { 
    return {
      pubSubChannel: channel.channelName,
      name: channel.channelName.split(':')[1],
      identifier: channel.channelName.split(':')[0],
      id: channel._id,
      subscribers: channel._subscribers.map((v) => v._id)
    }
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
    if (index == -1) return;
    sub.kill();
    this._subscribers.splice(index, 1);
  }

  addSubscriber() { 
    const subscriber = new Subscriber(this.pubSub, this.channelName);
    subscriber.on('unsubscribe', (id) => {  
      this.removeSubscriber(id)
    });
    this._subscribers.push(subscriber);
    return subscriber;
  }

  trigger(eventName, data) {
    this.pubSub.publish(this.channelName, JSON.stringify({
      eventName,
      data,
      stamp: this._id
    }));
  }

  async end() {
    await this.pubSub.unsubscribe(this.channelName, () => {});
      //evt = msg;
      this._subscribers.forEach((s) => {
        s.kill();
        this.removeSubscriber(s._id)
      });
    //return { data: JSON.parse(evt.data.toString()), evt };
  }
}

class Subscriber extends EventEmitter {
  constructor(pubSub, channelName) {
    super();
    this._id = nanoid();
    this._pubSub = pubSub;
    this.channelName = channelName;
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
    this.emit('end', this._id)
    //this.removeAllListeners();
  }
}