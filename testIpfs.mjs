import Room  from 'ipfs-pubsub-room';
import IPFS from 'ipfs'
import { join }  from 'path';
import { homedir } from 'os';

const ipfs = await IPFS.create({
  init: true,
  start: true,
  repo: join(homedir(), '/.jsipfs'),
  EXPERIMENTAL: {
    ipnsPubsub: true
  },
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
})
const room = new Room(ipfs, 'room-name')