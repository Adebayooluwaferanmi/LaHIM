/**
 * @lahim/loinc - LOINC Code Lookup and Search
 *
 * Provides search and lookup functionality for LOINC codes
 * used in the LaHIM LIMS application.
 */
export interface LOINCCode {
    coding: string;
    text: string;
}
/**
 * Search LOINC codes by code or text
 * @param query - Search query (searches in both coding and text fields)
 * @param limit - Maximum number of results to return (default: 50)
 * @returns Array of matching LOINC codes
 */
export declare function searchLOINC(query: string, limit?: number): LOINCCode[];
/**
 * Get a specific LOINC code by its coding value
 * @param coding - The LOINC code (e.g., "2339-0")
 * @returns The LOINC code object or undefined if not found
 */
export declare function getLOINCByCode(coding: string): LOINCCode | undefined;
/**
 * Get LOINC code count
 * @returns Total number of LOINC codes available
 */
export declare function getLOINCCount(): number;
