/**
 * @lahim/loinc - LOINC Code Lookup and Search
 * 
 * Provides search and lookup functionality for LOINC codes
 * used in the LaHIM LIMS application.
 */

export interface LOINCCode {
  coding: string
  text: string
}

// Lazy load LOINC codes (file is very large - 369k+ entries)
let loincCodesCache: LOINCCode[] | null = null

function getLOINCCodes(): LOINCCode[] {
  if (!loincCodesCache) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loincCodesCache = require('./data/loinc.json') as LOINCCode[]
  }
  return loincCodesCache
}

/**
 * Search LOINC codes by code or text
 * @param query - Search query (searches in both coding and text fields)
 * @param limit - Maximum number of results to return (default: 50)
 * @returns Array of matching LOINC codes
 */
export function searchLOINC(query: string, limit: number = 50): LOINCCode[] {
  if (!query || query.trim().length === 0) {
    return []
  }

  const loinc = getLOINCCodes()
  const lowerQuery = query.toLowerCase().trim()
  
  return loinc
    .filter((item) => 
      item.coding?.toLowerCase().includes(lowerQuery) ||
      item.text?.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit)
}

/**
 * Get a specific LOINC code by its coding value
 * @param coding - The LOINC code (e.g., "2339-0")
 * @returns The LOINC code object or undefined if not found
 */
export function getLOINCByCode(coding: string): LOINCCode | undefined {
  if (!coding || coding.trim().length === 0) {
    return undefined
  }

  const loinc = getLOINCCodes()
  return loinc.find((item) => item.coding === coding.trim())
}

/**
 * Get LOINC code count
 * @returns Total number of LOINC codes available
 */
export function getLOINCCount(): number {
  return getLOINCCodes().length
}

