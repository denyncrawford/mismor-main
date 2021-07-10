import { createStore } from "vuex";
const { MongoClient } = require("mongodb");
const Store = require('electron-store')
const { createController } = require('ipfsd-ctl')
const ipfsHttpModule = require('ipfs-http-client');
const ipfsBin = require.resolve('ipfs/src/cli.js');
const { join } = require('path');
const homedir = require('os').homedir();
const { app } = require('electron').remote

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
      config: {
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
            "/ip4/127.0.0.1/tcp/4003/ws"
          ],
          Gateway: "/ip4/127.0.0.1/tcp/8080", 
          API: "/ip4/127.0.0.1/tcp/5001" 
        }
      }
    },
    disposable: false
  });
  await ipfsd.init()
  await ipfsd.start()
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
      DBDriver: null,
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
    }
  }
})

export class DBDriver {
  constructor() {
    this.config = store.state.config;
    this.db = null;
  }
  async getDb() {
    if (this.db) return this.db;
    await this.connect();
  }
  async connect() {
    const client = new MongoClient(this.config.host, { useNewUrlParser: true, useUnifiedTopology: true });
    const connection = await client.connect();
    this.db = connection.db(this.config.name);
  }
  async reconnect(config) {
    this.config = config || store.state.config;
    this.db = null;
    await this.connect();
  }
}

export const persistentStorage = new Store();
