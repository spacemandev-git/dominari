import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { Dominari as ditypes}  from '../../target/types/dominari';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import * as fs from 'fs';
import * as byteify from 'byteify';
import * as nft from '@nfteyez/sol-rayz';
import {Observable} from "rxjs";
import * as TYPES from './types';

export class Dominari {
    private _CONNECTION: anchor.web3.Connection;
    private _PROVIDER: anchor.Provider;
    private _IDL:any;
    private _PROGRAM:Program<ditypes>;
    
    private _OBSERVABLES = {};
    public EVENTLIST = [
        'NewLocationInitalized',
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
        this._CONNECTION = new anchor.web3.Connection(_connString);
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

    private setupEventListeners() {
        for (let evtName of this.EVENTLIST) {
            this._OBSERVABLES[evtName] = new Observable((observer) => {
                this._PROGRAM.addEventListener(evtName, (evt, slot) => {
                    observer.next({event:evt, slot:slot});
                });
            });
        }
    }

    public getEventObservable(eventName:string): Observable<any> {
        return this._OBSERVABLES[eventName];
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

            const tx_receipt = await this._PROGRAM.methods
                .initLocation(bn_coords)
                .accounts({
                    location: loc_address,
                    initializer: this._PROVIDER.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId
                })
                .rpc();
            return tx_receipt;    
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
        let addresses = [];
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
            let NFT:TYPES.SPACENFT = ownerNFTs.find(nft => nft.x == coord.x && nft.y == coord.y);
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
     * Initalizes a game at a given X,Y Coordinate
     * @param nx The neighborhood X coordinate
     * @param ny The neighborhood Y coordinate
     */
    public async initGame(nx: number, ny: number){
        try{
            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }

            const [game_acc, game_bmp] = findProgramAddressSync([
                byteify.serializeInt64(nx),
                byteify.serializeInt64(ny)
            ], this._PROGRAM.programId);

            const tx_receipt = await this._PROGRAM.methods
                .initGame({
                    nx: new anchor.BN(nx),
                    ny: new anchor.BN(ny),
                    x: new anchor.BN(0), //doesn't really matter
                    y: new anchor.BN(0), //doesn't really matter
                })
                .accounts({
                    authority: this._PROVIDER.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    game: game_acc    
                })
                .rpc();
            
            this.gameNX = nx;
            this.gameNY = ny;
            return tx_receipt;
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
     * Initializes a drop table with a given ID
     * @param id 
     * @param cards 
     * @returns 
     */
    public async initDropTable(id: number, cards:TYPES.Card[]){
        try {
            if(!this.gameNX || !this.gameNY){
                throw new Error("Please initalize a game first!");
            }

            if(!this.ADMIN_KEY.equals(this._PROVIDER.wallet.publicKey)){
                throw new Error("Only the admin can call this function!");
            }
            
            //Only recovery is of type i64 which is greater than the number field in JS so it needs to be converted to big number
            // Rest should be fine as regular numbers as they are only i8s
            // droptableid and id are u64 which is also a problem
            cards = cards.map(card => {
                card.dropTableId = new anchor.BN(card.dropTableId);
                card.id = new anchor.BN(id);

                if(card.data.MOD) {
                    card.data.MOD.stats.recovery = new anchor.BN(card.data.MOD.stats.recovery)
                } else if (card.data.UNIT) {
                    card.data.UNIT.stats.recovery = new anchor.BN(card.data.UNIT.stats.recovery)
                }
                return card;
            });

            const [dropTableAcc, dropTableBmp] = findProgramAddressSync([
                byteify.serializeUint64(id)
            ],this._PROGRAM.programId)
            
            await this._PROGRAM.methods
                .initDropTable(id, cards)
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
            features = features.map(feature => {
                feature.rankUpgradeCostMulitiplier = new anchor.BN(feature.rankUpgradeCostMulitiplier)
                feature.costForUseLadder = feature.costForUseLadder.map(cost => {
                    return new anchor.BN(cost)
                });
                if(feature.properties.Healer){
                    feature.properties.Healer.powerHealedPerRank = new anchor.BN(feature.properties.Healer.powerHealedPerRank);
                } else if (feature.properties.LootableFeature) {
                    feature.properties.LootableFeature.dropTableLadder = feature.properties.LootableFeature.dropTableLadder.map(dropTable => {
                        return new anchor.BN(dropTable);
                    });
                } else if (feature.properties.Portal){
                    feature.properties.Portal.rangePerRank = new anchor.BN(feature.properties.Portal.rangePerRank);
                }
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

    public async moveTroops(){}
    public async attack(){}
    public async harvestInitialzedLocation(){}
    public async harvestFeatureRevenue(){}
    public async activateFeature(){}

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