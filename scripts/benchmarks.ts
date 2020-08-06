import { batchClaims, batchSubscribes, batchTrasfers, setup, batchBurns } from "./benchmark_lib"

import {  getLastRound, advanceRound, SubscriptionsContract } from "./contracts_lib"


(async ()=>{
    await setup()
    batchTrasfers(20, ()=>{
        batchBurns(20, ()=>{
            batchClaims(20, ()=>{
                batchSubscribes(20)
            })
        })
    })

})()
