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
import * as anchor from '@project-serum/anchor';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import { LocationAccount } from '../js/src';


export async function simulate(){
    const id = "simgame-01";
    const nx = 0; 
    const ny = 0;

    const game:Dominari = await init(id,nx,ny);
    const game2:Dominari = new Dominari(
        "http://localhost:8899",
        "BGYHifTqRGUnJMfugZn5sbAZqjMR6bPZ98NmLcDeb7N7",
        anchor.web3.Keypair.fromSecretKey(bs58.decode(fs.readFileSync('migrations/assets/apollo2.txt').toString())),
        JSON.parse(fs.readFileSync('target/idl/dominari.json').toString()),
        nx,ny,id
    );

    //SETUP LOGS
    const eventSubscription = game.events.subscribe((event) => {
        fs.appendFileSync(`migrations/logs/${event.name}.out`, JSON.stringify({slot: event.slot, data: event.event}, null, 2) + "\n");
    })

    //INIT 5x5 Grid
    let locations = {};
    let locationPromises = [];
    let locationAddressesToCoordinate = {};
    for(let i=-2; i<3; i++){
        locations[i] = {};
        for(let j=-2; j<3; j++){
            locationPromises.push(
                game.initalizeSpace({
                    nx: nx,
                    ny: ny,
                    x: i,
                    y: j
                }).then(loc_address => {
                    locations[i][j] = loc_address;
                    locationAddressesToCoordinate[loc_address.toString()] = {nx: nx, ny: ny, x: i, y: j};
                })
            )
        }
    }
    await Promise.all(locationPromises);
    //Print Location Addresses
    console.log("Locations: ");
    for(let x=-2; x<3; x++){
        for(let y=-2; y<3; y++){
            console.log(`(${x},${y}): ${locations[x][y]}`)
        }
    }

    await prettyPrint5x5(game, locationAddressesToCoordinate);

    //Build Features on four spaces
    fs.appendFileSync('migrations/logs/terminal.out', "Building Features\n");
    let buildablePromises = [];
    // Build 2 portals on (-2,2) and (2,-2)
    buildablePromises.push(game.debugBuild({nx:0,ny:0,x:-2,y:2}, 0));
    buildablePromises.push(game.debugBuild({nx:0,ny:0,x:2,y:-2}, 0));
    // Build a healer on (0,1)
    buildablePromises.push(game.debugBuild({nx:0,ny:0,x:0,y:1}, 1));
    // Build a lootable feature of (1,0)
    buildablePromises.push(game.debugBuild({nx:0,ny:0,x:1,y:0}, 2));
    const locationAccountsAfterBuild = await Promise.all(buildablePromises);
    fs.appendFileSync("migrations/logs/terminal.out", JSON.stringify(locationAccountsAfterBuild, null, 2) + "\n\n");
    await prettyPrint5x5(game, locationAddressesToCoordinate);

    //Register a couple players
    fs.appendFileSync('migrations/logs/terminal.out', "Registering Players\n");
    const player1 = await game.registerPlayer("Player1");
    console.log("Player1: ", player1);
    const player2 = await game2.registerPlayer("Player2");
    console.log("Player2: ", player2);
    fs.appendFileSync('migrations/logs/terminal.out', JSON.stringify({player1: player1, player2:player2}, null, 2) + "\n\n");

    //Play Scout on (1,1) and (1,2)
    fs.appendFileSync('migrations/logs/terminal.out', "Playing Scout Cards\n");
    const loc1 = await game.playCard({nx:nx, ny:ny, x:1, y:1}, 0);
    const loc2 = await game2.playCard({nx:nx, ny:ny, x:1, y:2}, 0);
    fs.appendFileSync('migrations/logs/terminal.out', JSON.stringify({loc1: loc1, loc2:loc2}, null, 2) + "\n\n");
    await prettyPrint5x5(game, locationAddressesToCoordinate);

    //Cleanup
    eventSubscription.unsubscribe();
    game.shutdownEventListeners();
    return;
}


async function prettyPrint5x5(game: Dominari, locations:any){
    const location_accs = await game.getLocationsByAddress(Object.keys(locations));
    const gi = (x:number,y:number) => {
        const account:LocationAccount = <LocationAccount>location_accs.find((loc:any) => (
            new anchor.BN(x).eq(<anchor.BN>loc.coords.x) &&
            new anchor.BN(y).eq(<anchor.BN>loc.coords.y)
        ));

        if(!account) { 
            console.log(`No account found for ${x},${y}`);
            return undefined;
        }

        return {
            t: account.troops ? (account.troops.meta.name.substring(0,10) + `| ${account.troops.data.power}`).padEnd(14) : "".padEnd(14),
            b: account.feature ? (account.feature.nameRankLadder[account.feature.rank-1].substring(0,12) + `| ${account.feature.rank}`).padEnd(14) : "".padEnd(14),
            p: account.troopOwner ? (account.troopOwner.toString().substring(0,14)).padEnd(14) : "".padEnd(14),
            c: `(${x},${y})`.padEnd(14)
        }
    }


    let printout = 
    `
    | T: ${gi(-2,2).t}      |    | T: ${gi(-1,2).t}     |    | T: ${gi(0,2).t}      |    | T: ${gi(1,2).t}      |    | T: ${gi(2,2).t}      |
    | B: ${gi(-2,2).b}      |    | B: ${gi(-1,2).b}     |    | B: ${gi(0,2).b}      |    | B: ${gi(1,2).b}      |    | B: ${gi(2,2).b}      |
    | P: ${gi(-2,2).p}      |    | P: ${gi(-1,2).p}     |    | P: ${gi(0,2).p}      |    | P: ${gi(1,2).p}      |    | P: ${gi(2,2).p}      |
    | C: ${gi(-2,2).c}      |    | C: ${gi(-1,2).c}     |    | C: ${gi(0,2).c}      |    | C: ${gi(1,2).c}      |    | C: ${gi(2,2).c}      |
    _________________________________________________________________________________________________________________________________________
    | T: ${gi(-2,1).t}      |    | T: ${gi(-1,1).t}     |    | T: ${gi(0,1).t}      |    | T: ${gi(1,1).t}      |    | T: ${gi(2,1).t}      |
    | B: ${gi(-2,1).b}      |    | B: ${gi(-1,1).b}     |    | B: ${gi(0,1).b}      |    | B: ${gi(1,1).b}      |    | B: ${gi(2,1).b}      |
    | P: ${gi(-2,1).p}      |    | P: ${gi(-1,1).p}     |    | P: ${gi(0,1).p}      |    | P: ${gi(1,1).p}      |    | P: ${gi(2,1).p}      |
    | C: ${gi(-2,1).c}      |    | C: ${gi(-1,1).c}     |    | C: ${gi(0,2).c}      |    | C: ${gi(1,2).c}      |    | C: ${gi(2,2).c}      |
    _________________________________________________________________________________________________________________________________________
    | T: ${gi(-2,0).t}      |    | T: ${gi(-1,0).t}     |    | T: ${gi(0,0).t}      |    | T: ${gi(1,0).t}      |    | T: ${gi(2,0).t}      |
    | B: ${gi(-2,0).b}      |    | B: ${gi(-1,0).b}     |    | B: ${gi(0,0).b}      |    | B: ${gi(1,0).b}      |    | B: ${gi(2,0).b}      |
    | P: ${gi(-2,0).p}      |    | P: ${gi(-1,0).p}     |    | P: ${gi(0,0).p}      |    | P: ${gi(1,0).p}      |    | P: ${gi(2,0).p}      |
    | C: ${gi(-2,0).c}      |    | C: ${gi(-1,0).c}     |    | C: ${gi(0,0).c}      |    | C: ${gi(1,0).c}      |    | C: ${gi(2,0).c}      |
    _________________________________________________________________________________________________________________________________________
    | T: ${gi(-2,-1).t}     |    | T: ${gi(-1,-1).t}    |    | T: ${gi(0,-1).t}     |    | T: ${gi(1,-1).t}     |    | T: ${gi(2,-1).t}     |
    | B: ${gi(-2,-1).b}     |    | B: ${gi(-1,-1).b}    |    | B: ${gi(0,-1).b}     |    | B: ${gi(1,-1).b}     |    | B: ${gi(2,-1).b}     |
    | P: ${gi(-2,-1).p}     |    | P: ${gi(-1,-1).p}    |    | P: ${gi(0,-1).p}     |    | P: ${gi(1,-1).p}     |    | P: ${gi(2,-1).p}     |
    | C: ${gi(-2,-1).c}     |    | C: ${gi(-1,-1).c}    |    | C: ${gi(0,-1).c}     |    | C: ${gi(1,-1).c}     |    | C: ${gi(2,-1).c}     |
    _________________________________________________________________________________________________________________________________________
    | T: ${gi(-2,-2).t}     |    | T: ${gi(-1,-2).t}    |    | T: ${gi(0,-2).t}     |    | T: ${gi(1,-2).t}     |    | T: ${gi(2,-2).t}     |
    | B: ${gi(-2,-2).b}     |    | B: ${gi(-1,-2).b}    |    | B: ${gi(0,-2).b}     |    | B: ${gi(1,-2).b}     |    | B: ${gi(2,-2).b}     |
    | P: ${gi(-2,-2).p}     |    | P: ${gi(-1,-2).p}    |    | P: ${gi(0,-2).p}     |    | P: ${gi(1,-2).p}     |    | P: ${gi(2,-2).p}     |
    | C: ${gi(-2,-2).c}     |    | C: ${gi(-1,-2).c}    |    | C: ${gi(0,-2).c}     |    | C: ${gi(1,-2).c}     |    | C: ${gi(2,-2).c}     |
    _________________________________________________________________________________________________________________________________________
    \n`
    fs.appendFileSync("migrations/logs/prettyprint.out", printout);
    console.log(printout);
}

simulate();