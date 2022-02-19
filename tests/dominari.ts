import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { Dominari } from '../target/types/dominari';

import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import fs from 'fs';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

import * as byteify from 'byteify';

/*
describe('dominari', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const dominari = anchor.workspace.Dominari as Program<Dominari>;
  it('Is initialized!', async () => {
    const coords = {
      nx: new anchor.BN(0),
      ny: new anchor.BN(-1),
      x: new anchor.BN(2),
      y: new anchor.BN(-178)
    }
    const [loc_address, loc_bump] = findProgramAddressSync([coords.nx.toArrayLike(Buffer, "be", 8), coords.ny.toArrayLike(Buffer, "be", 8), coords.x.toArrayLike(Buffer, "be", 8), coords.y.toArrayLike(Buffer, "be", 8)], dominari.programId)
    await dominari.methods.debug(coords).rpc();

    
    await dominari.methods
      .initLocation(coords)
      .accounts({
        location: loc_address,
        initalizer: dominari.provider.wallet.publicKey
      })
      .rpc();
    
    //const acc = await dominari.account.location.fetch(loc_address);
    //console.log(JSON.stringify(acc));
    

  });
});
*/

describe('dominari', () => {
  const RPC_URL = "http://localhost:8899";
  //const RPC_URL = "http://api.devnet.solana.com"

  const CONTRACT_ADDRESS = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";
  const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
  const apollo_keypair = anchor.web3.Keypair.fromSecretKey(bs58.decode(fs.readFileSync('tests/apollo.txt').toString()))
  const provider = new anchor.Provider(connection, new NodeWallet(apollo_keypair), {});
  const idl = JSON.parse(fs.readFileSync('target/idl/dominari.json').toString());
  const dominari:Program<Dominari> = new anchor.Program<Dominari>(idl, CONTRACT_ADDRESS, provider);

  it('Location Initalized', async () => {
    const coords = {
      nx: new anchor.BN(0),   //0
      ny: new anchor.BN(-1),   //-1
      x: new anchor.BN(0),    //2
      y: new anchor.BN(0)     //-178
    }
    
    //console.log(coords.ny.toBuffer('be'));
    console.log(coords.ny);

    //const addr = findProgramAddressSync([new anchor.BN(0).toArrayLike(Buffer, "be", 8)], dominari.programId);
    //console.log(addr.toString());
    //await dominari.methods.debug(coords).rpc();
  
    const [loc_address, loc_bump] = findProgramAddressSync([byteify.serializeInt64(coords.nx.toNumber()), byteify.serializeInt64(coords.ny.toNumber()), byteify.serializeInt64(coords.x.toNumber()), byteify.serializeInt64(coords.y.toNumber())], dominari.programId)    
    console.log(loc_address.toString())

    await dominari.methods.initLocation(coords).accounts({
      location: loc_address,
      initalizer: dominari.provider.wallet.publicKey
    }).rpc();

    const acc = await dominari.account.location.fetch(loc_address);
    console.log(JSON.stringify(acc));
  })
})
