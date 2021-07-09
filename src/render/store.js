import { createStore } from "vuex";
const { MongoClient } = require("mongodb");
const Store = require('electron-store')
const { createController } = require('ipfsd-ctl')
const ipfsHttpModule = require('ipfs-http-client');
const ipfsBin = require.resolve('ipfs/src/cli.js');

export const getDataNode = async (port) => {
  const ipfsd = await createController({
    ipfsHttpModule,
    ipfsBin,
    remote: false,
    type: 'js',
    ipfsOptions: {
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
    }
  })
  console.log(ipfsd);
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
    }
  }
})

export const persistentStorage = new Store();

let instance;
export const database = async () => {
  if (instance) return instance;
  const client = new MongoClient(store.state.config?.host, { useNewUrlParser: true, useUnifiedTopology: true });
  const connection = await client.connect();
  instance = connection.db(store.state.config.name)
  return instance;
} 
