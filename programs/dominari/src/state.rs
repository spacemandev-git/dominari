use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Copy)]
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Troop {
    pub name: String,
    pub link: String,
    pub class: TroopClass,
    pub range: u8,
    pub power: u8,
    pub mod_inf: i8,
    pub mod_armor: i8,
    pub mod_air: i8,
    pub recovery: u64, //slots
    pub last_moved: u64 // slot number
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
