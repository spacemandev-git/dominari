import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { Dominari } from '../target/types/dominari';

import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import fs from 'fs';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

import * as byteify from 'byteify';
import * as nft from '@nfteyez/sol-rayz';


describe('dominari', () => {
  const localhost = new anchor.web3.Connection("http://localhost:8899");
  //const RPC_URL = "http://api.devnet.solana.com"
  const devnet = new anchor.web3.Connection('https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/');

  const CONTRACT_ADDRESS = "6Qi7Vg1X2NhB3f3xc7UsfD9fwHCe9DBT7mWMRfF2A8S4";
  //const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
  const apollo_keypair = anchor.web3.Keypair.fromSecretKey(bs58.decode(fs.readFileSync('tests/apollo.txt').toString()))
  const provider = new anchor.Provider(localhost, new NodeWallet(apollo_keypair), {});
  const idl = JSON.parse(fs.readFileSync('target/idl/dominari.json').toString());
  const dominari:Program<Dominari> = new anchor.Program<Dominari>(idl, CONTRACT_ADDRESS, provider);


  const coords = {
    nx: new anchor.BN(0),   //0
    ny: new anchor.BN(-1),   //-1
    x: new anchor.BN(2),    //2
    y: new anchor.BN(-178)     //-178
  }
  

  it('Location Initialized', async () => {
    //console.log(coords.ny.toBuffer('be'));
    const [loc_address, loc_bump] = findProgramAddressSync([byteify.serializeInt64(coords.nx.toNumber()), byteify.serializeInt64(coords.ny.toNumber()), byteify.serializeInt64(coords.x.toNumber()), byteify.serializeInt64(coords.y.toNumber())], dominari.programId)    
    console.log(loc_address.toString())

    await dominari.methods.initLocation(coords).accounts({
      location: loc_address,
      initalizer: dominari.provider.wallet.publicKey
    }).rpc();

    const acc = await dominari.account.location.fetch(loc_address);
    console.log(JSON.stringify(acc));
  })

  it('Builds a City on Location', async () => {
    return
    //init loc
    const coords = {
      nx: new anchor.BN(0),   //0
      ny: new anchor.BN(-1),   //-1
      x: new anchor.BN(2),    //2
      y: new anchor.BN(-178)     //-178
    }

    const [loc_address, loc_bump] = findProgramAddressSync([byteify.serializeInt64(coords.nx.toNumber()), byteify.serializeInt64(coords.ny.toNumber()), byteify.serializeInt64(coords.x.toNumber()), byteify.serializeInt64(coords.y.toNumber())], dominari.programId)    
    /*
    await dominari.methods.initLocation(coords).accounts({
      location: loc_address,
      initalizer: dominari.provider.wallet.publicKey
    }).rpc();
    */
    const acc = await dominari.account.location.fetch(loc_address);
    console.log(JSON.stringify(acc,null,2));

    //const mainnet = new anchor.web3.Connection('https://ssc-dao.genesysgo.net/');  
    const apollo_nfts = await getSpaceNFTs(apollo_keypair.publicKey, devnet);
    const initalizedLoc:SPACENFT = apollo_nfts.find(token => token.x == 2 && token.y == -178);
    
    const SPACE_PID = new anchor.web3.PublicKey("XSPCZghPXkWTWpvrfQ34Szpx3rwmUjsxebRFf5ckbMD");
    const [space_metadata_account, bmp] = findProgramAddressSync([
      new anchor.web3.PublicKey("XBSEZzB7ojaKgXqfCSpNbPLnuMGk3JVtSKYjXYqg7Pn").toBuffer(),
      Buffer.from("space_metadata"),
      byteify.serializeInt64(coords.x.toNumber()).reverse(),
      byteify.serializeInt64(coords.y.toNumber()).reverse()
    ], SPACE_PID);

    const newConstruction = {"healer": {}}

    /*
    await dominari.methods
      .buildLocation(newConstruction)
      .accounts({
        location: loc_address,
        spaceTokenAccount: initalizedLoc.pubkey,
        spaceMetadataAccount: space_metadata_account,
        builder: dominari.provider.wallet.publicKey
      })
      .rpc();
    */
  })
  
  it('DEBUG', async () => {
    const [loc_address, loc_bump] = findProgramAddressSync([byteify.serializeInt64(coords.nx.toNumber()), byteify.serializeInt64(coords.ny.toNumber()), byteify.serializeInt64(coords.x.toNumber()), byteify.serializeInt64(coords.y.toNumber())], dominari.programId)    
    console.log(await dominari.account.location.fetch(loc_address));
    await dominari.methods
    .debug()
    .accounts()
    .signers()
    .remainingAccounts([
      {
        pubkey: loc_address,
        isWritable: false,
        isSigner: false
      }
    ])
    .rpc()
  })
})

async function getSpaceNFTs(owner: anchor.web3.PublicKey, connection: anchor.web3.Connection){
  //fetch all nfts for owner
  //for each that is a "space" nft, fetch the account by mint

  let allNFTAccounts = await nft.getParsedNftAccountsByOwner({
    publicAddress: owner.toString(),
    connection: connection
  })

  let spaceNFTs:SPACENFT[] = []
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

export interface SPACENFT {
  pubkey: string,
  mint: string,
  x: number,
  y: number
}
