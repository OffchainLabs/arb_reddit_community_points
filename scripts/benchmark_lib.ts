import { arbWallet, generateSignature, DistributionsContract, PointsContract, SubscriptionsContract, batchMint, getLastRound,  } from "./contracts_lib"
import { ethers, Wallet } from 'ethers'
import { TransactionResponse } from 'ethers/providers'
import { BigNumber, formatEther } from 'ethers/utils'
const karmaConstant = new BigNumber(1000)
const round = new BigNumber(0)


const printTotalGasUsed = (txnResponses: Promise<TransactionResponse>[],  message: string, next?: () => any)=>{
    Promise.all(txnResponses).then((responses)=>{
        
        const receiptPromises = responses.map((res)=> res.wait());
        Promise.all(receiptPromises).then((receipts) =>{
            const totalGasUsed = receipts.reduce((acc, current)=>( acc.add(current.gasUsed)), new BigNumber(0))
            console.log(message + totalGasUsed)
            console.log("");
            
            next && next()
        })
    })
}

const randomSignedClaim = async ()=>{
    const address = Wallet.createRandom().address
    const signature =   await generateSignature(address,round, karmaConstant)
    return {
        address,
        signature
    }
}
export const batchClaims  = async (count: number, next?: () => any)=>{
    console.info(`broadcasting ${count} claims...`)

    let txCount =  await arbWallet.getTransactionCount()
    const claims = []
    for (let i = 0; i < count; i++) {
        const signedClaim = await randomSignedClaim()
        claims.push(
            DistributionsContract.claim(round, signedClaim.address, karmaConstant, signedClaim.signature, {nonce: txCount })
            )
        txCount++
    }
    printTotalGasUsed(claims, `Gas used in ${count} claims: `, next)
}


export const batchSubscribes = async  (count: number, next?: () => any)=>{
    let txCount =  await arbWallet.getTransactionCount()
    const subscribes = []
    for (let i = 0; i < count; i++) {
        subscribes.push(
            SubscriptionsContract.subscribe(arbWallet.address, false, {nonce:txCount})
            )
        txCount++
    }
    printTotalGasUsed(subscribes, `Gas used in ${count} subscribes: `,next)
}

export const setup = async ()=>{
    const { address } = arbWallet
    const bal = await PointsContract.balanceOf(address)
    
    if (bal.isZero()) {
        console.warn('op needs tokens....');
        const signature =   await generateSignature(address,round, karmaConstant)
        try { 
            const res = await DistributionsContract.claim(round, address, karmaConstant, signature)
            await res.wait()
            console.info('tokens successfully claimed for op')
        } catch (err){
            console.warn('Error claiming tokens for op:', err);
            
        }
    } else {
        console.info('op has tokens:', bal.toNumber())
    }
    console.info("")

}
export const batchTrasfers = async (count: number, next?: () => any)=>{
    console.info(`broadcasting ${count} transfers...`)
    const rec = Wallet.createRandom().address
    let txCount =  await arbWallet.getTransactionCount()
    const transfers = []
    for (let i = 0; i < count; i++) {
        transfers.push(
            PointsContract.transfer(rec, new BigNumber(1), {nonce:txCount })
            )
        txCount++
    }
    printTotalGasUsed(transfers, `Gas used in ${count} transfers: `, next)
}

export const batchBurns = async (count: number, next?: () => any )=>{
    console.info(`broadcasting ${count} burns...`)

    const rec = Wallet.createRandom().address
    let txCount =  await arbWallet.getTransactionCount()
    const burns = []
    for (let i = 0; i < count; i++) {
        burns.push(
            PointsContract.burn(1, '0x', {nonce:txCount })
            )
        txCount++
    }
    printTotalGasUsed(burns, `Gas used in ${count} burns: `,next)
}
