import { advanceRound } from '../../contracts_lib'
console.info('advancng to next round...');

( async ()=>{
    const res = await advanceRound()
    console.info('done')

})()
