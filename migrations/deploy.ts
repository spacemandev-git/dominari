import {Dominari} from '../js/src/dominari';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import fs from 'fs';

import * as anchor from '@project-serum/anchor';


async function main(){
    const APOLLO_KEYPAIR = anchor.web3.Keypair.fromSecretKey(bs58.decode(fs.readFileSync('tests/apollo.txt').toString()))
    const CONN_STRING = "http://localhost:8899"; // devnet: https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/
    const CONTRACT_ADDRESS = "BGYHifTqRGUnJMfugZn5sbAZqjMR6bPZ98NmLcDeb7N7";
    const IDL = JSON.parse(fs.readFileSync('target/idl/dominari.json').toString());
    const di = new Dominari(CONN_STRING, CONTRACT_ADDRESS, APOLLO_KEYPAIR, IDL);

    // Init Game
        // Init Drop Tables
        // Init Buildables
    //Initalize a bunch of spaces
    //Build features on a couple spaces
    //Register a player
    //Play a card onto an initalized space
    //Regiser Second player
    //Attack first player with deployed card
    //Move troop to feature and try out Portal and Loot and Healer
    //Register Callback for Events that happen
}

main();

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
