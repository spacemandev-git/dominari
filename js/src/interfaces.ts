import {BN} from '@project-serum/anchor';

export interface Coords {
    nx: number,
    ny: number,
    x: number,
    y: number
}

export interface SPACENFT {
    pubkey: string,
    mint: string,
    x: number,
    y: number
}

export interface Card {
    dropTableId: number | BN,
    id: number | BN,
    meta: MetaInformation,
    data: CardData
}

export interface MetaInformation {
    name: string,
    description: string,
    link: string
}

export interface CardData{
    action?: any,
    unitmod?: StatInfoHolder
    unit?: StatInfoHolder
}

interface StatInfoHolder {
    stats: StatInfo
}

export interface StatInfo {
    class?: TroopClass,
    range: number | BN,
    power: number | BN,
    maxPower: number | BN,
    modInf: number | BN,
    modArmor: number | BN,
    modAir: number | BN,
    recovery: number | BN
}

export interface TroopClass {
    infantry?: {},
    armor?: {},
    aircraft?: {}
}

export interface Feature {
    id: number | BN,
    maxRank: number | BN,
    rank: number | BN,
    rankUpgradeCostMulitiplier: number | BN,
    costForUseLadder: number[] | BN[],
    linkRankLadder: string[],
    properties: FeatureType,
    lastUsed: number | BN,
    recovery: number | BN
}

export interface FeatureType {
    portal?: FT_Portal,
    lootablefeature?: FT_LootableFeature,
    healer?: FT_Healer
}

export interface FT_Portal{
    rangePerRank: number | BN
}

export interface FT_LootableFeature {
    dropTableLadder: number[] | BN[],
    dropTableLadderNames: string[]
}

export interface FT_Healer{
    powerHealedPerRank: number | BN
}