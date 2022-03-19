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

export class Dominari {
    private _CONNECTION: anchor.web3.Connection;
    private _PROVIDER: anchor.Provider;
    private _IDL:any;
    private _program:Program<ditypes>;
    
    public OBSERVABLES = {};
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

    /**
     * Creates a new instance of the dominari game object.
     * @param _connString The RPC Address as a string,
     * @param _CONTRACT_ADDRESS The contract address for the game
     * @param _KEYPAIR The primary keypair you want to interact with as signing for all transactions
     */
    constructor(
        _connString: string,
        private _CONTRACT_ADDRESS: string,
        private _KEYPAIR: anchor.web3.Keypair,
    ) {
        this._CONNECTION = new anchor.web3.Connection(_connString);
        this._IDL = JSON.parse(fs.readFileSync('../../target/idl/dominari.json').toString());
        this._PROVIDER = new anchor.Provider(this._CONNECTION, new NodeWallet(this._KEYPAIR), {});
        this._program = new anchor.Program<ditypes>(this._IDL, this._CONTRACT_ADDRESS, this._PROVIDER);

        this.setupEventListeners();
    }

    private setupEventListeners() {
        for (let evtName of this.EVENTLIST) {
            this.OBSERVABLES[evtName] = new Observable((observer) => {
                this._program.addEventListener(evtName, (evt, slot) => {
                    observer.next({event:evt, slot:slot});
                });
            });
        }
    }


}