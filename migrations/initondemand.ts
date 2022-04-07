import {init} from './init';

init(process.argv[2],parseInt(process.argv[3]),parseInt(process.argv[4])).then(()=>console.log("Game Initialized!"));