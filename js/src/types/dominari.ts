export type Dominari = {
  "version": "0.1.0",
  "name": "dominari",
  "instructions": [
    {
      "name": "initLocation",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "loc",
          "type": {
            "defined": "Coords"
          }
        }
      ]
    },
    {
      "name": "buildLocation",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spaceTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spaceMetadataAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "builder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buildables",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "idx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "debugBuildLocation",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "builder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buildables",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "idx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initGame",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "nx",
          "type": "i64"
        },
        {
          "name": "ny",
          "type": "i64"
        }
      ]
    },
    {
      "name": "toggleGame",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "registerPlayer",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "initDropTable",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dropTableAcc",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "cards",
          "type": {
            "vec": {
              "defined": "Card"
            }
          }
        }
      ]
    },
    {
      "name": "setDropTable",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dropTableAcc",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "cards",
          "type": {
            "vec": {
              "defined": "Card"
            }
          }
        }
      ]
    },
    {
      "name": "setBuildable",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "buildables",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buildables",
          "type": {
            "vec": {
              "defined": "Feature"
            }
          }
        }
      ]
    },
    {
      "name": "destroyFeature",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initBuildable",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buildables",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buildables",
          "type": {
            "vec": {
              "defined": "Feature"
            }
          }
        }
      ]
    },
    {
      "name": "playCard",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "cardIdx",
          "type": "u16"
        }
      ]
    },
    {
      "name": "moveTroops",
      "accounts": [
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "target",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "attack",
      "accounts": [
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "target",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "harvestLocationInitializer",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "harvestLocationBuilder",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "builder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spaceTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spaceMetadataAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "activateFeature",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "debug",
      "accounts": [],
      "args": [
        {
          "name": "debug",
          "type": {
            "defined": "DEBUG"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "location",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializer",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "coords",
            "type": {
              "defined": "Coords"
            }
          },
          {
            "name": "lamportsInvested",
            "type": "u64"
          },
          {
            "name": "lamportsHarvested",
            "type": "u64"
          },
          {
            "name": "feature",
            "type": {
              "option": {
                "defined": "Feature"
              }
            }
          },
          {
            "name": "lamportsPlayerSpent",
            "type": "u64"
          },
          {
            "name": "lamportsBuilderHarvested",
            "type": "u64"
          },
          {
            "name": "troops",
            "type": {
              "option": {
                "defined": "Troop"
              }
            }
          },
          {
            "name": "troopOwner",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "spaceMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "spaceX",
            "type": "i64"
          },
          {
            "name": "spaceY",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "coords",
            "type": {
              "defined": "Coords"
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "enabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gamekey",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "cards",
            "type": {
              "vec": {
                "defined": "Card"
              }
            }
          },
          {
            "name": "points",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "dropTable",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "cards",
            "type": {
              "vec": {
                "defined": "Card"
              }
            }
          }
        ]
      }
    },
    {
      "name": "buildables",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buildables",
            "type": {
              "vec": {
                "defined": "Feature"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Coords",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nx",
            "type": "i64"
          },
          {
            "name": "ny",
            "type": "i64"
          },
          {
            "name": "x",
            "type": "i64"
          },
          {
            "name": "y",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "Feature",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "maxRank",
            "type": "u8"
          },
          {
            "name": "rank",
            "type": "u8"
          },
          {
            "name": "rankUpgradeCostMultiplier",
            "type": "u64"
          },
          {
            "name": "costForUseLadder",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "linkRankLadder",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "nameRankLadder",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "properties",
            "type": {
              "defined": "FeatureType"
            }
          },
          {
            "name": "lastUsed",
            "type": "u64"
          },
          {
            "name": "recovery",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Card",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dropTableId",
            "type": "u64"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "pointValue",
            "type": "u64"
          },
          {
            "name": "meta",
            "type": {
              "defined": "MetaInformation"
            }
          },
          {
            "name": "data",
            "type": {
              "defined": "CardData"
            }
          }
        ]
      }
    },
    {
      "name": "Troop",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "meta",
            "type": {
              "defined": "MetaInformation"
            }
          },
          {
            "name": "data",
            "type": {
              "defined": "StatInfo"
            }
          },
          {
            "name": "lastMoved",
            "type": "u64"
          },
          {
            "name": "gamekey",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "MetaInformation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "link",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "StatInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "class",
            "type": {
              "option": {
                "defined": "TroopClass"
              }
            }
          },
          {
            "name": "range",
            "type": "i8"
          },
          {
            "name": "power",
            "type": "i8"
          },
          {
            "name": "maxPower",
            "type": "i8"
          },
          {
            "name": "modInf",
            "type": "i8"
          },
          {
            "name": "modArmor",
            "type": "i8"
          },
          {
            "name": "modAir",
            "type": "i8"
          },
          {
            "name": "recovery",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "DEBUG",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "range",
            "type": "i8"
          }
        ]
      }
    },
    {
      "name": "CustomError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NFTNotValid"
          },
          {
            "name": "GameDisabled"
          },
          {
            "name": "InvalidLocation"
          },
          {
            "name": "UnitClassMismatch"
          },
          {
            "name": "InvalidMod"
          },
          {
            "name": "InvalidMoveOwnershipCheck"
          },
          {
            "name": "InvalidMoveGameCheck"
          },
          {
            "name": "InvalidMoveRangeCheck"
          },
          {
            "name": "InvalidMoveRecoveryCheck"
          },
          {
            "name": "InvalidAttackTroopsCheck"
          },
          {
            "name": "InvalidAttackOwnershipCheck"
          },
          {
            "name": "InvalidAttackGameCheck"
          },
          {
            "name": "InvalidAttackRangeCheck"
          },
          {
            "name": "InvalidAttackRecoveryCheck"
          },
          {
            "name": "FeatureMaxRank"
          },
          {
            "name": "NoTroopOnBuilding"
          },
          {
            "name": "OutOfRange"
          },
          {
            "name": "InvalidDropTable"
          },
          {
            "name": "FeatureInCooldown"
          }
        ]
      }
    },
    {
      "name": "FeatureType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "portal",
            "fields": [
              {
                "name": "range_per_rank",
                "type": "u64"
              }
            ]
          },
          {
            "name": "lootablefeature",
            "fields": [
              {
                "name": "drop_table_ladder",
                "type": {
                  "vec": "u64"
                }
              }
            ]
          },
          {
            "name": "healer",
            "fields": [
              {
                "name": "power_healed_per_rank",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "TroopClass",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "infantry"
          },
          {
            "name": "armor"
          },
          {
            "name": "aircraft"
          }
        ]
      }
    },
    {
      "name": "CardData",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "action"
          },
          {
            "name": "unitmod",
            "fields": [
              {
                "name": "stats",
                "type": {
                  "defined": "StatInfo"
                }
              }
            ]
          },
          {
            "name": "unit",
            "fields": [
              {
                "name": "stats",
                "type": {
                  "defined": "StatInfo"
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "NewLocationInitialized",
      "fields": [
        {
          "name": "coords",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "initializer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "FeatureModified",
      "fields": [
        {
          "name": "coords",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "feature",
          "type": {
            "option": {
              "defined": "Feature"
            }
          },
          "index": false
        }
      ]
    },
    {
      "name": "NewPlayerRegistered",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "playerkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "playername",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TroopsMoved",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "source",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "target",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "troops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        }
      ]
    },
    {
      "name": "Combat",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "source",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "target",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "attackingPlayer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "defendingPlayer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "attackingTroops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "defendingTroops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "attackingDmg",
          "type": "u8",
          "index": false
        },
        {
          "name": "defendingDmg",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "LocationHarvested",
      "fields": [
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "harvestAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "initializerKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "totalHarvested",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "LocationBuilderHarvested",
      "fields": [
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "harvestAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "builderKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "totalHarvested",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "HealerActivated",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "troops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PortalActivated",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "destination",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "troops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "LocationLooted",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "dropTable",
          "type": "u64",
          "index": false
        },
        {
          "name": "card",
          "type": {
            "defined": "Card"
          },
          "index": false
        }
      ]
    }
  ]
};

export const IDL: Dominari = {
  "version": "0.1.0",
  "name": "dominari",
  "instructions": [
    {
      "name": "initLocation",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "loc",
          "type": {
            "defined": "Coords"
          }
        }
      ]
    },
    {
      "name": "buildLocation",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "spaceTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spaceMetadataAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "builder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buildables",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "idx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "debugBuildLocation",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "builder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buildables",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "idx",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initGame",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "nx",
          "type": "i64"
        },
        {
          "name": "ny",
          "type": "i64"
        }
      ]
    },
    {
      "name": "toggleGame",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "registerPlayer",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "initDropTable",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dropTableAcc",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "cards",
          "type": {
            "vec": {
              "defined": "Card"
            }
          }
        }
      ]
    },
    {
      "name": "setDropTable",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dropTableAcc",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "cards",
          "type": {
            "vec": {
              "defined": "Card"
            }
          }
        }
      ]
    },
    {
      "name": "setBuildable",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "buildables",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buildables",
          "type": {
            "vec": {
              "defined": "Feature"
            }
          }
        }
      ]
    },
    {
      "name": "destroyFeature",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initBuildable",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buildables",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buildables",
          "type": {
            "vec": {
              "defined": "Feature"
            }
          }
        }
      ]
    },
    {
      "name": "playCard",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "cardIdx",
          "type": "u16"
        }
      ]
    },
    {
      "name": "moveTroops",
      "accounts": [
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "target",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "attack",
      "accounts": [
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "target",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "harvestLocationInitializer",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "harvestLocationBuilder",
      "accounts": [
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "builder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spaceTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "spaceMetadataAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "activateFeature",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "location",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "debug",
      "accounts": [],
      "args": [
        {
          "name": "debug",
          "type": {
            "defined": "DEBUG"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "location",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initializer",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "coords",
            "type": {
              "defined": "Coords"
            }
          },
          {
            "name": "lamportsInvested",
            "type": "u64"
          },
          {
            "name": "lamportsHarvested",
            "type": "u64"
          },
          {
            "name": "feature",
            "type": {
              "option": {
                "defined": "Feature"
              }
            }
          },
          {
            "name": "lamportsPlayerSpent",
            "type": "u64"
          },
          {
            "name": "lamportsBuilderHarvested",
            "type": "u64"
          },
          {
            "name": "troops",
            "type": {
              "option": {
                "defined": "Troop"
              }
            }
          },
          {
            "name": "troopOwner",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "spaceMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "spaceX",
            "type": "i64"
          },
          {
            "name": "spaceY",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "coords",
            "type": {
              "defined": "Coords"
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "enabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gamekey",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "cards",
            "type": {
              "vec": {
                "defined": "Card"
              }
            }
          },
          {
            "name": "points",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "dropTable",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "cards",
            "type": {
              "vec": {
                "defined": "Card"
              }
            }
          }
        ]
      }
    },
    {
      "name": "buildables",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buildables",
            "type": {
              "vec": {
                "defined": "Feature"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Coords",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nx",
            "type": "i64"
          },
          {
            "name": "ny",
            "type": "i64"
          },
          {
            "name": "x",
            "type": "i64"
          },
          {
            "name": "y",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "Feature",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u16"
          },
          {
            "name": "maxRank",
            "type": "u8"
          },
          {
            "name": "rank",
            "type": "u8"
          },
          {
            "name": "rankUpgradeCostMultiplier",
            "type": "u64"
          },
          {
            "name": "costForUseLadder",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "linkRankLadder",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "nameRankLadder",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "properties",
            "type": {
              "defined": "FeatureType"
            }
          },
          {
            "name": "lastUsed",
            "type": "u64"
          },
          {
            "name": "recovery",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Card",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dropTableId",
            "type": "u64"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "pointValue",
            "type": "u64"
          },
          {
            "name": "meta",
            "type": {
              "defined": "MetaInformation"
            }
          },
          {
            "name": "data",
            "type": {
              "defined": "CardData"
            }
          }
        ]
      }
    },
    {
      "name": "Troop",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "meta",
            "type": {
              "defined": "MetaInformation"
            }
          },
          {
            "name": "data",
            "type": {
              "defined": "StatInfo"
            }
          },
          {
            "name": "lastMoved",
            "type": "u64"
          },
          {
            "name": "gamekey",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "MetaInformation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "link",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "StatInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "class",
            "type": {
              "option": {
                "defined": "TroopClass"
              }
            }
          },
          {
            "name": "range",
            "type": "i8"
          },
          {
            "name": "power",
            "type": "i8"
          },
          {
            "name": "maxPower",
            "type": "i8"
          },
          {
            "name": "modInf",
            "type": "i8"
          },
          {
            "name": "modArmor",
            "type": "i8"
          },
          {
            "name": "modAir",
            "type": "i8"
          },
          {
            "name": "recovery",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "DEBUG",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "range",
            "type": "i8"
          }
        ]
      }
    },
    {
      "name": "CustomError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NFTNotValid"
          },
          {
            "name": "GameDisabled"
          },
          {
            "name": "InvalidLocation"
          },
          {
            "name": "UnitClassMismatch"
          },
          {
            "name": "InvalidMod"
          },
          {
            "name": "InvalidMoveOwnershipCheck"
          },
          {
            "name": "InvalidMoveGameCheck"
          },
          {
            "name": "InvalidMoveRangeCheck"
          },
          {
            "name": "InvalidMoveRecoveryCheck"
          },
          {
            "name": "InvalidAttackTroopsCheck"
          },
          {
            "name": "InvalidAttackOwnershipCheck"
          },
          {
            "name": "InvalidAttackGameCheck"
          },
          {
            "name": "InvalidAttackRangeCheck"
          },
          {
            "name": "InvalidAttackRecoveryCheck"
          },
          {
            "name": "FeatureMaxRank"
          },
          {
            "name": "NoTroopOnBuilding"
          },
          {
            "name": "OutOfRange"
          },
          {
            "name": "InvalidDropTable"
          },
          {
            "name": "FeatureInCooldown"
          }
        ]
      }
    },
    {
      "name": "FeatureType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "portal",
            "fields": [
              {
                "name": "range_per_rank",
                "type": "u64"
              }
            ]
          },
          {
            "name": "lootablefeature",
            "fields": [
              {
                "name": "drop_table_ladder",
                "type": {
                  "vec": "u64"
                }
              }
            ]
          },
          {
            "name": "healer",
            "fields": [
              {
                "name": "power_healed_per_rank",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "TroopClass",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "infantry"
          },
          {
            "name": "armor"
          },
          {
            "name": "aircraft"
          }
        ]
      }
    },
    {
      "name": "CardData",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "action"
          },
          {
            "name": "unitmod",
            "fields": [
              {
                "name": "stats",
                "type": {
                  "defined": "StatInfo"
                }
              }
            ]
          },
          {
            "name": "unit",
            "fields": [
              {
                "name": "stats",
                "type": {
                  "defined": "StatInfo"
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "NewLocationInitialized",
      "fields": [
        {
          "name": "coords",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "initializer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "FeatureModified",
      "fields": [
        {
          "name": "coords",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "feature",
          "type": {
            "option": {
              "defined": "Feature"
            }
          },
          "index": false
        }
      ]
    },
    {
      "name": "NewPlayerRegistered",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "playerkey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "playername",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TroopsMoved",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "source",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "target",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "troops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        }
      ]
    },
    {
      "name": "Combat",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "source",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "target",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "attackingPlayer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "defendingPlayer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "attackingTroops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "defendingTroops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "attackingDmg",
          "type": "u8",
          "index": false
        },
        {
          "name": "defendingDmg",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "LocationHarvested",
      "fields": [
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "harvestAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "initializerKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "totalHarvested",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "LocationBuilderHarvested",
      "fields": [
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "harvestAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "builderKey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "totalHarvested",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "HealerActivated",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "troops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PortalActivated",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "destination",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "troops",
          "type": {
            "defined": "Troop"
          },
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "LocationLooted",
      "fields": [
        {
          "name": "gamekey",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "location",
          "type": {
            "defined": "Coords"
          },
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "dropTable",
          "type": "u64",
          "index": false
        },
        {
          "name": "card",
          "type": {
            "defined": "Card"
          },
          "index": false
        }
      ]
    }
  ]
};
