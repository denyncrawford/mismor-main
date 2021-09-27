import { createStore } from "vuex";
const fs = require("fs");
const { promisify } = require("util");
const { MongoClient } = require("mongodb");
const Store = require("electron-store");
const { createController } = require("ipfsd-ctl");
const ipfsHttpModule = require("ipfs-http-client");
const exist = promisify(fs.exists);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const ipfsBin = require.resolve("ipfs/src/cli.js");
const { join } = require("path");
const { app } = require("electron").remote;
const basePath = app.getAppPath();

export const getDataNode = async () => {
  const ipfsd = await createController({
    ipfsHttpModule,
    ipfsBin,
    remote: false,
    type: "js",
    ipfsOptions: {
      start: true,
      repo: join(basePath, "/.jsipfs"),
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true,
        },
      },
      config: {
        Routing: {
          Type: "dht",
        },
        API: {
          HTTPHeaders: {
            "Access-Control-Allow-Origin": [
              "*",
            ],
            "Access-Control-Allow-Methods": ["PUT", "POST", "GET", "DELETE"],
            "Access-Control-Allow-Credentials": true,
          },
        },
        Addresses: {
          Swarm: [
            "/ip4/0.0.0.0/tcp/4002",
            "/ip4/127.0.0.1/tcp/4003/ws",
          ],
          Gateway: "/ip4/0.0.0.0/tcp/8080",
          API: "/ip4/127.0.0.1/tcp/5001",
        },
        Discovery: {
          MDNS: {
            Enabled: true,
            Interval: 10,
          },
        },
      },
    },
    test: false,
    disposable: false,
  });
  await ipfsd.init();
  try {
    await ipfsd.start();
    return ipfsd.api;
  } catch (e) {
    await deleteFolderRecursive(join(basePath, "/.jsipfs", "/repo.lock"));
    await unlink(join(basePath, "/.jsipfs", "/api"));
    await ipfsd.start();
    return ipfsd.api;
  }
};

export const store = createStore({
  state() {
    return {
      isEditing: false,
      visibleBack: false,
      config: {
        host: "mongodb://localhost:27017",
        name: "mismor",
      },
      dataNode: "",
      rtm: null,
      loading: true,
    };
  },
  mutations: {
    toggleEditing(state) {
      state.isEditing = !state.isEditing;
    },
    setConfig(state, payload) {
      state.config = Object.assign(state.config, payload);
    },
    setDataNode(state, dn) {
      state.dataNode = dn;
    },
    toggleLoading(state) {
      state.loading = !state.loading;
    },
    setDriver(state, db) {
      state.DBDriver = db;
    },
    setRTM(state, rtm) {
      state.rtm = rtm;
    },
  },
});

class DBDriver {
  constructor() {
    this.config = store.state.config;
    this.client = null;
    this.db = null;
  }
  async getDb() {
    if (this.db) return this.db;
    await this.connect();
    return this.db;
  }
  async connect() {
    this.client = new MongoClient(this.config.host, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.connection = await this.client.connect();
    this.db = this.connection.db(this.config.name);
  }
  async reconnect(config) {
    this.config = config || store.state.config;
    await this.client?.close(true);
    this.connection = null;
    this.db = null;
    await this.connect();
  }
}

export const globalDriver = new DBDriver();

export const persistentStorage = new Store();

const deleteFolderRecursive = async (path) => {
  if (await exist(path)) {
    const dirs = await readdir(path);
    dirs.forEach(async (file) => {
      const curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        await deleteFolderRecursive(curPath);
      } else { // delete file
        await unlink(curPath);
      }
    });
    await rmdir(path);
  }
};
