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
        payer=initializer,
        space=8+1024
    )]
    pub location: Account<'info, Location>,
    #[account(mut)]
    pub initializer: Signer<'info>,
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
}

#[derive(Accounts)]
pub struct DebugBuild<'info> {
    #[account(mut)]
    pub location: Account<'info, Location>,
    #[account(mut)]
    pub builder: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(seeds=[b"buildables"], bump)]
    pub buildables: Account<'info, Buildables>
}

#[derive(Accounts)]
#[instruction(coords: Coords)]
pub struct InitGame<'info>{
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(init,
        seeds = [
            coords.nx.to_be_bytes().as_ref(),
            coords.ny.to_be_bytes().as_ref()
        ],
        bump,
        payer = authority
    )]
    pub game: Account<'info, Game>
}

#[derive(Accounts)]
pub struct RegisterPlayer<'info>{
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        constraint = game.enabled == true
    )]
    pub game: Account<'info, Game>,
    #[account(init,
        seeds = [
            game.key().as_ref(),
            authority.key.as_ref()
        ],
        bump,
        payer=authority,
        space=8+4096
    )]
    pub player: Account<'info, Player>
}

#[derive(Accounts)]
#[instruction(id:u8, cards:Vec<Card>)]
pub struct InitDropTable<'info>{
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(init,
        seeds = [
            id.to_be_bytes().as_ref()
        ],
        bump,
        payer=authority,
        space = 8+2048,
        constraint = authority.key() == Pubkey::from_str(ADMIN_KEY).unwrap()
    )]
    pub drop_table_acc: Account<'info, DropTable>
}

#[derive(Accounts)]
pub struct InitBuildable<'info> {
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(init,
        seeds = [b"buildables"],
        bump,
        payer=authority,
        space=8+2048,
        constraint = authority.key() == Pubkey::from_str(ADMIN_KEY).unwrap()
    )]
    pub buildables: Account<'info, Buildables>
}

#[derive(Accounts)]
pub struct PlayCard<'info>{
    #[account(
        mut,
        has_one = authority,
        constraint = player.gamekey == game.key()
    )]
    pub player: Account<'info, Player>,
    #[account(
        constraint = game.enabled == true
    )]
    pub game: Account<'info, Game>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub location: Account<'info, Location>
}

#[derive(Accounts)]
pub struct UnitAction<'info>{
    #[account(
        constraint = game.enabled == true
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub source: Account<'info, Location>,
    #[account(mut)]
    pub target: Account<'info, Location>,
    #[account(has_one=authority)]
    pub player: Account<'info, Player>,
    pub authority: Signer<'info>
}

#[derive(Accounts)]
pub struct HarvestInitializer<'info>{
    #[account(
        mut,
        has_one=initializer
    )]
    pub location: Account<'info, Location>,
    pub initializer: Signer<'info>,
    pub system: Program<'info, System>
}

#[derive(Accounts)]
pub struct ActivateFeature<'info> {
    #[account(
        mut,
        has_one=authority
    )]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub location: Account<'info, Location>,
    pub game: Account<'info, Game>,
    pub system: Program<'info, System>
}

#[derive(Accounts)]
pub struct Debug{}