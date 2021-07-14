import { createStore } from "vuex";
const { MongoClient } = require("mongodb");
const Store = require('electron-store')
const { createController } = require('ipfsd-ctl')
const ipfsHttpModule = require('ipfs-http-client');
const ipfsBin = require.resolve('ipfs/src/cli.js');
const { join } = require('path');
const homedir = require('os').homedir();
const { app } = require('electron').remote
const EventEmitter = require('events');
const { nanoid } = require('nanoid');

export const getDataNode = async () => {
  const ipfsd = await createController({
    ipfsHttpModule,
    ipfsBin,
    remote: false,
    type: 'js',
    ipfsOptions: {
      init: true,
      start: true,
      repo: join(homedir, '/.jsipfs'),
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
            "/ip4/0.0.0.0/tcp/4002",
            "/ip4/127.0.0.1/tcp/4003/ws",
          ],
          Gateway: "/ip4/0.0.0.0/tcp/8080", 
          API: "/ip4/127.0.0.1/tcp/5001" 
        },
        Discovery: {
          MDNS: {
            Enabled: true,
            Interval: 10
          }
        }
      }
    },
    disposable: false
  });
  await ipfsd.init();
  await ipfsd.start();
  app.on('before-quit', async (evt) => {
    evt.preventDefault()
    await ipfsd.api.stop()
  });
  window.addEventListener('beforeunload', async () => {
    await ipfsd.api.stop()
  })
  return ipfsd.api
}

export const store = createStore({
  state() {
    return {
      isEditing: false,
      visibleBack: false,
      config: {
        host: 'mongodb://localhost:27017',
        name: 'mismor'
      },
      dataNode:"",
      rtm: null,
      loading: true
    }
  },
  mutations: {
    toggleEditing (state) {
      state.isEditing = !state.isEditing
    },
    setConfig(state, payload) {
      state.config = Object.assign(state.config, payload);
    },
    setDataNode(state, dn) {
      state.dataNode = dn;
    },
    toggleLoading(state) {
      state.loading = !state.loading
    },
    setDriver(state, db) {
      state.DBDriver = db
    },
    setRTM(state, rtm) {
      state.rtm = rtm
    }
  }
})

class DBDriver {
  constructor() {
    this.config = store.state.config;
    this.client = null
    this.db = null;
  }
  async getDb() {
    if (this.db) return this.db
    await this.connect();
    return this.db;
  }
  async connect() {
    this.client = new MongoClient(this.config.host, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    this.connection = await this.client.connect();
    this.db = this.connection.db(this.config.name);
  }
  async reconnect(config) {
    this.config = config || store.state.config;
    await this.client.close(true);
    this.connection = null;
    this.db = null;
    await this.connect();
  }
}

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

export const globalDriver = new DBDriver();

export const persistentStorage = new Store();
