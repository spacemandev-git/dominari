use anchor_lang::prelude::*;
use anchor_lang::solana_program::borsh::try_from_slice_unchecked;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::hash::*;

use std::convert::TryInto;

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
    // Any player can initialize a space, which will have a blank feature, in any neighborhood
        // Requires (Nx,Ny) (Lx,Ly)
    pub fn init_location(ctx: Context<InitLocation>, loc:Coords) -> ProgramResult {
        let location = &mut ctx.accounts.location;
        location.initializer = ctx.accounts.initializer.key();
        location.coords = loc.clone();
        location.feature = None;
        location.bump = *ctx.bumps.get("location").unwrap();
        emit!(NewLocationInitialized {
            coords: loc,
            initializer: location.initializer
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

    // An admin can initialize a game for a specific neighborhood
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
    pub fn move_troops(ctx:Context<UnitAction>) -> ProgramResult {
        let game = &ctx.accounts.game;
        let source =  &mut ctx.accounts.source;
        let target = &mut ctx.accounts.target;
        let player = &ctx.accounts.player;

        //Source loc must have troops (and their gamekey must be this game's key) and target must not
        if source.troops == None ||
        source.troops.as_ref().unwrap().gamekey != game.key() ||
        (target.troops != None && target.troops.as_ref().unwrap().gamekey == game.key())
        {
            return Err(CustomError::InvalidMove.into())
        }

        //Move must be to an adjacent tile
        if source.coords.x < target.coords.x-1 ||
        source.coords.x > target.coords.x+1 || 
        source.coords.y < target.coords.y-1 ||
        source.coords.y > target.coords.y+1 
        {
            return Err(CustomError::InvalidMove.into())
        } 

        //source troops must belong to the player
        if source.troop_owner != Some(player.key()) {
            return Err(CustomError::InvalidMove.into())
        }
        
        //source troops must have surpassed their recovery threshold
        let clock = Clock::get().unwrap();
        let troops = source.troops.as_ref().unwrap();
        if clock.slot < (troops.last_moved + troops.data.recovery as u64) {
            return Err(CustomError::InvalidMove.into());
        }

        //Move the troops
        let mut modified_troops = source.troops.as_ref().unwrap().clone();
        modified_troops.last_moved = clock.slot;
        target.troops = Some(modified_troops);
        target.troop_owner = Some(player.key());
        source.troops = None;
        source.troop_owner = None;

        emit!(TroopsMoved {
            gamekey: game.key(),
            player: player.key(),
            source: source.coords,
            target: target.coords,
            troops: target.troops.as_ref().unwrap().clone()
        });

        Ok(())
    }


    // A player can attack other troops
    pub fn attack(ctx:Context<UnitAction>) -> ProgramResult {
        let game = &ctx.accounts.game;
        let source = &mut ctx.accounts.source;
        let target = &mut ctx.accounts.target;
        let player = &ctx.accounts.player;
        
        //If troops are NONE will throw an error
        let attacking = source.troops.as_ref().unwrap();
        let defending = target.troops.as_ref().unwrap();

        //Source Troops belong to the player and target troops DO NOT
        if source.troop_owner != Some(player.key()) || 
        target.troop_owner == Some(player.key()) {
            return Err(CustomError::InvalidAttack.into())
        }

        //Troops from source and target both belong to THIS game.
        if attacking.gamekey != game.key() || defending.gamekey != game.key() {
            return Err(CustomError::InvalidAttack.into())
        }

        //source and target are within range of the attacking troops
        let distance:f64 = (((target.coords.x - source.coords.x).pow(2) + (target.coords.y - source.coords.y).pow(2)) as f64).sqrt();
        if distance > attacking.data.range.into() {
            return Err(CustomError::InvalidAttack.into())
        }

        //attacking troops have recovered from previous move
        let clock = Clock::get().unwrap();
            //u64 can be inferred here because it's not a mod, so it will always be positive 
        if (attacking.last_moved + attacking.data.recovery as u64) < clock.slot {
            return Err(CustomError::InvalidAttack.into())
        }
        
        if attacking.data.range == 1 {
            let attacking_dmg = get_atk(&attacking, &defending, 0);
            let defending_dmg = get_atk(&defending, &attacking, 1);

            emit!(Combat { 
                gamekey: game.key(),
                source: source.coords,
                target: target.coords,
                attacking_player: source.troop_owner.unwrap(),
                defending_player: target.troop_owner.unwrap(),
                attacking_troops: attacking.clone(),
                defending_troops: defending.clone(),
                attacking_dmg: attacking_dmg,
                defending_dmg: defending_dmg
            });

            let def_result = defending.data.power as i16 - attacking_dmg as i16;
            if def_result <= 0 {
                //defending troops wiped out
                target.troops = None;
                target.troop_owner = None;
            } else {
                let mut modified_defending = defending.clone();
                modified_defending.data.power = def_result as i8;
                target.troops = Some(modified_defending);
            }

            let atk_result = attacking.data.power as i16 - defending_dmg as i16;
            if atk_result <= 0 {
                //attacking troops wiped out
                source.troops = None;
                source.troop_owner = None;
            } else {
                let mut modified_attacking = attacking.clone();
                modified_attacking.data.power = atk_result as i8;
                source.troops = Some(modified_attacking);
            }
        }  else {
            //Range > 1 means that defending doesn't get an attack back
            let attacking_dmg = get_atk(&attacking, &defending, 0);
            emit!(Combat { 
                gamekey: game.key(),
                source: source.coords,
                target: target.coords,
                attacking_player: source.troop_owner.unwrap(),
                defending_player: target.troop_owner.unwrap(),
                attacking_troops: attacking.clone(),
                defending_troops: defending.clone(),
                attacking_dmg: attacking_dmg,
                defending_dmg: 0
            });

            let def_result = defending.data.power as i16 - attacking_dmg as i16;
            if def_result <= 0 {
                //defending troops wiped out
                target.troops = None;
                target.troop_owner = None;
            } else {
                let mut modified_defending = defending.clone();
                modified_defending.data.power = def_result as i8;
                target.troops = Some(modified_defending);
            }
        }
        Ok(())
    }

    // A player can harvest a location if they were the first ones to initalize it
    pub fn harvest_location(ctx:Context<Harvest>) -> ProgramResult {
        //Account validation checked that the initializer is that of the location
        let location = &mut ctx.accounts.location;
        let initializer = &ctx.accounts.initializer;
        let system = &ctx.accounts.system;

        let location_seeds: &[&[u8]] = &[
            &location.coords.nx.to_be_bytes(),
            &location.coords.ny.to_be_bytes(),
            &location.coords.x.to_be_bytes(),
            &location.coords.y.to_be_bytes(),
            &[location.bump]
        ];

        let amount_to_pay = location.lamports_invested - location.lamports_harvested;
        location.lamports_harvested = location.lamports_invested;
        let ix = transfer(
            &location.key(),
            &initializer.key(),
            amount_to_pay
        );

        invoke_signed(
            &ix,
            &[
                initializer.to_account_info(),
                location.to_account_info(),
                system.to_account_info()
            ],
            &[location_seeds]
        )?;

        emit!(LocationHarvested {
            location: location.coords,
            harvest_amount: amount_to_pay,
            initializer_key: initializer.key(),
            total_harvested: location.lamports_harvested
        });

        Ok(())
    }

    // A player can "activate" the feature on the location if it's not in cooldown for a fee
    pub fn activate_feature(ctx:Context<ActivateFeature>) -> ProgramResult {
        // You can activate a 
        // Portal (Requires a second Location), Lootable Feature (Requires Drop Table), or Oasis

        Ok(())
    }

    // Debug Function
    pub fn debug(ctx: Context<Debug>) -> ProgramResult {
        Ok(())
    }
}

/**
 * Because of the conversions between i16 (max 65535) and u8 (max 255) the max attack can only be of power 255
 * But this doesn't really matter as the random number can only be generated between 0-255 and mods are of type i8 and can't exceed 128
 */
pub fn get_atk(attacking: &Troop, defending: &Troop, idx:usize) -> u8{
    //returns a random number between 0 to power
    let mut attacking_power = (get_random_u8(idx) / (u8::MAX/(attacking.data.power as u8))) as i16;
    if defending.data.class == Some(TroopClass::Infantry) {
        attacking_power += attacking.data.mod_inf as i16;
    } else if defending.data.class == Some(TroopClass::Armor) {
        attacking_power += attacking.data.mod_armor as i16;
    } else if defending.data.class == Some(TroopClass::Aircraft) {
        attacking_power += attacking.data.mod_air as i16;
    } 

    if attacking_power < u8::MIN.into() {
        attacking_power = u8::MIN.into();
    }

    if attacking_power > u8::MAX.into() {
        attacking_power = u8::MAX.into();
    }

    return attacking_power as u8;
}

/**
 * Generates a random number using the slothash[0]
 * Idx determines where from the slot hash it pulls the random number from
 * Useful when multiple random numbers are required, such as in 2 way combat
 */
pub fn get_random_u8(idx:usize) -> u8 {
    let clock = Clock::get().unwrap();
    let num = &hash(&clock.slot.to_be_bytes()).to_bytes()[idx];
    return *num;
}