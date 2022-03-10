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
use constants::*;

declare_id!("6Qi7Vg1X2NhB3f3xc7UsfD9fwHCe9DBT7mWMRfF2A8S4");

#[program]
pub mod dominari {
    use std::convert::TryInto;

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
            //TODO: In the future, send most of it to GAME OWNER hard coded account
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
    pub fn init_game(ctx: Context<InitGame>, coords:Coords) -> ProgramResult {
        //What should a game contain?
        // Units deployed are tied to a game, so the Location property should have a tag for current game
        // During unit movements you should check the game tag, and if it doesn't match the current game, then treat the units as not there
        let game = &mut ctx.accounts.game;
        game.coords = coords;
        game.authority = ctx.accounts.authority.key();
        game.enabled = true;
        Ok(())
    }

    // A player can register to play for a specific game. This gives them a starting card.
    pub fn register_player(ctx:Context<RegisterPlayer>, name:String) -> ProgramResult {
        let player = &mut ctx.accounts.player;
        player.authority = ctx.accounts.authority.key();
        player.name = name;

        let starting_card = Card {
            drop_table_id: 0,
            id: 0,
            meta: MetaInformation {
                name: String::from("Scout"),
                description: String::from("A basic Scout unit"),
                link: String::from("Scout.png")
            },
            data: CardData::UNIT(
                StatInfo {
                    class: Some(TroopClass::Infantry),
                    range: 1,
                    power: 6,
                    mod_inf: 0,
                    mod_armor: 0,
                    mod_air: 0,
                    recovery: 60
            })
        };

        player.cards.push(starting_card);

        emit!(NewPlayerRegistered {
            gamekey: ctx.accounts.game.key(),
            playerkey: ctx.accounts.authority.key(),
            playername: player.name.clone()
        });

        Ok(())
    }

    // An admin should be able to create a new drop table with cards
    pub fn init_drop_table(ctx:Context<InitDropTable>, id:u8, cards: Vec<Card>) -> ProgramResult {
        let drop_table = &mut ctx.accounts.drop_table_acc;
        drop_table.id = id;
        drop_table.cards = cards;
        Ok(())
    }
    
    // A player can play a card onto an initalized Location
    pub fn play_card(ctx:Context<PlayCard>, card_idx: u16) -> ProgramResult {
        let game = &ctx.accounts.game;
        let player = &mut ctx.accounts.player;
        let location = &mut ctx.accounts.location;

        let card: Card = player.cards.remove(usize::from(card_idx));
        let clock = Clock::get().unwrap();

        match card.data {
            CardData::ACTION => {
                //TODO
            },
            CardData::MOD(unitmod) => {
                //Manual math is needed to ensure no values go into the invalid ranges (the top three values are unsigned, but the mod is signed)

                if location.troops == None || location.troops.as_ref().unwrap().gamekey != game.key() {
                    return Err(CustomError::InvalidLocation.into())
                }

                if unitmod.class != None && location.troops.as_ref().unwrap().data.class != unitmod.class {
                    return Err(CustomError::UnitClassMismatch.into())
                }

                let mut modified_troops = location.troops.as_ref().unwrap().clone();

                if unitmod.range < 0 {
                    modified_troops.data.range = modified_troops.data.range.saturating_sub(unitmod.range.abs().try_into().unwrap());
                    if modified_troops.data.range == 0 {
                        //Can't equip a mod that reduces range to 0 as that's an invalid range
                        return Err(CustomError::InvalidMod.into())
                    }
                } else {
                    modified_troops.data.range = modified_troops.data.range.saturating_add(unitmod.range.abs().try_into().unwrap());
                } 


                if unitmod.power < 0 {
                    modified_troops.data.power = modified_troops.data.power.saturating_sub(unitmod.power.abs().try_into().unwrap());
                    if modified_troops.data.power == 0 {
                        //equipping a mod that reduces power to 0 would kill the unit
                        return Err(CustomError::InvalidMod.into())
                    }
                } else {
                    modified_troops.data.power = modified_troops.data.power.saturating_add(unitmod.power.abs().try_into().unwrap());
                } 


                if unitmod.recovery < 0 {
                    modified_troops.data.recovery = modified_troops.data.recovery.saturating_sub(unitmod.recovery.abs().try_into().unwrap());
                    if modified_troops.data.recovery == 0 {
                        //recovery of 0 means that there's not even a slot delay between unit moves, making an impossibly fast unit
                        return Err(CustomError::InvalidMod.into())
                    }
                } else {
                    modified_troops.data.recovery = modified_troops.data.recovery.saturating_add(unitmod.recovery.abs().try_into().unwrap());
                } 


                modified_troops.data.mod_inf = modified_troops.data.mod_inf.saturating_add(unitmod.mod_inf);
                modified_troops.data.mod_armor = modified_troops.data.mod_armor.saturating_add(unitmod.mod_armor);
                modified_troops.data.mod_air = modified_troops.data.mod_air.saturating_add(unitmod.mod_air);
                location.troops = Some(modified_troops);
            },
            CardData::UNIT(unit) => {
                //If location is NOT EMPTY && the troops BELONG TO THIS GAME it's an invalid location
                // If it's NOT EMPTY but the troops belong to a different game, it doesn't really matter
                if location.troops != None && location.troops.as_ref().unwrap().gamekey == game.key() {
                    return Err(CustomError::InvalidLocation.into())
                }
                location.troops = Some(Troop {
                    meta: card.meta,
                    data: unit,
                    last_moved: clock.slot,
                    gamekey: game.key()
                })   
            }
        }
        Ok(())
    }

    // A player can move troops between Locations
    // A player can attack other troops
    // A player can harvest a location if they were the first ones to initalize it
    // A player can loot a location if it's lootable and they pay the fee associated with it


    // Debug Function
    pub fn debug(ctx: Context<Debug>, _loc:Coords) -> ProgramResult {
        //let address = Pubkey::find_program_address(&[loc.nx.to_be_bytes().as_ref(), loc.ny.to_be_bytes().as_ref(), loc.x.to_be_bytes().as_ref(), loc.y.to_be_bytes().as_ref()], ctx.program_id);
        let address = Pubkey::find_program_address(&[0_i64.to_be_bytes().as_ref()], ctx.program_id);
        msg!("{:?}", address);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
