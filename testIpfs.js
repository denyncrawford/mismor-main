const { MongoClient } = require("mongodb");

class DBDriver {
  constructor() {
    this.config = {
      host: 'mongodb://localhost:27017',
      name: 'mismor'
    };

    this.db = null;
  }
  async getDb() {
    if (this.db) return this.db;
    await this.connect();
    return this.db;
  }
  async connect() {
    const client = new MongoClient(this.config.host, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    const connection = await client.connect();
    this.db = connection.db(this.config.name);
  }
  async reconnect(config) {
    this.config = config || store.state.config;
    this.db = null;
    await this.connect();
  }
}

const test = async () => { 
  console.log('Test Start');
  console.time('Total time')
  const driver = new DBDriver();
  for (let i = 0; i<1001; i++) {
    const db = await driver.getDb();
    const coll = db.collection('entries')
    console.time('Duration');
    await coll.find({});
    console.log(`Query #${i}`);
    console.timeEnd('Duration')
  }
  console.timeEnd('Total time')
  console.log('End of test');
}

test();