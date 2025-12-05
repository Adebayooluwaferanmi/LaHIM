"use strict";
/**
 * @lahim/loinc - LOINC Code Lookup and Search
 *
 * Provides search and lookup functionality for LOINC codes
 * used in the LaHIM LIMS application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLOINCCount = exports.getLOINCByCode = exports.searchLOINC = void 0;
// Lazy load LOINC codes (file is very large - 369k+ entries)
let loincCodesCache = null;
function getLOINCCodes() {
    if (!loincCodesCache) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        loincCodesCache = require('./data/loinc.json');
    }
    return loincCodesCache;
}
/**
 * Search LOINC codes by code or text
 * @param query - Search query (searches in both coding and text fields)
 * @param limit - Maximum number of results to return (default: 50)
 * @returns Array of matching LOINC codes
 */
function searchLOINC(query, limit = 50) {
    if (!query || query.trim().length === 0) {
        return [];
    }
    const loinc = getLOINCCodes();
    const lowerQuery = query.toLowerCase().trim();
    return loinc
        .filter((item) => item.coding?.toLowerCase().includes(lowerQuery) ||
        item.text?.toLowerCase().includes(lowerQuery))
        .slice(0, limit);
}
exports.searchLOINC = searchLOINC;
/**
 * Get a specific LOINC code by its coding value
 * @param coding - The LOINC code (e.g., "2339-0")
 * @returns The LOINC code object or undefined if not found
 */
function getLOINCByCode(coding) {
    if (!coding || coding.trim().length === 0) {
        return undefined;
    }
    const loinc = getLOINCCodes();
    return loinc.find((item) => item.coding === coding.trim());
}
exports.getLOINCByCode = getLOINCByCode;
/**
 * Get LOINC code count
 * @returns Total number of LOINC codes available
 */
function getLOINCCount() {
    return getLOINCCodes().length;
}
exports.getLOINCCount = getLOINCCount;
