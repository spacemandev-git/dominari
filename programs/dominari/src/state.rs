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
    Portal {
        range: u64,
        range_per_upgrade: u64
    }, 
    LootableFeature {
        drop_table_ladder: Vec<u8>, //IDs for the drop tables for this lootable feature
        drop_table_ladder_names: Vec<String> //"Camp, Town, City" etc
    },
    Healer {
        power_healed_per_rank: u64
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Feature{
    pub id: u16,
    pub max_rank: u8,
    pub rank: u8,
    pub rank_upgrade_cost_multiplier: u64,
    pub link_rank_ladder: Vec<String>, //"small_healer.png", "medium_healer.png", etc
    pub properties: FeatureType
}

impl Default for FeatureType {
    fn default() -> Self {FeatureType::Portal {
        range: 1,
        range_per_upgrade: 0
    }}
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug, Copy)]
pub enum TroopClass {
    Infantry,
    Armor,
    Aircraft
}

impl Default for TroopClass {
    fn default() -> Self { TroopClass::Infantry }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Card{
    pub drop_table_id: u8,
    pub id: u64,
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
    ACTION, // Unlikely to need a struct as it'll all be custom coded by name or id of the card
    MOD (StatInfo),
    UNIT (StatInfo)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct StatInfo {
    pub class: Option<TroopClass>,
    pub range: i8,
    pub power: i8,
    pub mod_inf: i8,
    pub mod_armor: i8,
    pub mod_air: i8,
    pub recovery: i64, //How many slots til it can move again
}

