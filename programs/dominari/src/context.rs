use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use std::str::FromStr;

use crate::constants::*;
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
pub struct Build<'info>{
    #[account(mut)]
    pub location: Account<'info, Location>,

    //Verify NFT
    //Check that the space_token_account owner is builder
    #[account(
        constraint = space_token_account.owner == builder.key()
    )]
    pub space_token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [
            Pubkey::from_str(SPACE_BASE).unwrap().to_bytes().as_ref(),
            b"space_metadata".as_ref(),
            location.coords.x.to_le_bytes().as_ref(),
            location.coords.y.to_le_bytes().as_ref(),
        ],
        bump,
        seeds::program = Pubkey::from_str(SPACE_PID).unwrap()
    )]
    pub space_metadata_account: AccountInfo<'info>,
    
    #[account(mut)]
    pub builder: Signer<'info>,
    #[account(mut)]
    pub initalizer: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct DebugBuild<'info> {
    #[account(mut)]
    pub location: Account<'info, Location>,
    #[account(mut)]
    pub builder: Signer<'info>,
    pub system_program: Program<'info, System>
}


#[derive(Accounts)]
pub struct Debug{}