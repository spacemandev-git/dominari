#![allow(non_camel_case_types)]
use anchor_lang::{prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Copy, Default)]
pub struct Coords {
    pub nx: i64,
    pub ny: i64,
    pub x: i64,
    pub y: i64
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum FeatureType {
    portal {
        range_per_rank: u64
    }, 
    lootablefeature {
        drop_table_ladder: Vec<u64>, //IDs for the drop tables for this lootable feature
    },
    healer {
        power_healed_per_rank: u64
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Feature{
    pub name: String,
    pub id: u16,
    pub max_rank: u8,
    pub rank: u8,
    pub rank_upgrade_cost_multiplier: u64,
    pub cost_for_use_ladder: Vec<u64>,
    pub link_rank_ladder: Vec<String>, //"small_healer.png", "medium_healer.png", etc
    pub name_rank_ladder: Vec<String>, //"small_healer", "medium_healer", etc
    pub properties: FeatureType,
    pub last_used: u64, //Slot it was last used in
    pub recovery: u64 //Slots it takes to recover from being used
}

impl Default for FeatureType {
    fn default() -> Self {FeatureType::portal {
        range_per_rank: 1
    }}
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug, Copy)]
pub enum TroopClass {
    infantry,
    armor,
    aircraft
}

impl Default for TroopClass {
    fn default() -> Self { TroopClass::infantry }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Card{
    pub drop_table_id: u64,
    pub id: u64,
    pub point_value: u64,
    pub meta: MetaInformation,
    pub data: CardData   
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Troop {
    pub meta: MetaInformation,
    pub data: StatInfo,
    pub last_moved: u64,
    pub gamekey: Pubkey
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct MetaInformation {
    pub name: String,
    pub description: String,
    pub link: String
}

/*
 * A card can be a ACTION, MOD, or UNIT
 * ACTIONs are specially coded to do a thing. Teleport, demolish a structure, drop a nuke, etc
 * MODs modify existing units
 * UNITs are placeable toops
 */
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum CardData {
    action, // Unlikely to need a struct as it'll all be custom coded by name or id of the card
    unitmod { stats: StatInfo },
    unit { stats: StatInfo }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct StatInfo {
    pub class: Option<TroopClass>,
    pub range: i8,
    pub power: i8,
    pub max_power: i8,
    pub mod_inf: i8,
    pub mod_armor: i8,
    pub mod_air: i8,
    pub recovery: i64, //How many slots til it can move again
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct DEBUG{
    pub range: i8
}