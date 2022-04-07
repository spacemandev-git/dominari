import {Dominari} from '../js/dist/dominari';
import fs from 'fs';
import * as anchor from '@project-serum/anchor';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';

async function main(){
    const connString = "http://137.184.197.105:8899";
    const game:Dominari = new Dominari(
        connString,
        "domeqWjkc4X3nn2G6GvAMwNN96wV5WgRvUWVnt6LnsG",
        anchor.web3.Keypair.fromSecretKey(bs58.decode(fs.readFileSync('migrations/assets/apollo2.txt').toString())),
        JSON.parse(fs.readFileSync('target/idl/dominari.json').toString()),
        0,0,process.argv[2]
    );

    await game.airdrop();
    await game.registerPlayer("Player 1");
    console.log(await game.getPlayer());
}

main()