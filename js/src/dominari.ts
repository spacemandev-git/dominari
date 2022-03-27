import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { Dominari as ditypes}  from './types/dominari';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import * as byteify from 'byteify';
import * as nft from '@nfteyez/sol-rayz';
import {Observable} from "rxjs";
import * as TYPES from './interfaces';

interface ObservableEvent {
    slot: number, 
    name: string,
    event: any
}

export class Dominari {
    private _CONNECTION: anchor.web3.Connection;
    private _PROVIDER: anchor.Provider;
    private _IDL:any;
    private _PROGRAM:Program<ditypes>;
    
    private onLogsListener: number;
    public events:Observable<ObservableEvent>; //Observable that emits events
    public EVENTLIST = [
        'NewLocationInitialized',
        'FeatureModified',
        'NewPlayerRegistered',
        'TroopsMoved',
        'Combat',
        'LocationHarvested',
        'LocationBuilderHarvested',
        'HealerActivated',
        'PortalActivated',
        'LocationLooted'
    ]

    private ADMIN_KEY = new anchor.web3.PublicKey("83vu98TvDWstyexssmc3FmyN2KCjbSQf6sVYcger6Rxg");
    private SPACE_PROGRAM_ID = new anchor.web3.PublicKey('XSPCZghPXkWTWpvrfQ34Szpx3rwmUjsxebRFf5ckbMD');
    private EXTEND_BASE_PK = new anchor.web3.PublicKey('XBSEZzB7ojaKgXqfCSpNbPLnuMGk3JVtSKYjXYqg7Pn');
    private BUILDABLES_PK: anchor.web3.PublicKey;
    private gameNX: number;
    private gameNY: number;

    private LOG_START_INDEX = "Program log: ".length;

    /**
     * Creates a new instance of the dominari game object.
     * @param _connString The RPC Address as a string,
     * @param _CONTRACT_ADDRESS The contract address for the game
     * @param _KEYPAIR The primary keypair you want to interact with as signing for all transactions
     * @param _IDL The JSON IDL to use
     * @param _nx NX of an existing initialized game
     * @param _ny NY of an existing initialized game
     */
    constructor(
        _connString: string,
        _CONTRACT_ADDRESS: string,
        _KEYPAIR: anchor.web3.Keypair,
        _IDL: any,
        _nx?:number,
        _ny?:number
    ) {
        this._CONNECTION = new anchor.web3.Connection(_connString, "finalized");
        this._IDL = _IDL;
        this._PROVIDER = new anchor.Provider(this._CONNECTION, new NodeWallet(_KEYPAIR), {});
        this._PROGRAM = new anchor.Program<ditypes>(this._IDL, _CONTRACT_ADDRESS, this._PROVIDER);
        let [buildables_address, buildables_bmp] = findProgramAddressSync([Buffer.from("buildables")],this._PROGRAM.programId);
        this.BUILDABLES_PK = buildables_address;
        if(_nx && _ny){
            this.gameNX = _nx,
            this.gameNY = _ny
        }

        this.setupEventListeners();
    }

    /**
     * Starts up the event listener. Automatically does this on constructor, so shouldn't need to call it.
     */
    public setupEventListeners(){
        this.events = new Observable((obs) => {
            this.onLogsListener = this._CONNECTION.onLogs('all', (logs, ctx) => {
                if(logs.logs[0].startsWith(`Program ${this._PROGRAM.programId.toString()}`)){
                    for(let log of logs.logs){
                        if(log.startsWith("Program log:")){
                            const logStr = log.slice(this.LOG_START_INDEX);
                            const event = this._PROGRAM.coder.events.decode(logStr);
                            if(event){
                                obs.next({
                                    slot: ctx.slot,
                                    name: event.name,
                                    event: event.data
                                })
                            }
                        }
                    }
                }
            });    
        })
    }

    /**
     * Shuts down the events listener
     */
    public shutdownEventListeners(){
        this._CONNECTION.removeOnLogsListener(this.onLogsListener);
    }

    /**
     * Initializes a empty space. Initalized spaces collect fees from builders that can be claimed by the initalizer. 
     * Troops can only move onto initalized spaces. Buildings can only be built on initialized spaces.
     * @param coords The coordinate object containing the neighborhood and specific x,y of the location
     */
    public async initalizeSpace(coords: TYPES.Coords){
        try{
            const bn_coords = {
                nx: new anchor.BN(coords.nx),
                ny: new anchor.BN(coords.ny),
                x: new anchor.BN(coords.x),
                y: new anchor.BN(coords.y)
            }

            const [loc_address, loc_bump] = findProgramAddressSync([
                byteify.serializeInt64(coords.nx),
                byteify.serializeInt64(coords.ny),
                byteify.serializeInt64(coords.x),
                byteify.serializeInt64(coords.y)
            ],this._PROGRAM.programId);

            await this._PROGRAM.methods
                .initLocation(bn_coords)
                .accounts({
                    location: loc_address,
                    initializer: this._PROVIDER.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                })
                .rpc();
            return loc_address;    
        } catch (e) {
            throw e;
        }
    }

    /**
     * Returns the list of deserialized location accounts
     * @param x The X coordinate of the space
     * @param y The Y coordinate of the space
     */
    public async getLocations(coords:TYPES.Coords[]){
        let addresses:anchor.web3.PublicKey[] = [];
        for(let coord of coords){
            const [loc_address, loc_bump] = findProgramAddressSync([
                byteify.serializeInt64(coord.nx),
                byteify.serializeInt64(coord.ny),
                byteify.serializeInt64(coord.x),
                byteify.serializeInt64(coord.y)
            ],this._PROGRAM.programId);
            addresses.push(loc_address);
        }
        try{
            return await this._PROGRAM.account.location.fetchMultiple(addresses);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Builds a feature ontop of a location. 
     * Will automatically check that the address you're using to sign transactions holds an NFT of that space.
     * @param coord The coordinates of the location you want to build on.
     * @param buildable_idx The index in buildables[] that you want to build on that location
     * @returns The location account that's been modified which should now represent the new building
     */
    public async buildLocation(coord:TYPES.Coords, buildable_idx:number){
        try {
            let ownerNFTs = await this.getSpaceNFTs();
            let NFT:TYPES.SPACENFT | undefined = ownerNFTs.find(nft => nft.x == coord.x && nft.y == coord.y);
            if (!NFT) {
                throw new Error(`(${coord.x},${coord.y}) NFT not found on ${this._PROVIDER.wallet.publicKey}`);
            }    

            const [space_metadata_account, sbmp] = findProgramAddressSync([
                this.EXTEND_BASE_PK.toBuffer(),
                Buffer.from("space_metadata"),
                byteify.serializeInt64(coord.x).reverse(),
                byteify.serializeInt64(coord.y).reverse()
            ], this.SPACE_PROGRAM_ID)

            const [loc_address, loc_bump] = findProgramAddressSync([
                byteify.serializeInt64(coord.nx),
                byteify.serializeInt64(coord.ny),
                byteify.serializeInt64(coord.x),
                byteify.serializeInt64(coord.y)
            ],this._PROGRAM.programId);

            const tx_receipt = await this._PROGRAM.methods
                .buildLocation(new anchor.BN(buildable_idx))
                .accounts({
                    location: loc_address,
                    spaceTokenAccount: NFT.pubkey,
                    spaceMetadataAccount: space_metadata_account,
                    builder: this._PROVIDER.wallet.publicKey,
                    buildables: this.BUILDABLES_PK,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();
            return await this._PROGRAM.account.location.fetch(loc_address);
        } catch (e) {
            throw e;
        }
    }

    /**
     * ADMIN METHOD
     * Bypasses NFT check for building on a location
     * @param coord The coordinates of the location you want to build on.
     * @param buildable_idx The index in buildables[] that you want to build on that location
     * @returns The location account that's been modified which should now represent the new building
     */
    public async debugBuild(coord:TYPES.Coords, buildable_idx:number){
        const [loc_address, loc_bump] = findProgramAddressSync([
            byteify.serializeInt64(coord.nx),
            byteify.serializeInt64(coord.ny),
            byteify.serializeInt64(coord.x),
            byteify.serializeInt64(coord.y)
        ],this._PROGRAM.programId);

        const tx_receipt = await this._PROGRAM.methods
            .buildLocation(new anchor.BN(buildable_idx))
            .accounts({
                location: loc_address,
                builder: this._PROVIDER.wallet.publicKey,
                buildables: this.BUILDABLES_PK,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
        return await this._PROGRAM.account.location.fetch(loc_address);
    }

    /**
     * Initalizes a game at a given X,Y Coordinate
     * @param id The unique identifier for this game
     * @param nx The neighborhood X coordinate
     * @param ny The neighborhood Y coordinate
     */
    public async initGame(id:string, nx: number, ny: number){
        try{
            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }

            const [game_acc, game_bmp] = findProgramAddressSync([
                Buffer.from(id),
                byteify.serializeInt64(nx),
                byteify.serializeInt64(ny)
            ], this._PROGRAM.programId);

            await this._PROGRAM.methods
                .initGame(
                    id,
                    new anchor.BN(nx),
                    new anchor.BN(ny),
                )
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    game: game_acc    
                })
                .rpc();
            
            this.gameNX = nx;
            this.gameNY = ny;
            return await this._PROGRAM.account.game.fetch(game_acc);
        } catch (e) {
            throw e;
        }
    }

    /**
     * ADMIN ONLY
     * Toggles the enabled state of the game allowing or disallowing moves.
     * @param nx 
     * @param ny 
     * @returns 
     */
    public async toggleGame(nx:number, ny:number){
        try{
            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }

            const [game_acc, game_bmp] = findProgramAddressSync([
                byteify.serializeInt64(nx),
                byteify.serializeInt64(ny)
            ], this._PROGRAM.programId);

            await this._PROGRAM.methods
                .toggleGame()
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    game: game_acc    
                })
                .rpc();
            
            return await this._PROGRAM.account.game.fetch(game_acc);
        } catch (e) {
            throw e;
        } 
    }

    /**
     * Registers a given player for a game which gives them a hand of cards for that game. 
     * @param playerName The name of the player account
     * @returns The newly created player account
     */
    public async registerPlayer(playerName:string){
        try {
            if(!this.gameNX || !this.gameNY){
                throw new Error("Please initalize a game first!");
            }

            const [game_acc, game_bmp] = findProgramAddressSync([
                byteify.serializeInt64(this.gameNX),
                byteify.serializeInt64(this.gameNY)
            ], this._PROGRAM.programId);

            const [player_acc, player_bmp] = findProgramAddressSync([
                game_acc.toBuffer(),
                this._PROVIDER.wallet.publicKey.toBuffer()
            ], this._PROGRAM.programId)

            const tx_receipt = await this._PROGRAM.methods
                .registerPlayer(playerName)
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    game: game_acc,
                    player: player_acc
                })
                .rpc();

            return await this._PROGRAM.account.player.fetch(player_acc);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Returns the player account for the initialized game
     * @param playerPK The player public key
     */
    public async getPlayerFromPublicKey(playerPK: string){
        if(!this.gameNX || !this.gameNY){
            throw new Error("Please initalize a game first!");
        }

        const [game_acc, game_bmp] = findProgramAddressSync([
            byteify.serializeInt64(this.gameNX),
            byteify.serializeInt64(this.gameNY)
        ], this._PROGRAM.programId);

        const [player_acc, player_bmp] = findProgramAddressSync([
            game_acc.toBuffer(),
            new anchor.web3.PublicKey(playerPK).toBuffer()
        ], this._PROGRAM.programId)

        return await this._PROGRAM.account.player.fetch(player_acc);
    }

    /**
     * Returns all players registered at this time
     * @returns All players
     */
    public async getAllPlayers(){
        return await this._PROGRAM.account.player.all();
    }

    /**
     * Initializes a drop table with a given ID
     * @param id The id for the drop table
     * @param cards The list of cards for the drop table.
     * @returns The newly created drop table account
     */
    public async initDroptable(id: number, cards:TYPES.Card[]){
        try {
            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }
            
            //Only recovery is of type i64 which is greater than the number field in JS so it needs to be converted to big number
            // Rest should be fine as regular numbers as they are only i8s
            // droptableid and id are u64 which is also a problem
            cards = cards.map(card => {
                card.dropTableId = new anchor.BN(card.dropTableId);
                card.id = new anchor.BN(id);
                card.pointValue = new anchor.BN(card.pointValue);
                if(card.data.unitmod) {
                    card.data.unitmod.stats.recovery = new anchor.BN(card.data.unitmod.stats.recovery)
                } else if (card.data.unit) {
                    card.data.unit.stats.recovery = new anchor.BN(card.data.unit.stats.recovery)
                }
                return card;
            });
            
            const [dropTableAcc, dropTableBmp] = findProgramAddressSync([
                byteify.serializeUint64(id)
            ],this._PROGRAM.programId)
            
            await this._PROGRAM.methods
                .initDropTable(new anchor.BN(id), cards)
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    dropTableAcc: dropTableAcc
                })
                .rpc();
            
            return await this._PROGRAM.account.dropTable.fetch(dropTableAcc);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Buildables are features that can be built ontop of a space by someone that owns the NFT. 
     * To build a buildable, they need to pass in the idx of the buildable they want to build from this array.
     * @param features Initalizes the buildables array for the game
     * @returns The buildable account
     */
    public async initBuildable(features: TYPES.Feature[]){
        try{
            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }

            features = features.map(feature => {
                feature.rankUpgradeCostMultiplier = new anchor.BN(feature.rankUpgradeCostMultiplier)
                feature.costForUseLadder = feature.costForUseLadder.map(cost => {
                    return new anchor.BN(cost)
                });
                if(feature.properties.healer){
                    feature.properties.healer.powerHealedPerRank = new anchor.BN(feature.properties.healer.powerHealedPerRank);
                } else if (feature.properties.lootablefeature) {
                    feature.properties.lootablefeature.dropTableLadder = feature.properties.lootablefeature.dropTableLadder.map(dropTable => {
                        return new anchor.BN(dropTable);
                    });
                } else if (feature.properties.portal){
                    feature.properties.portal.rangePerRank = new anchor.BN(feature.properties.portal.rangePerRank);
                }
                feature.lastUsed = new anchor.BN(feature.lastUsed);
                feature.recovery = new anchor.BN(feature.recovery);
                return feature;
            })

            await this._PROGRAM.methods
                .initBuildable(features)
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    buildables: this.BUILDABLES_PK
                })
                .rpc();

            return await this._PROGRAM.account.buildables.fetch(this.BUILDABLES_PK);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Returns the buildables array
     * @returns The buildables account
     */
    public async getBuildables(){
        return await this._PROGRAM.account.buildables.fetch(this.BUILDABLES_PK);
    }

    /**
     * Plays a card from the player's hand to the given location.
     * Does not validate anything, as invlaid plays will error out Solana side.
     * @param coord THe Location you want to play the card on
     * @param card_idx The index of the player's cards array you want to play
     * @returns 
     */
    public async playCard(coord:TYPES.Coords, card_idx:number){
        try {
            if(!this.gameNX || !this.gameNY){
                throw new Error("Please initalize a game first!");
            }
    
            const [game_acc, game_bmp] = findProgramAddressSync([
                byteify.serializeInt64(this.gameNX),
                byteify.serializeInt64(this.gameNY)
            ], this._PROGRAM.programId);
    
            const [player_acc, player_bmp] = findProgramAddressSync([
                game_acc.toBuffer(),
                this._PROVIDER.wallet.publicKey.toBuffer()
            ], this._PROGRAM.programId)
    

            const [loc_address, loc_bmp] = findProgramAddressSync([
                byteify.serializeInt64(coord.nx),
                byteify.serializeInt64(coord.ny),
                byteify.serializeInt64(coord.x),
                byteify.serializeInt64(coord.y)
            ], this._PROGRAM.programId)


            return await this._PROGRAM.methods
                .playCard(card_idx)
                .accounts({
                    player: player_acc,
                    game: game_acc,
                    authority: this._PROVIDER.wallet.publicKey,
                    location: loc_address
                })
                .rpc();
        } catch (e) {
            throw e;
        }
    }

    /**
     * If the destination is EMPTY, then will move the troops from the source to the destination.
     * @param source The location the troops are being moved from.
     * @param destination The location the troops are being moved to.
     * @returns The destination account after the move
     */
    public async move(source: TYPES.Coords, destination: TYPES.Coords){
        try {
            if(!this.gameNX || !this.gameNY){
                throw new Error("Please initalize a game first!");
            }
    
            const [game_acc, game_bmp] = findProgramAddressSync([
                byteify.serializeInt64(this.gameNX),
                byteify.serializeInt64(this.gameNY)
            ], this._PROGRAM.programId);
    
            const [player_acc, player_bmp] = findProgramAddressSync([
                game_acc.toBuffer(),
                this._PROVIDER.wallet.publicKey.toBuffer()
            ], this._PROGRAM.programId)
    
            const [source_acc, source_bmp] = findProgramAddressSync([
                byteify.serializeInt64(source.nx),
                byteify.serializeInt64(source.ny),
                byteify.serializeInt64(source.x),
                byteify.serializeInt64(source.y)
            ], this._PROGRAM.programId);

            const [destination_acc, target_bmp] = findProgramAddressSync([
                byteify.serializeInt64(destination.nx),
                byteify.serializeInt64(destination.ny),
                byteify.serializeInt64(destination.x),
                byteify.serializeInt64(destination.y)
            ], this._PROGRAM.programId);

            await this._PROGRAM.methods
                .moveTroops()
                .accounts({
                    game: game_acc,
                    soruce: source_acc,
                    target: destination_acc,
                    player: player_acc,
                    authority: this._PROVIDER.wallet.publicKey
                })
                .rpc();

            return await this._PROGRAM.account.location.fetch(destination_acc);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Attacks troops at the destination with the troops at the source
     * @param source The source location of the attacking troops
     * @param destination The destination location of the defending troops
     * @returns The source and destination locations after the attack
     */    
    public async attack(source: TYPES.Coords, destination: TYPES.Coords){
        try {
            if(!this.gameNX || !this.gameNY){
                throw new Error("Please initalize a game first!");
            }
    
            const [game_acc, game_bmp] = findProgramAddressSync([
                byteify.serializeInt64(this.gameNX),
                byteify.serializeInt64(this.gameNY)
            ], this._PROGRAM.programId);
    
            const [player_acc, player_bmp] = findProgramAddressSync([
                game_acc.toBuffer(),
                this._PROVIDER.wallet.publicKey.toBuffer()
            ], this._PROGRAM.programId)
    
            const [source_acc, source_bmp] = findProgramAddressSync([
                byteify.serializeInt64(source.nx),
                byteify.serializeInt64(source.ny),
                byteify.serializeInt64(source.x),
                byteify.serializeInt64(source.y)
            ], this._PROGRAM.programId);

            const [destination_acc, destination_bmp] = findProgramAddressSync([
                byteify.serializeInt64(destination.nx),
                byteify.serializeInt64(destination.ny),
                byteify.serializeInt64(destination.x),
                byteify.serializeInt64(destination.y)
            ], this._PROGRAM.programId);

            await this._PROGRAM.methods
                .attack()
                .accounts({
                    game: game_acc,
                    soruce: source_acc,
                    target: destination_acc,
                    player: player_acc,
                    authority: this._PROVIDER.wallet.publicKey
                })
                .rpc();

            return await this._PROGRAM.account.location.fetchMultiple([source_acc,destination_acc]);
        } catch (e) {
            throw e;
        }
    }
 
    /**
     * Harvests the location of lamports that have been invested through buildings since initialization. 
     * Can only be called by the initializer of the location. 
     * @param location The location to harvest
     * @returns The location object after it's been harvested
     */
    public async harvestInitialzedLocation(location:TYPES.Coords){
        try {
            const [loc_address, loc_bmp] = findProgramAddressSync([
                byteify.serializeInt64(location.nx),
                byteify.serializeInt64(location.ny),
                byteify.serializeInt64(location.x),
                byteify.serializeInt64(location.y)
            ], this._PROGRAM.programId);

            await this._PROGRAM.methods
                .harvestLocationInitializer()
                .accounts({
                    location: loc_address,
                    initializer: this._PROVIDER.wallet.publicKey,
                    system: anchor.web3.SystemProgram.programId
                })
                .rpc();
            return await this._PROGRAM.account.location.fetch(loc_address);

        } catch (e) {
            throw e;
        }
    }


    /**
     * Harvests the location of lamports that have been paid in fees for building activations.
     * Can only be called by the owner of the space NFT.
     * @param location The location to harvest
     * @returns The location object after it's been harvested
     */
    public async harvestFeatureRevenue(location:TYPES.Coords){
        try{
            let ownerNFTs = await this.getSpaceNFTs();
            let NFT:TYPES.SPACENFT | undefined = ownerNFTs.find(nft => nft.x == location.x && nft.y == location.y);
            if (!NFT) {
                throw new Error(`(${location.x},${location.y}) NFT not found on ${this._PROVIDER.wallet.publicKey}`);
            }    

            const [space_metadata_account, sbmp] = findProgramAddressSync([
                this.EXTEND_BASE_PK.toBuffer(),
                Buffer.from("space_metadata"),
                byteify.serializeInt64(location.x).reverse(),
                byteify.serializeInt64(location.y).reverse()
            ], this.SPACE_PROGRAM_ID)

            const [loc_address, loc_bmp] = findProgramAddressSync([
                byteify.serializeInt64(location.nx),
                byteify.serializeInt64(location.ny),
                byteify.serializeInt64(location.x),
                byteify.serializeInt64(location.y)
            ], this._PROGRAM.programId);

            await this._PROGRAM.methods
                .harvestLocationBuilder()
                .accounts({
                    location: loc_address,
                    builder: this._PROVIDER.wallet.publicKey,
                    system: anchor.web3.SystemProgram.programId,
                    spaceTokenAccount: NFT.pubkey,
                    spaceMetadataAccount: space_metadata_account
                })
                .rpc();

            return await this._PROGRAM.account.location.fetch(loc_address);
        } catch (e) {

        }
    }

    /**
     * COSTS SOLANA
     * Teleports from one location to another. To find the fee, fetch the source location and see it's fee structure.
     * @param source The source location with a portal
     * @param destination The destination location with a portal
     * @returns The destination location assuming the move was successful
     */
    public async activatePortal(source:TYPES.Coords, destination:TYPES.Coords){
        try{
            if(!this.gameNX || !this.gameNY){
                throw new Error("Please initalize a game first!");
            }
    
            const [game_acc, game_bmp] = findProgramAddressSync([
                byteify.serializeInt64(this.gameNX),
                byteify.serializeInt64(this.gameNY)
            ], this._PROGRAM.programId);
    
            const [player_acc, player_bmp] = findProgramAddressSync([
                game_acc.toBuffer(),
                this._PROVIDER.wallet.publicKey.toBuffer()
            ], this._PROGRAM.programId)
    
            const [source_acc, source_bmp] = findProgramAddressSync([
                byteify.serializeInt64(source.nx),
                byteify.serializeInt64(source.ny),
                byteify.serializeInt64(source.x),
                byteify.serializeInt64(source.y)
            ], this._PROGRAM.programId);

            const [destination_acc, destination_bmp] = findProgramAddressSync([
                byteify.serializeInt64(destination.nx),
                byteify.serializeInt64(destination.ny),
                byteify.serializeInt64(destination.x),
                byteify.serializeInt64(destination.y)
            ], this._PROGRAM.programId);


            await this._PROGRAM.methods
                .activateFeature()
                .accounts({
                    player: player_acc,
                    authority: this._PROVIDER.wallet.publicKey,
                    location: source_acc,
                    game: game_acc,
                    system: anchor.web3.SystemProgram.programId
                })
                .remainingAccounts([{
                    isWriteable: true,
                    isSigner: false,
                    pubkey: destination_acc
                }])
                .rpc();
            
            return await this._PROGRAM.account.location.fetch(destination_acc);
        } catch (e) {
            throw e;
        }
    }

    /**
     * COSTS SOLANA
     * Returns a random card from the drop table to the player's hand for a fee.
     * @param source The location where the lootable feature is located
     * @returns 
     */
    public async activateLootableFeature(source:TYPES.Coords){
        if(!this.gameNX || !this.gameNY){
            throw new Error("Please initalize a game first!");
        }

        const [game_acc, game_bmp] = findProgramAddressSync([
            byteify.serializeInt64(this.gameNX),
            byteify.serializeInt64(this.gameNY)
        ], this._PROGRAM.programId);

        const [player_acc, player_bmp] = findProgramAddressSync([
            game_acc.toBuffer(),
            this._PROVIDER.wallet.publicKey.toBuffer()
        ], this._PROGRAM.programId)

        const [source_acc, source_bmp] = findProgramAddressSync([
            byteify.serializeInt64(source.nx),
            byteify.serializeInt64(source.ny),
            byteify.serializeInt64(source.x),
            byteify.serializeInt64(source.y)
        ], this._PROGRAM.programId);
        
        const sourceData = await this._PROGRAM.account.location.fetch(source_acc);
        const dropTableId = sourceData?.feature?.properties['LootableFeature']['DropTableLadder'][sourceData.feature.rank];
        if(!dropTableId){
            throw new Error("Couldn't figure out location's Drop Table ID");
        }

        const [dropTable_acc, dropTable_bmp] = findProgramAddressSync([
            byteify.serializeUint64(dropTableId)
        ], this._PROGRAM.programId)

        await this._PROGRAM.methods
            .activateFeature()
            .accounts({
                player: player_acc,
                authority: this._PROVIDER.wallet.publicKey,
                location: source_acc,
                game: game_acc,
                system: anchor.web3.SystemProgram.programId
            })
            .remainingAccounts([{
                isWriteable: false,
                isSigner: false,
                pubkey: dropTable_acc
            }])
            .rpc();
        
        return await this._PROGRAM.account.player.fetch(player_acc);
    }

    /**
     * COSTS SOLANA
     * Heals the units standing on top of it an amount based on it's rank.
     * @param source 
     */
    public async activateHealer(source:TYPES.Coords){
        if(!this.gameNX || !this.gameNY){
            throw new Error("Please initalize a game first!");
        }

        const [game_acc, game_bmp] = findProgramAddressSync([
            byteify.serializeInt64(this.gameNX),
            byteify.serializeInt64(this.gameNY)
        ], this._PROGRAM.programId);

        const [player_acc, player_bmp] = findProgramAddressSync([
            game_acc.toBuffer(),
            this._PROVIDER.wallet.publicKey.toBuffer()
        ], this._PROGRAM.programId)

        const [source_acc, source_bmp] = findProgramAddressSync([
            byteify.serializeInt64(source.nx),
            byteify.serializeInt64(source.ny),
            byteify.serializeInt64(source.x),
            byteify.serializeInt64(source.y)
        ], this._PROGRAM.programId);

        await this._PROGRAM.methods
            .activateFeature()
            .accounts({
                player: player_acc,
                authority: this._PROVIDER.wallet.publicKey,
                location: source_acc,
                game: game_acc,
                system: anchor.web3.SystemProgram.programId
            })
            .rpc();

        return await this._PROGRAM.account.location.fetch(source_acc);
    }

    /**
     * ADMIN METHOD
     * @param source 
     * @returns 
     */
    public async destroyFeature(source:TYPES.Coords){
        try{
            const [source_acc, source_bmp] = findProgramAddressSync([
                byteify.serializeInt64(source.nx),
                byteify.serializeInt64(source.ny),
                byteify.serializeInt64(source.x),
                byteify.serializeInt64(source.y)
            ], this._PROGRAM.programId);

            await this._PROGRAM.methods
                .destroyFeature()
                .accounts({
                    location: source_acc,
                    authority: this._PROVIDER.wallet.publicKey
                })
                .rpc();
            
            return await this._PROGRAM.account.location.fetch(source_acc);
        } catch (e) {
            throw e;
        }
    }

    /**
     * ADMIN METHOD
     * Overwrites the Buildables array with the given features
     * @param features List of features to set the new buildables array
     * @returns The new buildables array
     */
    public async setBuildables(features: TYPES.Feature[]){
        try{
            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }

            features = features.map(feature => {
                feature.rankUpgradeCostMultiplier = new anchor.BN(feature.rankUpgradeCostMultiplier)
                feature.costForUseLadder = feature.costForUseLadder.map(cost => {
                    return new anchor.BN(cost)
                });
                if(feature.properties.healer){
                    feature.properties.healer.powerHealedPerRank = new anchor.BN(feature.properties.healer.powerHealedPerRank);
                } else if (feature.properties.lootablefeature) {
                    feature.properties.lootablefeature.dropTableLadder = feature.properties.lootablefeature.dropTableLadder.map(dropTable => {
                        return new anchor.BN(dropTable);
                    });
                } else if (feature.properties.portal){
                    feature.properties.portal.rangePerRank = new anchor.BN(feature.properties.portal.rangePerRank);
                }
                return feature;
            })

            await this._PROGRAM.methods
                .setBuildable(features)
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    buildables: this.BUILDABLES_PK
                })
                .rpc();

            return await this._PROGRAM.account.buildables.fetch(this.BUILDABLES_PK);
        } catch (e) {
            throw e;
        }
    }


    public async setDroptable(id: number, cards: TYPES.Card[]){
        try{
            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }

            //Only recovery is of type i64 which is greater than the number field in JS so it needs to be converted to big number
            // Rest should be fine as regular numbers as they are only i8s
            // droptableid and id are u64 which is also a problem
            cards = cards.map(card => {
                card.dropTableId = new anchor.BN(card.dropTableId);
                card.id = new anchor.BN(id);

                if(card.data.unitmod) {
                    card.data.unitmod.stats.recovery = new anchor.BN(card.data.unitmod.stats.recovery)
                } else if (card.data.unit) {
                    card.data.unit.stats.recovery = new anchor.BN(card.data.unit.stats.recovery)
                }
                return card;
            });

            const [dropTableAcc, dropTableBmp] = findProgramAddressSync([
                byteify.serializeUint64(id)
            ],this._PROGRAM.programId)
            
            await this._PROGRAM.methods
                .setDropTable(cards)
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    dropTableAcc: dropTableAcc
                })
                .rpc();
            
            return await this._PROGRAM.account.dropTable.fetch(dropTableAcc);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Returns all EXTEND NFTs owned by the Keypair provided in the constructor
     */
    public async getSpaceNFTs(){
        const owner = this._PROVIDER.wallet.publicKey;
        const connection = this._CONNECTION;

        //fetch all nfts for owner
        //for each that is a "space" nft, fetch the account by mint


        let allNFTAccounts = await nft.getParsedNftAccountsByOwner({
            publicAddress: owner.toString(),
            connection: connection
        })
    
        let spaceNFTs:TYPES.SPACENFT[] = []
        for(let token of allNFTAccounts){
            if(token.data.symbol == "EXT" && token.data.name.includes("Space")){
                //^this validation is fine for now cause if there's a dupe NFT it'll get kicked out by the rust validation anyway
                let sNFT = await nft.getParsedAccountByMint({
                    mintAddress: token.mint,
                    connection: connection
                });
                const x = parseInt(token.data.name.split('(')[1].split(",")[0]);
                const y = parseInt(token.data.name.split(",")[1].split(")")[0]);
        
                spaceNFTs.push({
                    pubkey: sNFT.pubkey,
                    mint: token.mint,
                    x: x,
                    y: y
                })
            }
        }
        return spaceNFTs;
    }
}

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