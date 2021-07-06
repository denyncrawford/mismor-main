import { createStore } from "vuex";
const { MongoClient } = require("mongodb");
const Store = require('electron-store')
const IPFS = require('ipfs-core')

export const getDataNode = () => IPFS.create();

export const store = createStore({
  state() {
    return {
      isEditing: false,
      visibleBack: false,
      config: {
        host: 'mongodb://localhost:27017',
        name: 'mismor'
      },
      dataNode:""
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
