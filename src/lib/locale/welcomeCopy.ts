import type { BeizaCharacterLocale, BeizaLocale } from "@/lib/locale/types";



export type WelcomeCopy = {

  tagline: string;

  subheading: string;

  /** Under region icons — switches with locale (native tongue) */

  regionToggleHint: string;

  regionToggleSubhint: string;

  pinLabel: string;

  unpinLabel: string;

  paths: {

    education: { label: string; title: string; subtitle: string; meta: string };

    legacy: { label: string; title: string; subtitle: string; meta: string };

    farewell: { label: string; title: string; subtitle: string; meta: string };

  };

};



const US_COPY: WelcomeCopy = {

  tagline: "Stories of the people we love",

  subheading: "Where would you like to begin?",

  regionToggleHint: "Build intentional legacy — your family circle, your story in your own words.",

  regionToggleSubhint: "Record in any language. We work with your words behind the scenes.",

  pinLabel: "Pin this language",

  unpinLabel: "Unpin — match my device language",

  paths: {

    education: {

      label: "Education",

      title: "Learn your culture",

      subtitle:

        "Discover Adinkra symbols and the living wisdom your people carried across generations.",

      meta: "Explore",

    },

    legacy: {

      label: "Legacy",

      title: "Preserve a life story",

      subtitle:

        "Capture voices, build your family tree, and turn memories into a memoir that lasts forever.",

      meta: "Start here",

    },

    farewell: {

      label: "Farewell",

      title: "Craft a memorial",

      subtitle:

        "Memorial art, legacy vessels, and caskets crafted to honor a life with dignity and beauty.",

      meta: "Learn more",

    },

  },

};



const IN_COPY: WelcomeCopy = {

  tagline: "जिन लोगों से प्यार है, उनकी कहानियाँ",

  subheading: "आप कहाँ से शुरू करना चाहेंगे?",

  regionToggleHint:

    "जानबूझकर विरासत बनाएं — अपना परिवारिक मंडल, अपनी भाषा में अपनी कहानी।",

  regionToggleSubhint: "किसी भी भाषा में रिकॉर्ड करें। हम पर्दे के पीछे आपके शब्दों के साथ काम करते हैं।",

  pinLabel: "इस भाषा को पिन करें",

  unpinLabel: "अनपिन — डिवाइस की भाषा से मिलाएँ",

  paths: {

    education: {

      label: "शिक्षा",

      title: "अपनी संस्कृति जानें",

      subtitle: "छोटी फ़िल्में जो आपको अपनी संस्कृति के अंदर ले जाती हैं — फिर प्रतीक और कहानियाँ।",

      meta: "देखें",

    },

    legacy: {

      label: "विरासत",

      title: "एक जीवन की कहानी संभालें",

      subtitle: "आवाज़ें, वंश वृक्ष और यादें — हमेशा के लिए संरक्षित।",

      meta: "यहाँ से",

    },

    farewell: {

      label: "विदाई",

      title: "एक स्मारक तैयार करें",

      subtitle: "सम्मान और सुंदरता से जीवन का स्मरण।",

      meta: "और जानें",

    },

  },

};



const LA_COPY: WelcomeCopy = {

  tagline: "Historias de quienes amamos",

  subheading: "¿Por dónde quieres empezar?",

  regionToggleHint:

    "Construye un legado intencional — tu círculo familiar, tu historia en tu lengua.",

  regionToggleSubhint: "Graba en cualquier idioma. Trabajamos tus palabras en segundo plano.",

  pinLabel: "Fijar este idioma",

  unpinLabel: "Desfijar — usar idioma del dispositivo",

  paths: {

    education: {

      label: "Educación",

      title: "Conoce tu cultura",

      subtitle: "Cortos que te meten en tu cultura — luego símbolos y historias de familia.",

      meta: "Ver",

    },

    legacy: {

      label: "Legado",

      title: "Preserva una vida",

      subtitle: "Voces, árbol familiar y memorias para siempre.",

      meta: "Empezar",

    },

    farewell: {

      label: "Despedida",

      title: "Crea un memorial",

      subtitle: "Arte conmemorativo con dignidad y belleza.",

      meta: "Saber más",

    },

  },

};



const ZH_COPY: WelcomeCopy = {

  tagline: "我们所爱之人的故事",

  subheading: "您想从哪里开始？",

  regionToggleHint: "建立有意义的传承 — 您的家族圈子，用母语讲述您自己的故事。",

  regionToggleSubhint: "可用任何语言录制。我们在后台处理您的原话。",

  pinLabel: "固定此语言",

  unpinLabel: "取消固定 — 跟随设备语言",

  paths: {

    education: {

      label: "教育",

      title: "了解您的文化",

      subtitle: "短片带您走进文化现场，再探索符号与家族故事。",

      meta: "观看",

    },

    legacy: {

      label: "传承",

      title: "保存一生故事",

      subtitle: "声音、家谱与记忆，永久留存。",

      meta: "从这里",

    },

    farewell: {

      label: "告别",

      title: "打造纪念",

      subtitle: "以尊严与美感铭记生命。",

      meta: "了解更多",

    },

  },

};



const BR_COPY: WelcomeCopy = {

  tagline: "Histórias das pessoas que amamos",

  subheading: "Por onde você quer começar?",

  regionToggleHint:

    "Construa um legado intencional — seu círculo familiar, sua história na sua língua.",

  regionToggleSubhint: "Grave em qualquer idioma. Trabalhamos suas palavras nos bastidores.",

  pinLabel: "Fixar este idioma",

  unpinLabel: "Desafixar — usar idioma do dispositivo",

  paths: {

    education: {

      label: "Educação",

      title: "Conheça sua cultura",

      subtitle: "Filmes curtos que colocam você dentro da sua cultura — depois símbolos e histórias.",

      meta: "Assistir",

    },

    legacy: {

      label: "Legado",

      title: "Preserve uma vida",

      subtitle: "Vozes, árvore familiar e memórias para sempre.",

      meta: "Começar",

    },

    farewell: {

      label: "Despedida",

      title: "Crie um memorial",

      subtitle: "Arte memorial com dignidade e beleza.",

      meta: "Saiba mais",

    },

  },

};



const CHARACTER_COPY: Record<BeizaCharacterLocale, WelcomeCopy> = {

  "black-american": US_COPY,

  indian: IN_COPY,

  latina: LA_COPY,

  chinese: ZH_COPY,

  brazilian: BR_COPY,

};



export const WELCOME_COPY: Record<BeizaLocale, WelcomeCopy> = {

  ...CHARACTER_COPY,

  fr: {

    tagline: "Les histoires de ceux que nous aimons",

    subheading: "Par où souhaitez-vous commencer ?",

    regionToggleHint:

      "Construire un héritage intentionnel — votre cercle familial, votre histoire dans votre langue.",

    regionToggleSubhint:

      "Enregistrez dans n'importe quelle langue. Nous travaillons vos mots en arrière-plan.",

    pinLabel: "Épingler cette langue",

    unpinLabel: "Désépingler — suivre l'appareil",

    paths: {

      education: {

        label: "Éducation",

        title: "Découvrir votre culture",

        subtitle:

          "Courts métrages qui vous plongent dans votre culture — puis symboles et histoires.",

        meta: "Voir",

      },

      legacy: {

        label: "Héritage",

        title: "Préserver une vie",

        subtitle:

          "Voix, arbre familial et souvenirs transformés en un mémoire pour les générations futures.",

        meta: "Commencer",

      },

      farewell: {

        label: "Adieu",

        title: "Créer un mémorial",

        subtitle:

          "Art commémoratif, reliquaires et cercueils conçus pour honorer une vie avec dignité.",

        meta: "En savoir plus",

      },

    },

  },

  africa: {

    ...US_COPY,

    regionToggleHint:

      "Build intentional legacy. Your family circle, your story in your own words.",

    regionToggleSubhint:

      "Same recording tool for every region. We translate prompts and labels, not your voice.",

    paths: {

      ...US_COPY.paths,

      education: {

        label: "Education",

        title: "Learn your culture",

        subtitle:

          "Films that take you into African life: Adinkra, drum, and voices across the continent.",

        meta: "Watch",

      },

      legacy: {

        ...US_COPY.paths.legacy,

        subtitle:

          "Record with Marmah's studio. One vault, one family tree, kept in your own words.",

      },

    },

  },

};



/** Welcome UI copy for the active locale (falls back to US) */

export function welcomeCopyForLocale(locale: BeizaLocale): WelcomeCopy {

  return WELCOME_COPY[locale] ?? US_COPY;

}


