use anchor_lang::prelude::*;

#[error]
pub enum CustomError {
    #[msg("The Space NFT you provided is not valid")]
    NFTNotValid,

    #[msg("Game is disabled")]
    GameDisabled,

    #[msg("Invalid Location")]
    InvalidLocation,

    #[msg("Unit Class Mismatch")]
    UnitClassMismatch,

    #[msg("Mod cannot be applied")]
    InvalidMod,
}

/*
if umod.range < 0 {
    modified_troops.range = modified_troops.range.saturating_sub(umod.range.abs().try_into().unwrap());
} else {
    modified_troops.range = modified_troops.range.saturating_add(umod.range.abs().try_into().unwrap());
}
if modified_troops.range < 1 {
    return Err(ErrorCode::InvalidMod.into())
}

if umod.power < 0 {
    modified_troops.power = modified_troops.power.saturating_sub(umod.power.abs().try_into().unwrap());
} else {
    modified_troops.power = modified_troops.power.saturating_add(umod.power.abs().try_into().unwrap());
}
if modified_troops.power < 1 {
    return Err(ErrorCode::InvalidMod.into())
}

if umod.recovery < 0 {
    modified_troops.recovery = modified_troops.recovery.saturating_sub(umod.recovery.abs().try_into().unwrap());
} else {
    modified_troops.recovery = modified_troops.recovery.saturating_add(umod.recovery.abs().try_into().unwrap());
}

modified_troops.mod_inf = modified_troops.mod_inf.saturating_add(umod.mod_inf);
modified_troops.mod_armor = modified_troops.mod_armor.saturating_add(umod.mod_armor);
modified_troops.mod_air = modified_troops.mod_air.saturating_add(umod.mod_air);
location.troops = Some(modified_troops);
*/