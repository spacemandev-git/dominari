import {Feature, Card, Dominari} from '../js/dist/dominari';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import fs from 'fs';
import yml from 'js-yaml';
import * as anchor from '@project-serum/anchor';


export async function init(id:string, nx:number, ny:number){
    const APOLLO_KEYPAIR = anchor.web3.Keypair.fromSecretKey(bs58.decode(fs.readFileSync('migrations/assets/apollo.txt').toString()))
    const CONN_STRING = "https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/" //"http://localhost:8899"; // devnet: https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/
    const CONTRACT_ADDRESS = "domeqWjkc4X3nn2G6GvAMwNN96wV5WgRvUWVnt6LnsG";
    const IDL = JSON.parse(fs.readFileSync('target/idl/dominari.json').toString());
    const game = new Dominari(CONN_STRING, CONTRACT_ADDRESS, APOLLO_KEYPAIR, IDL);

    // Init Game
    await game.initGame(id,nx,ny);
    console.log(`Initialized Game in Neighborhood (${nx},${ny})`)
    //return game; // DEBUG SINCE DTs and Bs have already been initialized
    
    // Init Drop Tables
    let droptables = yml.loadAll(fs.readFileSync('migrations/assets/droptables.yml').toString());
    let dropTablePromises = []
    droptables.forEach((cards, idx) => {
        dropTablePromises.push(game.initDroptable(idx+1, cards as Card[]));
    })
    const droptable_accs = await Promise.all(dropTablePromises);
    droptable_accs.forEach((acc, idx) => {
        fs.writeFileSync(`./migrations/logs/droptable-${idx}.json`, JSON.stringify(acc, null,2));
    })
    console.log(`Initialized ${droptables.length} Droptables.`);

    // Init Buildables
    let features = yml.loadAll(fs.readFileSync('migrations/assets/features.yml').toString());
    const buildable_acc = await game.initBuildable(features as Feature[]);
    fs.writeFileSync(`./migrations/logs/buildables.json`, JSON.stringify(buildable_acc, null, 2));
    console.log(`Initialized ${features.length} Features.`);

    return game;
}

//Usually just called from simulate, but if you run the file then it'll just run init
//init(0,0);


// Any player can initialize a space, which will have a blank feature, in any neighborhood
// Any builder can build on the space 
// An admin can initialize a game for a specific neighborhood
// A player can register to play for a specific game. This gives them a starting card.
// An admin should be able to create a new drop table with cards
// An admin should be able to upload a new type of buildable
// A player can play a card onto an initalized Location
// A player can move troops between Locations
// A player can attack other troops
// A player can harvest a location if they were the first ones to initalize it
// A builder can harvest a location if they own the NFT
// A player can "activate" the feature on the location if it's not in cooldown for a fee
