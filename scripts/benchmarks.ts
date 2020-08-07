import { batchClaims, batchSubscribes, batchTrasfers, setup, batchBurns, printL1GasUsed  } from "./benchmark_lib"

import {  getLastRound, advanceRound, SubscriptionsContract,l1Bridge, l1Provider, } from "./contracts_lib"
require('dotenv').config();


(async ()=>{

    const startBlock  = await l1Provider.getBlockNumber()
    
    await setup();

    console.info('')
    console.info('*** L2 gas benchmarks ***')
    console.info('')


    batchTrasfers(20, ()=>{
        batchBurns(20, ()=>{
            batchClaims(20, ()=>{
                batchSubscribes(20, l1Gas)
            })
        })
    })

    const l1Gas = async ()=> {
        console.info('')
        console.info('*** L1 gas benchmarks ***')
        console.info('')
        const inbox = await l1Bridge.globalInboxConn()
        const { MessageDeliveredFromOrigin } = inbox.interface.events
        const topics = [MessageDeliveredFromOrigin.topic]
        const logs = await l1Provider
            .getLogs({
              topics,
              fromBlock: startBlock,
              toBlock: "latest"
            })
            if (logs.length === 4){
                printL1GasUsed(logs[0], "L1 Gas used in transfers batch: ")
                printL1GasUsed(logs[1], "L1 Gas used in burns batch: ")
                printL1GasUsed(logs[2], "L1 Gas used in claims batch: ")
                printL1GasUsed(logs[3], "L1 Gas used in subscribes batch: ")
                    
            } else {
                console.warn(`Error: expected to find 4 messages batches; instead found ${logs.length}. Try again`)
            }
            
    }
    // l1Gas()
    

})()
