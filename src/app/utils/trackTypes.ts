export const trackTypes = {
    TEST_TRACK: {
    },
    CONSUMED_WATER: {
        litresProduct: Number
    },
    CONSUMED_ALCOHOL: {
        litresProduct: Number,
        alcoholPercentage: Number
    },
    CONSUMED_FOOD: {
        gramsProduct: Number,
        caloriesTotal: Number
    },
    CONSUMED_CAFFEINE: {
        gramsProduct: Number,
        gramsCaffeine: Number
    },
    CONSUMED_CIGARETTE: {
        gramsProduct: Number,
        gramsNicotine: Number
    },
    CONSUMED_SNUFF: {
        gramsProduct: Number,
        gramsNicotine: Number
    },
    EXCRETED_URINE: {
        litres: Number
    },
    EXCRETED_FECES: {
        grams: Number
    },
    EXCRETED_VOMIT: {
        litres: Number,
        forced: Boolean
    },
    HAIRCUT: {
        metersCut: Number,
        professional: Boolean
    },
    BLOW_NOSE: {
    },
    BRUSH_TEETH: {
    },
    Shower: {
        temperature: Number,
        liters: Number,
        tub: Boolean
    },
    SHAVE: {
        professional: Boolean
    },
    HEARTACHE: {
    },
    HEADACHE: {
    },
    MASTURBATE: {
        orgasm: Number
    },
    SEX: {
        youOrgasm: Number,
        theyOrgasm: Number
    },
    CLIP_NAILS: {
        cutCentimeters: Number
    },
    COOKING: {
    },
    CLEANING: {
    },
    FART: {
    },
    POP_ZIT: {
        resqueeze: Boolean // Popped this zit before?
    }
}
