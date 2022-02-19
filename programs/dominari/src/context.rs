use anchor_lang::prelude::*;
use crate::account::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(loc: Coords)]
pub struct InitLocation<'info>{
    #[account(
        init,
        //(Nx, Ny) (Lx, Ly)
        seeds=[loc.nx.to_be_bytes().as_ref(), loc.ny.to_be_bytes().as_ref(), loc.x.to_be_bytes().as_ref(), loc.y.to_be_bytes().as_ref()],
        bump,
        payer=initalizer,
        space=8+1024
    )]
    pub location: Account<'info, Location>,
    #[account(mut)]
    pub initalizer: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Debug{}