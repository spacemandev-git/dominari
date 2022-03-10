use anchor_lang::{prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Copy, Default)]
pub struct Coords {
    pub nx: i64,
    pub ny: i64,
    pub x: i64,
    pub y: i64
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Feature {
    Portal, 
    LootableFeature,
    Healer,
}

impl Default for Feature {
    fn default() -> Self {Feature::Portal}
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

