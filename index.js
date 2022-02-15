#!/usr/bin/env node

const { Etcd3 } = require('etcd3');
const args = require("args");

(async () => {
   try {
    args
        .option('remote', 'remote etcd address')
        .option('prefix', 'key prefix')

    const flags = args.parse(process.argv)

    let remote_address
    let prefix = "/"

    if(flags.remote) {
        remote_address = flags.remote
    }

    if(flags.prefix) {
        prefix = flags.prefix
    }

    if(!remote_address) {
        console.error("请输入远程etcd地址")
        return
    }

    const remote_client = new Etcd3({hosts: [remote_address]});
    const local_client = new Etcd3();

    const hash = await remote_client.getAll().prefix(prefix).strings()
    const keys = Object.keys(hash)
    console.log(`download remote client keys, count = ${keys.length}`)

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value = hash[key]

        console.log(`[${i+1}/${keys.length}] etcdctl put ${key} ${value}\n`)
        await local_client.put(key).value(value)
    }

    console.log('dump all keys success!')

   } catch (error) {
       console.log(error)
   }
})();
