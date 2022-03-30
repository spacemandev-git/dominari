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

declare_id!("BGYHifTqRGUnJMfugZn5sbAZqjMR6bPZ98NmLcDeb7N7");

#[program]
pub mod dominari {
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
    pub fn build_location(ctx:Context<Build>, idx:u64) -> ProgramResult {
        let buildables = &ctx.accounts.buildables;
        let location = &mut ctx.accounts.location;
        let builder = &ctx.accounts.builder;
        let system = &ctx.accounts.system_program;
        let feature = buildables.buildables[idx as usize].clone();
        
        
        //NFT VERIFICATION
        let space_token = &ctx.accounts.space_token_account;
        let space_metadata = &ctx.accounts.space_metadata_account;

        //Can't use the Anchor Context Account Deserialization because this account was made in native solana so it doesn't have the 8 bit descriminator that anchor looks for 
        let space_metadata_data: SpaceMetadata = try_from_slice_unchecked(&space_metadata.data.borrow_mut())?;
        if space_metadata_data.mint != space_token.mint {
            return Err(CustomError::NFTNotValid.into());
        }
        //NFT VERIFICATION END
        
        
        // Check if the feature ID is the feature already on the location.
            // If it is, upgrade it
            // If it isn't, destry the current feature and discount the new feature by half of the cost of the old feature
        let cost;
        let mut new_construction: Feature = feature.clone(); //modify this based on upgrade path
        if location.feature != None {
            let existing_construction = location.feature.as_ref().unwrap();
            if existing_construction.id == feature.id {
                // Upgrade the feature

                // Match against the local stats for the feature because in the future, we might want to modify the local stats compared to the template that it's in buildables
                // For example, we might in the future want to implement asteroids approach for building features with boosts
                if existing_construction.rank == existing_construction.max_rank {
                    return Err(CustomError::FeatureMaxRank.into())
                }

                cost = existing_construction.rank_upgrade_cost_multiplier * (existing_construction.rank +1) as u64;
                new_construction = existing_construction.clone();
                new_construction.rank = existing_construction.rank +1; 
            } else {
                // Destroy the feature and discount the new build with half the investment of the old build
                let investment = existing_construction.rank as u64 * existing_construction.rank_upgrade_cost_multiplier;
                let new_build_cost = (new_construction.rank_upgrade_cost_multiplier * 1).checked_sub(investment/2);
                if new_build_cost == Some(0) || new_build_cost == None {
                    cost = 0;
                } else {
                    cost = new_build_cost.unwrap();
                }
            }
        } else {
            cost = feature.rank_upgrade_cost_multiplier * 1; // cost of Rank 1 Feature of that type
        }

        let location_seeds: &[&[u8]] = &[
            &location.coords.nx.to_be_bytes(),
            &location.coords.ny.to_be_bytes(),
            &location.coords.x.to_be_bytes(),
            &location.coords.y.to_be_bytes(),
            &[location.bump]
        ];

        //based on the construction pay the fee to the location account
        // Half the fee goes to the location, the other half goes to the GAME DAO

        let ix = transfer(
            &builder.key(),
            &location.key(),
            cost
        );

        invoke_signed(
            &ix,
            &[builder.to_account_info(),location.to_account_info(),system.to_account_info()],
            &[location_seeds]
        )?;

        //Builder has paid the fee, let them build the feature
        location.lamports_invested += cost;
        location.feature = Some(new_construction);

        emit!(FeatureModified {
            coords: location.coords,
            feature: location.feature.as_ref().cloned()
        });
        Ok(())
    }

    pub fn debug_build_location(ctx: Context<DebugBuild>, idx:u64) -> ProgramResult {
        let buildables = &ctx.accounts.buildables;
        let location = &mut ctx.accounts.location;
        let builder = &ctx.accounts.builder;
        let system = &ctx.accounts.system_program;
        let feature = buildables.buildables[idx as usize].clone();
        //Assume Location NFT Validation is successful
        
        // Check if the feature ID is the feature already on the location.
            // If it is, upgrade it
            // If it isn't, destry the current feature and discount the new feature by half of the cost of the old feature
        let cost;
        let mut new_construction: Feature = feature.clone(); //modify this based on upgrade path
        if location.feature != None {
            let existing_construction = location.feature.as_ref().unwrap();
            if existing_construction.id == feature.id {
                // Upgrade the feature

                // Match against the local stats for the feature because in the future, we might want to modify the local stats compared to the template that it's in buildables
                // For example, we might in the future want to implement asteroids approach for building features with boosts
                if existing_construction.rank == existing_construction.max_rank {
                    return Err(CustomError::FeatureMaxRank.into())
                }

                cost = existing_construction.rank_upgrade_cost_multiplier * (existing_construction.rank +1) as u64;
                new_construction = existing_construction.clone();
                new_construction.rank = existing_construction.rank +1; 
            } else {
                // Destroy the feature and discount the new build with half the investment of the old build
                let investment = existing_construction.rank as u64 * existing_construction.rank_upgrade_cost_multiplier;
                let new_build_cost = (new_construction.rank_upgrade_cost_multiplier * 1).checked_sub(investment/2);
                if new_build_cost == Some(0) || new_build_cost == None {
                    cost = 0;
                } else {
                    cost = new_build_cost.unwrap();
                }
            }
        } else {
            cost = feature.rank_upgrade_cost_multiplier * 1; // cost of Rank 1 Feature of that type
        }

        let location_seeds: &[&[u8]] = &[
            &location.coords.nx.to_be_bytes(),
            &location.coords.ny.to_be_bytes(),
            &location.coords.x.to_be_bytes(),
            &location.coords.y.to_be_bytes(),
            &[location.bump]
        ];

        //based on the construction pay the fee to the location account
        // Half the fee goes to the location, the other half goes to the GAME DAO

        let ix = transfer(
            &builder.key(),
            &location.key(),
            cost
        );

        invoke_signed(
            &ix,
            &[builder.to_account_info(),location.to_account_info(),system.to_account_info()],
            &[location_seeds]
        )?;

        //Builder has paid the fee, let them build the feature
        location.lamports_invested += cost;
        location.feature = Some(new_construction);

        emit!(FeatureModified {
            coords: location.coords,
            feature: location.feature.as_ref().cloned()
        });
        Ok(())
    }

    // An admin can initialize a game for a specific neighborhood
    pub fn init_game(ctx: Context<InitGame>, _id: String, nx: i64, ny: i64) -> ProgramResult {
        //What should a game contain?
        // Units deployed are tied to a game, so the Location property should have a tag for current game
        // During unit movements you should check the game tag, and if it doesn't match the current game, then treat the units as not there
        let game = &mut ctx.accounts.game;
        game.id = _id;
        game.coords = Coords {nx: nx, ny: ny, x:0, y:0};
        game.authority = ctx.accounts.authority.key();
        game.enabled = true;
        Ok(())
    }

    // An admin can disable the game when it's finished
    pub fn toggle_game(ctx:Context<ToggleGame>) -> ProgramResult {
        if ctx.accounts.game.enabled {
            ctx.accounts.game.enabled = false;
        } else {
            ctx.accounts.game.enabled = true;
        }
        Ok(())
    }

    // A player can register to play for a specific game. This gives them a starting card.
    pub fn register_player(ctx:Context<RegisterPlayer>, name:String) -> ProgramResult {
        let player = &mut ctx.accounts.player;
        player.gamekey = ctx.accounts.game.key();
        player.authority = ctx.accounts.authority.key();
        player.name = name;

        let starting_card = Card {
            drop_table_id: 0,
            id: 0,
            point_value: 1, 
            meta: MetaInformation {
                name: String::from("Scout"),
                description: String::from("A basic Scout unit"),
                link: String::from("Scout.png")
            },
            data: CardData::unit {
                stats: StatInfo {
                    class: Some(TroopClass::infantry),
                    range: 1,
                    power: 6,
                    max_power: 6,
                    mod_inf: 0,
                    mod_armor: 0,
                    mod_air: 0,
                    recovery: 60
            }}
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
    pub fn init_drop_table(ctx:Context<InitDropTable>, id:u64, cards: Vec<Card>) -> ProgramResult {
        let drop_table = &mut ctx.accounts.drop_table_acc;
        drop_table.id = id;
        drop_table.cards = cards;
        Ok(())
    }
    
    //An admin should be able to update an existing drop table.
    pub fn set_drop_table(ctx:Context<SetDropTable>, cards: Vec<Card>) -> ProgramResult{
        let drop_table = &mut ctx.accounts.drop_table_acc;
        drop_table.cards = cards;
        Ok(())
    }

    // An admin should be able to add new buildables to the Game
    pub fn set_buildable(ctx:Context<SetBuildable>, buildables: Vec<Feature>) -> ProgramResult {
        let buildables_account = &mut ctx.accounts.buildables;
        buildables_account.buildables = buildables;
        Ok(())
    }
    
    // An admin should be able to destroy the building on a location
    pub fn destroy_feature(ctx:Context<DestroyFeature>) -> ProgramResult {
        let location = &mut ctx.accounts.location;
        location.feature = None;
        Ok(())
    }

    // An admin should be able to upload a new type of buildable
    pub fn init_buildable(ctx:Context<InitBuildable>, buildables: Vec<Feature>) -> ProgramResult {
        // This function is called during program creation to initalize the buildables object
        let buildables_account = &mut ctx.accounts.buildables;
        buildables_account.buildables = buildables;
        Ok(())
    }

    // A player can play a card onto an initalized Location
    pub fn play_card(ctx:Context<PlayCard>, card_idx: u16) -> ProgramResult {
        let game = &ctx.accounts.game;
        let player = &mut ctx.accounts.player;
        let location = &mut ctx.accounts.location;

        let card: Card = player.cards.remove(usize::from(card_idx));

        match card.data {
            CardData::action => {
                //TODO
            },
            CardData::unitmod {stats} => {
                //Manual math is needed to ensure no values go into the invalid ranges (the top three values are unsigned, but the mod is signed)

                if location.troops == None || location.troops.as_ref().unwrap().gamekey != game.key() {
                    return Err(CustomError::InvalidLocation.into())
                }

                if stats.class != None && location.troops.as_ref().unwrap().data.class != stats.class {
                    return Err(CustomError::UnitClassMismatch.into())
                }

                let mut modified_troops = location.troops.as_ref().unwrap().clone();

                if stats.range < 0 {
                    modified_troops.data.range = modified_troops.data.range.saturating_sub(stats.range.abs().try_into().unwrap());
                    if modified_troops.data.range == 0 {
                        //Can't equip a mod that reduces range to 0 as that's an invalid range
                        return Err(CustomError::InvalidMod.into())
                    }
                } else {
                    modified_troops.data.range = modified_troops.data.range.saturating_add(stats.range.abs().try_into().unwrap());
                } 


                if stats.power < 0 {
                    modified_troops.data.power = modified_troops.data.power.saturating_sub(stats.power.abs().try_into().unwrap());
                    if modified_troops.data.power == 0 {
                        //equipping a mod that reduces power to 0 would kill the unit
                        return Err(CustomError::InvalidMod.into())
                    }
                } else {
                    modified_troops.data.power = modified_troops.data.power.saturating_add(stats.power.abs().try_into().unwrap());
                } 


                if stats.recovery < 0 {
                    modified_troops.data.recovery = modified_troops.data.recovery.saturating_sub(stats.recovery.abs().try_into().unwrap());
                    if modified_troops.data.recovery == 0 {
                        //recovery of 0 means that there's not even a slot delay between unit moves, making an impossibly fast unit
                        return Err(CustomError::InvalidMod.into())
                    }
                } else {
                    modified_troops.data.recovery = modified_troops.data.recovery.saturating_add(stats.recovery.abs().try_into().unwrap());
                } 


                modified_troops.data.mod_inf = modified_troops.data.mod_inf.saturating_add(stats.mod_inf);
                modified_troops.data.mod_armor = modified_troops.data.mod_armor.saturating_add(stats.mod_armor);
                modified_troops.data.mod_air = modified_troops.data.mod_air.saturating_add(stats.mod_air);
                location.troops = Some(modified_troops);
            },
            CardData::unit {stats} => {
                //If location is NOT EMPTY && the troops BELONG TO THIS GAME it's an invalid location
                // If it's NOT EMPTY but the troops belong to a different game, it doesn't really matter
                if location.troops != None && location.troops.as_ref().unwrap().gamekey == game.key() {
                    return Err(CustomError::InvalidLocation.into())
                }
                location.troops = Some(Troop {
                    meta: card.meta,
                    data: stats,
                    last_moved: 0, //troop can always be moved when first played
                    gamekey: game.key()
                });
                location.troop_owner = Some(player.key());   
            }
        }
        
        player.points += card.point_value;    
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
            return Err(CustomError::InvalidMoveGameCheck.into())
        }

        //Move must be to an adjacent tile
        if source.coords.x < target.coords.x-1 ||
        source.coords.x > target.coords.x+1 || 
        source.coords.y < target.coords.y-1 ||
        source.coords.y > target.coords.y+1 
        {
            return Err(CustomError::InvalidMoveRangeCheck.into())
        } 

        //source troops must belong to the player
        if source.troop_owner != Some(player.key()) {
            return Err(CustomError::InvalidMoveOwnershipCheck.into())
        }
        
        //source troops must have surpassed their recovery threshold
        let clock = Clock::get().unwrap();
        let troops = source.troops.as_ref().unwrap();
        if (troops.last_moved + troops.data.recovery as u64) > clock.slot {
            return Err(CustomError::InvalidMoveRecoveryCheck.into());
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
        let player = &mut ctx.accounts.player;
        
        //If no troops on attacking or defending tiles throw an error
        if source.troops == None || target.troops == None {
            return Err(CustomError::InvalidAttackTroopsCheck.into())
        }

        let attacking = source.troops.as_ref().unwrap().clone();
        let defending = target.troops.as_ref().unwrap().clone();

        //Source Troops belong to the player and target troops DO NOT
        if source.troop_owner != Some(player.key()) || target.troop_owner == Some(player.key()) {
            return Err(CustomError::InvalidAttackOwnershipCheck.into())
        }

        //Troops from source and target both belong to THIS game.
        if attacking.gamekey != game.key() || defending.gamekey != game.key() {
            return Err(CustomError::InvalidAttackGameCheck.into())
        }

        //source and target are within range of the attacking troops
        let distance:f64 = (((target.coords.x - source.coords.x).pow(2) + (target.coords.y - source.coords.y).pow(2)) as f64).sqrt();
        if distance > attacking.data.range.into() {
            return Err(CustomError::InvalidAttackRangeCheck.into())
        }

        //attacking troops have recovered from previous move
        let clock = Clock::get().unwrap();
            //u64 can be inferred here because it's not a mod, so it will always be positive 
            //when a troop is first played the last_moved is set to 0 to allow for instant movement
        if (attacking.last_moved + attacking.data.recovery as u64) > clock.slot && attacking.last_moved != 0 {
            return Err(CustomError::InvalidAttackRecoveryCheck.into())
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
                player.points += defending.data.max_power as u64;
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

        //Set last moved to clock.slot; can't do with existing declartions cause mess of logic above
            //Could = None if they got wiped out
        if source.troops != None {
            let mut source_troops = source.troops.as_ref().unwrap().clone();
            source_troops.last_moved = clock.slot;
            source.troops = Some(source_troops);
    
        }
        Ok(())
    }

    // A player can harvest a location if they were the first ones to initalize it
    pub fn harvest_location_initializer(ctx:Context<HarvestInitializer>) -> ProgramResult {
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

    // A builder can harvest a location if they own the NFT
    pub fn harvest_location_builder(ctx:Context<HarvestBuilder>) -> ProgramResult {
        let location = &mut ctx.accounts.location;
        let builder = &ctx.accounts.builder;
        let system = &ctx.accounts.system;

        //NFT VALIDATION
        let space_token = &ctx.accounts.space_token_account;
        let space_metadata = &ctx.accounts.space_metadata_account;

        //Can't use the Anchor Context Account Deserialization because this account was made in native solana so it doesn't have the 8 bit descriminator that anchor looks for 
        let space_metadata_data: SpaceMetadata = try_from_slice_unchecked(&space_metadata.data.borrow_mut())?;
        if space_metadata_data.mint != space_token.mint {
            return Err(CustomError::NFTNotValid.into());
        }
        //NFT VALIDATION END

        let location_seeds: &[&[u8]] = &[
            &location.coords.nx.to_be_bytes(),
            &location.coords.ny.to_be_bytes(),
            &location.coords.x.to_be_bytes(),
            &location.coords.y.to_be_bytes(),
            &[location.bump]
        ];

        let amount_to_pay = location.lamports_player_spent - location.lamports_builder_harvested;
        location.lamports_builder_harvested = location.lamports_player_spent;

        let ix = transfer(
            &location.key(),
            &builder.key(),
            amount_to_pay
        );

        invoke_signed(
            &ix,
            &[
                builder.to_account_info(),
                location.to_account_info(),
                system.to_account_info()
            ],
            &[location_seeds]
        )?;

        emit!(LocationBuilderHarvested {
            location: location.coords.clone(),
            harvest_amount: amount_to_pay,
            builder_key: builder.key(),
            total_harvested: location.lamports_builder_harvested
        });

        Ok(())
    }

    // A player can "activate" the feature on the location if it's not in cooldown for a fee
    pub fn activate_feature(ctx:Context<ActivateFeature>) -> ProgramResult {
        // Portal (Requires a second Location), Lootable Feature (Requires Drop Table), or Oasis
        let player_acc = &mut ctx.accounts.player;
        let player = &ctx.accounts.authority;
        let location = &mut ctx.accounts.location;
        let game = &ctx.accounts.game;
        let system =  &ctx.accounts.system;

        if location.troop_owner != Some(player_acc.key()) && location.troops.as_ref().unwrap().gamekey == game.key()  {
            return Err(CustomError::NoTroopOnBuilding.into())
        }
        
        //Will panic and exit if no feature exists on the location
        let mut feature = location.feature.as_ref().unwrap().clone();


        //Check to see if the feature is in cooldown
        let clock = Clock::get().unwrap();
        if (feature.last_used + feature.recovery) > clock.slot {
            return Err(CustomError::FeatureInCooldown.into())
        }

        //Activate the feature
        match feature.properties {
            FeatureType::healer { power_healed_per_rank } => {
                let heal_bonus = power_healed_per_rank * feature.rank as u64;
                let mut modified_troops = location.troops.as_ref().unwrap().clone();
                modified_troops.data.power += heal_bonus as i8;
                if modified_troops.data.power > modified_troops.data.max_power {
                    modified_troops.data.power = modified_troops.data.max_power;
                }
                location.troops = Some(modified_troops);

                emit!(HealerActivated {
                    gamekey: game.key(),
                    location: location.coords.clone(),
                    troops: location.troops.as_ref().unwrap().clone(),
                    player: player_acc.key()
                })
            },
            FeatureType::portal {
                range_per_rank
            } => {
                let mut destination: Account<Location> = Account::try_from(&ctx.remaining_accounts[0])?;
                let effective_range = range_per_rank * feature.rank as u64; //adding 1 because base rank is 0
                let distance:f64 = (((destination.coords.x - location.coords.x).pow(2) + (destination.coords.y - location.coords.y).pow(2)) as f64).sqrt();
                
                //Destination is out of range
                if (effective_range as f64) < distance {
                    return Err(CustomError::OutOfRange.into())
                }

                //Troops from this game exist on the destination tile
                if destination.troops != None && destination.troops.as_ref().unwrap().gamekey == game.key(){
                    return Err(CustomError::InvalidMoveGameCheck.into())
                }

                let mut modified_troops = location.troops.as_ref().unwrap().clone();
                modified_troops.last_moved = clock.slot;
                destination.troops = Some(modified_troops);
                destination.troop_owner = Some(player_acc.key());
                destination.exit(ctx.program_id)?;
                location.troops = None;
                location.troop_owner = None;

                emit!(PortalActivated {
                    gamekey: game.key(),
                    location: location.coords.clone(),
                    destination: destination.coords.clone(),
                    troops: destination.troops.as_ref().unwrap().clone(),
                    player: player_acc.key()
                })
            },
            FeatureType::lootablefeature {
                ref drop_table_ladder,
                ..
            } => {
                let drop_table: Account<DropTable> = Account::try_from(&ctx.remaining_accounts[0])?;
                if drop_table.id != drop_table_ladder[(feature.rank-1) as usize] { //rank starts at 1, drop_table_ladder starts at 0
                    return Err(CustomError::InvalidDropTable.into())
                }

                let max_draw = drop_table.cards.len();
                let draw = get_random_u64(max_draw as u64);
                let card = drop_table.cards[draw as usize].clone();
                player_acc.cards.push(card.clone());
                emit!(LocationLooted {
                    gamekey: game.key(),
                    location: location.coords.clone(),
                    player: player_acc.key(),
                    drop_table: drop_table.id,
                    card: card.clone()
                });
            }
        }

        //Pay the fee
        let fee = feature.cost_for_use_ladder[(feature.rank - 1) as usize]; //ladder is an array and starts at 0, rank starts at 1
        let ix = transfer(
            &player.key(),
            &location.key(),
            fee
        );
        let location_seeds: &[&[u8]] = &[
            &location.coords.nx.to_be_bytes(),
            &location.coords.ny.to_be_bytes(),
            &location.coords.x.to_be_bytes(),
            &location.coords.y.to_be_bytes(),
            &[location.bump]
        ];
        invoke_signed(
            &ix,
            &[player.to_account_info(),location.to_account_info(),system.to_account_info()],
            &[location_seeds]
        )?;
        location.lamports_player_spent += fee;
        feature.last_used = clock.slot;
        location.feature = Some(feature);
        Ok(())
    }
    
    // Debug Function
    pub fn debug(_ctx: Context<Debug>, debug:DEBUG) -> ProgramResult {
        msg!("{:?}", debug.range);
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
    if defending.data.class == Some(TroopClass::infantry) {
        attacking_power += attacking.data.mod_inf as i16;
    } else if defending.data.class == Some(TroopClass::armor) {
        attacking_power += attacking.data.mod_armor as i16;
    } else if defending.data.class == Some(TroopClass::aircraft) {
        attacking_power += attacking.data.mod_air as i16;
    } 

    if attacking_power < 1 {
        attacking_power = 1;
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

/**
 * Returns a random number below the Max
 * Can replace random u8 function BUT u8 function is useful for getting multiple random numbers in a slot, which this can't do.
 */ 
pub fn get_random_u64(max: u64) -> u64 {
    let clock = Clock::get().unwrap();
    let slice = &hash(&clock.slot.to_be_bytes()).to_bytes()[0..8];
    let num: u64 = u64::from_be_bytes(slice.try_into().unwrap());
    let target = num/(u64::MAX/max);
    return target;
}