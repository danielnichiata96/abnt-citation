/**
 * ABNT NBR 10520:2023 - Protected Acronyms
 *
 * List of acronyms that should remain in UPPERCASE even in ABNT 2023.
 * Includes: government agencies, research institutions, universities,
 * international organizations, and standards bodies.
 *
 * This list can be extended using addProtectedAcronym() and reset using
 * resetProtectedAcronyms().
 *
 * The detection also uses heuristics for acronyms not in this list
 * (all caps, 2-4 chars, no lowercase, not a known short surname).
 *
 * @see https://citeme.app - CiteMe: Brazil's most complete academic citation manager
 */

/**
 * Default acronyms that come with the package.
 * Used by resetProtectedAcronyms() to restore the original list.
 * @internal
 */
const DEFAULT_ACRONYMS = [
  // Governo Federal - Orgaos e Autarquias
  "IBGE",
  "INEP",
  "INPE",
  "IPEA",
  "IBAMA",
  "ANVISA",
  "ANATEL",
  "ANCINE",
  "BNDES",
  "CAPES",
  "CNPQ",
  "FAPESP",
  "FAPERJ",
  "FAPEMIG",
  "FAPERGS",
  "FAPESC",
  "FACEPE",
  "FAPESPA",
  "FAPEAM",
  "FAPDF",
  "FUNCAP",
  "FAPEG",
  "FAPEMAT",
  "FAPEAL",
  "FAPESQ",
  "FAPITEC",
  "FAPEPI",
  "FAPEMA",
  "FAPERO",
  "FAPEAP",
  "FINEP",
  "FUNAI",
  "INCRA",
  "INSS",
  "INMETRO",
  "EMBRAPA",
  "FIOCRUZ",
  "BACEN",
  "CVM",
  "SUSEP",
  "ANP",
  "ANEEL",
  "ANTAQ",
  "ANTT",
  "ANA",
  "ANS",
  "DNIT",
  "IBICT",
  "CNEN",
  "CONAB",
  "SUDENE",
  "SUDECO",
  "SUDAM",
  "ICMBIO",
  "INPI",
  "IPEN",
  "ENAP",
  "CONAMA",
  "CONANDA",
  "INPA",
  "MPEG",
  "LNCC",
  "LNLS",
  "CNPEM",
  "ESALQ",
  "COPPE",

  // Saude Publica
  "SUS",
  "DATASUS",
  "OPAS",
  "ANVS",
  "INCA",
  "BUTANTAN",
  "HEMORIO",
  "FUNASA",
  "ENSP",
  "HCPA",

  // Seguranca e Transito
  "DETRAN",
  "DENATRAN",
  "PROCON",
  "IML",
  "PCSP",
  "PMERJ",
  "PMSP",

  // Ministerios (siglas)
  "MEC",
  "MCT",
  "MCTI",
  "MS",
  "MF",
  "MJ",
  "MRE",
  "MD",
  "ME",
  "MMA",
  "MAPA",
  "MDS",
  "MTB",
  "MDIC",
  "MTUR",
  "MINC",
  "MCI",

  // Poder Judiciario e Orgaos de Controle
  "STF",
  "STJ",
  "TSE",
  "TST",
  "TRF",
  "TRT",
  "TRE",
  "TJ",
  "TJSP",
  "TJRJ",
  "TCU",
  "CGU",
  "MPF",
  "MPE",
  "DPU",
  "AGU",
  "PF",
  "PRF",
  "PGE",
  "PGM",
  "TCE",
  "TCM",

  // Universidades Federais
  "UFRJ",
  "UFMG",
  "UFRGS",
  "UFPR",
  "UFSC",
  "UFBA",
  "UFPE",
  "UFC",
  "UFPA",
  "UFSCAR",
  "UNIFESP",
  "UFF",
  "UFES",
  "UFGO",
  "UFMT",
  "UFMS",
  "UFAL",
  "UFRN",
  "UFPB",
  "UFPI",
  "UFMA",
  "UFAM",
  "UFAC",
  "UFRR",
  "UFAP",
  "UFRO",
  "UFTO",
  "UFSM",
  "UFPEL",
  "FURG",
  "UTFPR",
  "UNIRIO",
  "UFABC",
  "UNIFAL",
  "UNIFEI",
  "UFJF",
  "UFLA",
  "UFOP",
  "UFTM",
  "UFU",
  "UFV",
  "UFVJM",
  "UFRPE",
  "UFERSA",
  "UFCG",
  "UFCA",
  "UFOPA",
  "UFRB",
  "UFGD",
  "UFFS",
  "UNIFAP",
  "UFCSPA",
  "UNIVASF",
  "UNILA",
  "UNILAB",
  "UNIFESSPA",
  "UFOB",
  "UFSB",
  "UFCAT",
  "UFAPE",
  "UFNT",
  "UFDPAR",

  // Institutos Federais (Rede Federal de Educacao Profissional)
  "IFSP",
  "IFRJ",
  "IFRS",
  "IFMG",
  "IFPB",
  "IFCE",
  "IFBA",
  "IFPE",
  "IFPI",
  "IFMA",
  "IFAM",
  "IFPA",
  "IFTO",
  "IFES",
  "IFMT",
  "IFMS",
  "IFRO",
  "IFAL",
  "IFSC",
  "IFPR",
  "IFSUL",
  "CEFET",
  "ITA",
  "IME",

  // Universidades Estaduais
  "USP",
  "UNICAMP",
  "UNESP",
  "UERJ",
  "UENF",
  "UEL",
  "UEM",
  "UEPG",
  "UNIOESTE",
  "UDESC",
  "UESC",
  "UNEB",
  "UEFS",
  "UESB",
  "UPE",
  "UECE",
  "UVA",
  "URCA",
  "UNEMAT",
  "UNIMONTES",
  "UEPB",
  "UERN",
  "UESPI",
  "UNICENTRO",
  "UEMA",
  "UEPA",
  "UNITINS",
  "UEMG",
  "UNESPAR",
  "UENP",
  "UERGS",

  // Universidades Privadas e Confessionais (principais)
  "PUC",
  "PUCRS",
  "PUCPR",
  "PUCSP",
  "PUCRJ",
  "PUCMG",
  "PUCGO",
  "PUCCAMP",
  "FGV",
  "FGVSP",
  "FGVRJ",
  "INSPER",
  "IBMEC",
  "ESPM",
  "FAAP",
  "MACKENZIE",
  "UNIP",
  "UNINOVE",
  "ANHANGUERA",
  "ESTACIO",
  "UNISINOS",
  "UNIVALI",
  "UNIVATES",
  "FEEVALE",
  "UCPEL",
  "UNICEUB",
  "UNIFOR",
  "UNIFACS",
  "UNIMEP",
  "UMESP",
  "UCDB",
  "UNISANTA",
  "UNIFRAN",
  "UNOESTE",
  "UNIARARAS",

  // Sistema S e Educacao Profissional
  "SENAC",
  "SENAI",
  "SEBRAE",
  "SESC",
  "SESI",
  "SENAR",
  "SENAT",
  "SEST",

  // Organizacoes Internacionais
  "ONU",
  "UNESCO",
  "UNICEF",
  "OMS",
  "OIT",
  "OMC",
  "FMI",
  "BIRD",
  "OEA",
  "OCDE",
  "WHO",
  "UN",
  "IMF",
  "OECD",
  "WTO",
  "NATO",
  "EU",
  "MERCOSUL",
  "BRICS",
  "FAO",
  "PNUD",
  "CEPAL",
  "BID",
  "CAF",
  "OTAN",
  "UNHCR",
  "UNCTAD",
  "WIPO",
  "IAEA",
  "ACNUR",
  "OMPI",
  "AIEA",

  // Common international 4-char acronyms (must be explicit since heuristic only covers 2-3 chars)
  "NASA",
  "FIFA",
  "FIBA",
  "FINA",
  "IATA",
  "ICAO",
  "OPEP",
  "OPEC",
  "FEMA",
  "DARPA",
  "CERN",
  "ITER",
  "ALMA",
  "USDA",
  "CNRS",
  "CSIC",
  "JAXA",
  "NOAA",
  "USGS",
  "PAHO",
  "UNODC",

  // Organizacoes de Normas e Padroes
  "ABNT",
  "ISO",
  "IEEE",
  "ANSI",
  "DIN",
  "BSI",
  "ASTM",
  "IEC",
  "ITU",
  "W3C",
  "IETF",
  "NIST",
  "NBR",

  // Associacoes, Sociedades e Conselhos Profissionais
  "OAB",
  "CRM",
  "CREA",
  "CRO",
  "CRC",
  "CRP",
  "CFESS",
  "COFEN",
  "CFM",
  "ABA",
  // "ABE" removed in 1.4.0: it is also a very common Japanese surname and is
  // listed in SHORT_SURNAMES, so it was shadowing person names ("ABE" stayed
  // uppercase instead of becoming "Abe"). Surname wins — the association is
  // usually cited by its full name anyway.
  "ABEP",
  "ANPEC",
  "ANPOCS",
  "ANPED",
  "SBPC",
  "ABC",
  "SBF",
  "SBM",
  "IMPA",
  "CBPF",
  "ICTP",
  "CONFEA",
  "COFFITO",
  "ANPAD",
  "FIESP",

  // Empresas Estatais e Mistas
  "PETROBRAS",
  "ELETROBRAS",
  "CORREIOS",
  "BB",
  "CEF",
  "BNDESPAR",
] as const;

export const PROTECTED_ACRONYMS = new Set<string>(DEFAULT_ACRONYMS);

/**
 * Common short surnames (2-4 characters) that should NOT be treated as acronyms.
 * These are excluded from heuristic acronym detection.
 */
export const SHORT_SURNAMES = new Set([
  // Asian surnames (very common in academic literature)
  "LEE",
  "LI",
  "WU",
  "XU",
  "HU",
  "LU",
  "YU",
  "MA",
  "HE",
  "LIN",
  "SUN",
  "LIU",
  "GAO",
  "ZHU",
  "CHO",
  "KIM",
  "PAK",
  "HAN",
  "YAN",
  "WEI",
  "TAO",
  "PAN",
  "YAO",
  "ZOU",
  "TAN",
  "JIN",
  "YE",
  "BAI",
  "CAO",
  "QIU",
  "SHI",
  // Additional Chinese surnames
  "CHEN",
  "WANG",
  "ZHAO",
  "ZHOU",
  "YANG",
  "WONG",
  "XIAO",
  "DENG",
  "FENG",
  "SONG",
  "TANG",
  "DONG",
  "DING",
  "GONG",
  "KONG",
  "LANG",
  "LONG",
  "MENG",
  "NING",
  "PENG",
  "QIAN",
  "RONG",
  "SHEN",
  "SHAO",
  "TONG",
  "YUAN",
  "ZENG",
  // Korean surnames
  "AHN",
  "RYU",
  "SEO",
  "YOO",
  "JUN",
  "YUN",
  "CHA",
  "BAE",
  "SON",
  "SHIN",
  "KWON",
  "KWAK",
  "HONG",
  "HWANG",
  "JANG",
  "JUNG",
  "KANG",
  "MOON",
  "PARK",
  // Japanese surnames
  "ABE",
  "ITO",
  "OKA",
  "UNO",
  "MORI",
  "HARA",
  "KATO",
  "SATO",
  "NODA",
  // Western short surnames
  "RAY",
  "ROY",
  "DAY",
  "MAY",
  "LAW",
  "LOW",
  "FOX",
  "COX",
  "RAO",
  "DAS",
  "SEN",
  "ROE",
  "POE",
  "LEA",
  "FAY",
  "JAY",
  "KAY",
  "HAY",
  "BAY",
  // Common English/American 4-letter surnames
  "BUSH",
  "FORD",
  "GORE",
  "KING",
  "NASH",
  "POPE",
  "RICE",
  "ROSS",
  "RYAN",
  "WADE",
  "WEBB",
  "WEST",
  "WOOD",
  "YORK",
  "ADAM",
  "BALL",
  "BECK",
  "BELL",
  "BOND",
  "BOYD",
  "CARR",
  "COOK",
  "COLE",
  "DEAN",
  "DUKE",
  "DUNN",
  "FINN",
  "FORD",
  "GRAY",
  "HALL",
  "HART",
  "HILL",
  "HOOD",
  "HUNT",
  "JACK",
  "JOHN",
  "KANE",
  "KENT",
  "KERR",
  "KIRK",
  "LANE",
  "LONG",
  "MANN",
  "MONK",
  "MOSS",
  "NEAL",
  "NERO",
  "OTTO",
  "PAGE",
  "PENN",
  "POND",
  "REID",
  "ROTH",
  "RUSH",
  "SHAW",
  "TODD",
  "TRAN",
  "WARD",
  "WISE",
  "WOLF",
  "WREN",
  "BACH",
  // Portuguese/Spanish
  "PAZ",
  "GIL",
  "RUI",
  "REI",
  "ZATZ",
  "KATZ",
  "MATZ",
  "RATZ",
  "RUIZ",
  // German/European short surnames
  "BENZ",
  "KUHN",
  "METZ",
  "ROTH",
  "VOGT",
  "WULF",
  "MARX",
  "KANT",
  // Brazilian/Latin short surnames (very common, often mistaken for acronyms)
  // Source: IBGE Census 2022 - most common surnames
  "LIMA",
  "DIAS",
  "ROSA",
  "MELO",
  "REIS",
  "CRUZ",
  "VALE",
  "LEAL",
  "LAGO",
  "BRAZ",
  "BELO",
  "MAIA",
  "PENA",
  "ASSIS",
  "LIRA",
  "BRITO",
  "VIANA",
  "MOTA",
  "SENA",
  "LEME",
  "NERY",
  "GOES",
  "MAYA",
  "TOSI",
  "CANO",
  "VEGA",
  "MORO",
  "RUAS",
  "HORA",
  "MURA",
  "NETO",
  "LINO",
  "DINO",
  "GAMA",
]);

/**
 * Add a custom acronym to the protected list.
 * Useful for domain-specific acronyms not in the default list.
 *
 * @param acronym - The acronym to add (will be uppercased)
 *
 * @example
 * addProtectedAcronym('ACME'); // Now ACME will stay uppercase
 */
export function addProtectedAcronym(acronym: string): void {
  PROTECTED_ACRONYMS.add(acronym.toUpperCase().trim());
}

/**
 * Add multiple custom acronyms to the protected list.
 *
 * @param acronyms - Array of acronyms to add
 *
 * @example
 * addProtectedAcronyms(['ACME', 'CORP', 'INC']);
 */
export function addProtectedAcronyms(acronyms: string[]): void {
  for (const acronym of acronyms) {
    addProtectedAcronym(acronym);
  }
}

/**
 * Remove an acronym from the protected list.
 * Useful for customizing the list for specific use cases.
 *
 * @param acronym - The acronym to remove
 * @returns true if the acronym was removed, false if it wasn't in the list
 *
 * @example
 * removeProtectedAcronym('ACME'); // true if was in list
 */
export function removeProtectedAcronym(acronym: string): boolean {
  return PROTECTED_ACRONYMS.delete(acronym.toUpperCase().trim());
}

/**
 * Reset the protected acronyms list to its default state.
 * Removes all custom acronyms and restores the original list.
 *
 * Useful for testing or when you need to start fresh.
 *
 * @example
 * addProtectedAcronym('CUSTOM');
 * resetProtectedAcronyms(); // CUSTOM is now removed
 */
export function resetProtectedAcronyms(): void {
  PROTECTED_ACRONYMS.clear();
  for (const acronym of DEFAULT_ACRONYMS) {
    PROTECTED_ACRONYMS.add(acronym);
  }
}

/**
 * Checks if a string looks like an acronym based on pattern:
 * - All uppercase letters
 * - 2-3 characters (4+ char strings are too ambiguous — could be surnames like MORA, LAGE)
 * - No lowercase letters
 * - May contain numbers (e.g., G20, G7)
 * - Not a known short surname (LEE, WU, LI, etc.)
 *
 * Note: 4+ char acronyms (IBGE, NASA, FIFA) must be in the PROTECTED_ACRONYMS
 * list explicitly. The heuristic only catches 2-3 char unknown acronyms to
 * avoid false positives with 4-letter surnames (MORA, LAGE, VALE, etc.).
 */
function looksLikeAcronym(text: string): boolean {
  const trimmed = text.trim();

  // Heuristic only for 2-3 characters
  // 4+ char all-caps strings are too ambiguous (MORA vs IBGE)
  // 4+ char acronyms should be in the PROTECTED_ACRONYMS list
  if (trimmed.length < 2 || trimmed.length > 3) return false;

  // Must have at least one letter
  if (!/[A-Z]/.test(trimmed)) return false;

  // All characters must be uppercase letters or numbers
  // This ensures "Silva" or "silva" don't match
  if (!/^[A-Z0-9]+$/.test(trimmed)) return false;

  // Exclude known short surnames (LEE, WU, LI, etc.)
  if (SHORT_SURNAMES.has(trimmed)) return false;

  return true;
}

/**
 * Checks if an author name is a protected acronym that should stay uppercase.
 *
 * Uses two strategies:
 * 1. Exact match against known acronyms list
 * 2. Heuristic detection for unknown acronyms (all caps, 2-3 chars, not a short surname)
 *
 * @param author - Author name to check (e.g., "IBGE", "SILVA", "UNESCO")
 * @returns true if the name should remain uppercase
 *
 * @example
 * isProtectedAcronym("IBGE")    // true (in list)
 * isProtectedAcronym("ibge")    // true (normalized)
 * isProtectedAcronym("SILVA")   // false (person name)
 * isProtectedAcronym("UNESCO")  // true (in list)
 * isProtectedAcronym("ABC")     // true (in list - Academia Brasileira de Ciencias)
 * isProtectedAcronym("LEE")     // false (known short surname)
 */
export function isProtectedAcronym(author: string): boolean {
  const normalized = author.toUpperCase().trim();

  // Check against known list first
  if (PROTECTED_ACRONYMS.has(normalized)) {
    return true;
  }

  // Heuristic: if it looks like an acronym and the input was already all caps,
  // it's probably an institutional author we don't have in our list
  if (looksLikeAcronym(author.trim())) {
    return true;
  }

  return false;
}
