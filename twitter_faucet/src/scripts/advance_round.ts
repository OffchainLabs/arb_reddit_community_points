import { advanceRound, getLastRound } from '../Distribution'
console.info('advancng to next round...');

( async ()=>{
    const res = await advanceRound()
    console.info('done')

})()
