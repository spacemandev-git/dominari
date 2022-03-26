//Set up Logs
//Initalize a bunch of spaces
//Build features on a couple spaces
//Register a player
//Play a card onto an initalized space
//Regiser Second player
//Attack first player with deployed card
//Move troop to feature and try out Portal and Loot and Healer

import {Dominari} from '../js/dist/dominari';
import {init} from './init';

export async function simulate(){
    const game:Dominari = await init(0,0);
    console.log("Game Initalized");
}

simulate();