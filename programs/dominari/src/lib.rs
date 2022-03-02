use anchor_lang::prelude::*;
use anchor_lang::solana_program::borsh::try_from_slice_unchecked;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke_signed;

mod error;
mod context;
mod account;
mod event;
mod state;
mod constants;

use account::*;
use error::*;
use context::*;
use event::*;
use state::*;

declare_id!("6Qi7Vg1X2NhB3f3xc7UsfD9fwHCe9DBT7mWMRfF2A8S4");

#[program]
pub mod dominari {
    use constants::FEE_BUILD_PORTAL;

    use crate::constants::{FEE_BUILD_HEALER, FEE_BUILD_LOOTABLE};

    use super::*;
    // Any player can initalize a space, which will have a blank feature, in any neighborhood
        // Requires (Nx,Ny) (Lx,Ly)
    pub fn init_location(ctx: Context<InitLocation>, loc:Coords) -> ProgramResult {
        let location = &mut ctx.accounts.location;
        location.initalizer = ctx.accounts.initalizer.key();
        location.coords = loc.clone();
        location.feature = None;
        location.bump = *ctx.bumps.get("location").unwrap();
        emit!(NewLocationInitalized {
            coords: loc,
            initializer: location.initalizer
        });

        Ok(())
    }

    // Any builder can build on the space 
        // Requires NFT for the space
    pub fn build_location(ctx: Context<Build>, new_construction:Feature) -> ProgramResult {
        let location = &mut ctx.accounts.location;
        let space_token = &ctx.accounts.space_token_account;
        let space_metadata = &ctx.accounts.space_metadata_account;

        //Can't use the Anchor Context Account Deserialization because this account was made in native solana so it doesn't have the 8 bit descriminator that anchor looks for 
        let space_metadata_data: SpaceMetadata = try_from_slice_unchecked(&space_metadata.data.borrow_mut())?;
        if space_metadata_data.mint != space_token.mint {
            return Err(CustomError::NFTNotValid.into());
        }

        if location.feature != None {
            //"Sell The Feature"
            //Set to None
        }

        match new_construction {
            Feature::Portal => {},
            Feature::Healer => {},
            Feature::LootableFeature => {}
        }

        msg!("Location can be editted");
        Ok(())
    }

    pub fn debug_build_location(ctx: Context<DebugBuild>, new_construction:Feature) -> ProgramResult {
        let location = &mut ctx.accounts.location;
        let builder = &ctx.accounts.builder;
        let system = &ctx.accounts.system_program;
        //Assume Location NFT Validation is successful

        if location.feature != None {
            location.feature = None;
        }

        let cost: u64 = match new_construction {
            Feature::Portal => { FEE_BUILD_PORTAL },
            Feature::Healer => { FEE_BUILD_HEALER },
            Feature::LootableFeature => {FEE_BUILD_LOOTABLE}
        };

        let location_seeds: &[&[u8]] = &[
            &location.coords.nx.to_be_bytes(),
            &location.coords.ny.to_be_bytes(),
            &location.coords.x.to_be_bytes(),
            &location.coords.y.to_be_bytes(),
            &[location.bump]
        ];

        //based on the construction pay the fee to the location account
        let ix = transfer(
            &builder.key(),
            &location.key(),
            cost as u64
        );

        invoke_signed(
            &ix,
            &[builder.to_account_info(),location.to_account_info(),system.to_account_info()],
            &[location_seeds]
        )?;

        //Builder has paid the fee, let them build the feature
        location.lamports_invested += cost;
        location.feature = Some(new_construction);

        //WARN: In the future, we want to validate the new_construction 

        emit!(FeatureModified {
            coords: location.coords,
            feature: location.feature.as_ref().cloned()
        });
        Ok(())
    }

    // An admin can initalize a game for a specific neighborhood
    // A player can register to play for a specific game
    // A player can play a card onto an initalized Location
    // A player can move troops between Locations
    // A player can attack other troops
    // A player can harvest a location

    // Debug Function
    pub fn debug(ctx: Context<Debug>, loc:Coords) -> ProgramResult {
        //let address = Pubkey::find_program_address(&[loc.nx.to_be_bytes().as_ref(), loc.ny.to_be_bytes().as_ref(), loc.x.to_be_bytes().as_ref(), loc.y.to_be_bytes().as_ref()], ctx.program_id);
        let address = Pubkey::find_program_address(&[0_i64.to_be_bytes().as_ref()], ctx.program_id);
        msg!("{:?}", address);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
