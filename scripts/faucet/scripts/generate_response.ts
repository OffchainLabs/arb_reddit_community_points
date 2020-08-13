import { generateResponse } from '../../contracts_lib'
const address: string = process.argv.slice(2)[0];

( async ()=>{
    const res = await generateResponse(address)
    console.info('done', res)

})()
