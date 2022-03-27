//Set up Logs
//Initalize a bunch of spaces
//Build features on a couple spaces
//Register a player
//Play a card onto an initalized space
//Regiser Second player
//Attack first player with deployed card
//Move troop to feature and try out Portal and Loot and Healer
import fs from 'fs';
import {Dominari} from '../js/dist/dominari';
import {init} from './init';

export async function simulate(){
    const nx = 0; 
    const ny = 0;

    const game:Dominari = await init(nx,ny);

    //SETUP LOGS
    const eventSubscription = game.events.subscribe((event) => {
        fs.appendFileSync(`migrations/logs/${event.name}.out`, JSON.stringify({slot: event.slot, data: event.event}, null, 2));
    })

    //INIT 3x3 Grid
    let locations = {};
    let locationPromises = [];
    for(let i=0; i<3; i++){
        locations[i] = {};
        for(let j=0; j<3; j++){
            locationPromises.push(
                game.initalizeSpace({
                    nx: nx,
                    ny: ny,
                    x: i,
                    y: j
                }).then(loc_address => {
                    locations[i][j] = loc_address;
                })
            )
        }
    }
    await Promise.all(locationPromises);
    //Print Location Addresses
    console.log("Locations: ");
    for(let x=0; x<3; x++){
        for(let y=0; y<3; y++){
            console.log(`(${x},${y}): ${locations[x][y]}`)
        }
    }

    eventSubscription.unsubscribe();
    return;
}



simulate();