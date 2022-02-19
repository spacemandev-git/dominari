use anchor_lang::prelude::*;
mod error;
mod context;
mod account;
mod event;
mod state;

use account::*;
use error::*;
use context::*;
use event::*;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod dominari {
    use super::*;
    // Any player can initalize a space, which will have a blank feature, in any neighborhood
        // Requires (Nx,Ny) (Lx,Ly)
    pub fn init_location(ctx: Context<InitLocation>, loc:Coords) -> ProgramResult {
        let location = &mut ctx.accounts.location;
        location.initalizer = ctx.accounts.initalizer.key();
        location.coords = loc;
        location.feature = Feature::None;
        
        Ok(())
    }

    pub fn debug(ctx: Context<Debug>, loc:Coords) -> ProgramResult {
        //let address = Pubkey::find_program_address(&[loc.nx.to_be_bytes().as_ref(), loc.ny.to_be_bytes().as_ref(), loc.x.to_be_bytes().as_ref(), loc.y.to_be_bytes().as_ref()], ctx.program_id);
        let address = Pubkey::find_program_address(&[0_i64.to_be_bytes().as_ref()], ctx.program_id);
        msg!("{:?}", address);
        Ok(())
    }

    // Any builder can build on the space 
        // Requires NFT for the space
    
    // An admin can initalize a game for a specific neighborhood
    // A player can register to play for a specific game
    // A player can play a card onto an initalized Location
    // A player can move troops between Locations
    // A player can attack other troops

    // Debug Function
}

#[derive(Accounts)]
pub struct Initialize {}
