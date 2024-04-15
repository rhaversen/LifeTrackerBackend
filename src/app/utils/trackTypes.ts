export const trackTypes = {
    TEST_TRACK: {
        allowedKeys: {
        }
    },
    CONSUMED_WATER: {
        allowedKeys: {
            litresProduct: Number
        }
    },
    CONSUMED_ALCOHOL: {
        allowedKeys: {
            litresProduct: Number,
            alcoholPercentage: Number
        }
    },
    CONSUMED_FOOD: {
        allowedKeys: {
            gramsProduct: Number,
            caloriesTotal: Number
        }
    },
    CONSUMED_CAFFEINE: {
        allowedKeys: {
            gramsProduct: Number,
            gramsCaffeine: Number
        }
    },
    CONSUMED_CIGARETTE: {
        allowedKeys: {
            gramsProduct: Number,
            gramsNicotine: Number
        }
    },
    CONSUMED_SNUFF: {
        allowedKeys: {
            gramsProduct: Number,
            gramsNicotine: Number
        }
    },
    EXCRETED_URINE: {
        allowedKeys: {
            litres: Number
        }
    },
    EXCRETED_FECES: {
        allowedKeys: {
            litres: Number
        }
    },
    EXCRETED_VOMIT: {
        allowedKeys: {
            litres: Number
        }
    },
    HAIRCUT: {
        allowedKeys: {
            metersCut: Number
            professinal: Boolean
        }
    },
    BLOW_NOSE: {
        allowedKeys: {
        }
    },
    BRUSH_TEETH: {
        allowedKeys: {
        }
    },
    Shower: {
        allowedKeys: {
            temperature: Number,
            liters: Number,
            tub: Boolean
        }
    },
    SHAVE: {
        allowedKeys: {
            professional: Boolean
        }
    },
    HEARTACHE: {
        allowedKeys: {
        }
    },
    HEADACHE: {
        allowedKeys: {
        }
    },
    MASTURBATE: {
        allowedKeys: {
            orgasm: Number
        }
    },
    SEX: {
        allowedKeys: {
            youOrgasm: Number
            theyOrgasm: Number
        }
    },
    CLIP_NAILS: {
        allowedKeys: {
            cutCentimeters: Number
        }
    },
    COOKING: {
        allowedKeys: {
        }
    },
    CLEANING: {
        allowedKeys: {
        }
    },
    FART: {
        allowedKeys: {
        }
    },
    POP_ZIT: {
        allowedKeys: {
            resqueeze: Boolean // Popped this zit before?
        }
    }
}
