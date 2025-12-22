export const CRISIS_RESOURCES = {
    US: {
        name: "988 Suicide & Crisis Lifeline",
        phone: "988",
        text: "Text 988",
        url: "https://988lifeline.org/",
    },
    AUSTRALIA: {
        name: "Lifeline Australia",
        phone: "13 11 14",
        text: "Text 0477 13 11 14",
        url: "https://www.lifeline.org.au/",
    },
    INTERNATIONAL: {
        name: "International Association for Suicide Prevention",
        url: "https://www.iasp.info/resources/Crisis_Centres/",
    },
    EMERGENCY: {
        US: "911",
        AUSTRALIA: "000",
        UK: "999",
        GENERIC: "Emergency Services",
    },
};

export const CRISIS_WARNING_MESSAGE =
    "If you are in immediate danger or thinking of harming yourself, contact emergency services or your local crisis line immediately.";

export const RISK_THRESHOLD_CRISIS = 70; // Risk score above which crisis messaging is mandatory
