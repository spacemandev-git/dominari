import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Dominari } from '../target/types/dominari';

describe('dominari', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Dominari as Program<Dominari>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
