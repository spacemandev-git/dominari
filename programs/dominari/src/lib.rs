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
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    // Any player can initalize a space, which will have a blank feature, in any neighborhood
        // Requires (Nx,Ny) (Lx,Ly)
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
