/**
 * Format defect type names to human-readable format
 */
export function formatDefectType(defectType: string): string {
  // Common defect type mappings
  const defectTypeMap: Record<string, string> = {
    // Primary defects (Category 1)
    'full_black': 'Full Black',
    'full_sour': 'Full Sour',
    'dried_cherry': 'Dried Cherry',
    'fungus_damage': 'Fungus Damage',
    'foreign_matter': 'Foreign Matter',
    'severe_insect_damage': 'Severe Insect Damage',
    
    // Secondary defects (Category 2)
    'partial_black': 'Partial Black',
    'partial_sour': 'Partial Sour',
    'parchment': 'Parchment',
    'floater': 'Floater',
    'immature': 'Immature',
    'withered': 'Withered',
    'shell': 'Shell',
    'broken': 'Broken',
    'hull': 'Hull',
    'insect_damage': 'Insect Damage',
    'slight_insect_damage': 'Slight Insect Damage',
    'water_damage': 'Water Damage',
    'minor_fungus': 'Minor Fungus',
    'quaker': 'Quaker',
    'faded': 'Faded',
    'discolored': 'Discolored',
  };

  // If we have a mapping, use it
  if (defectTypeMap[defectType]) {
    return defectTypeMap[defectType];
  }

  // Otherwise, convert snake_case to Title Case
  return defectType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format number with specified decimal places
 */
export function formatNumber(value: number | undefined, decimals: number = 1): string {
  if (value === undefined || value === null) return 'N/A';
  return value.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | undefined, decimals: number = 1): string {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
}

/**
 * Format date and time to locale string
 */
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
}

/**
 * Format processing method enum to human-readable string
 */
export function formatProcessingMethod(method: string): string {
  const processingMethodMap: Record<string, string> = {
    'WASHED': 'Washed',
    'NATURAL': 'Natural',
    'HONEY': 'Honey',
    'SEMI_WASHED': 'Semi-Washed',
    'WET_HULLED': 'Wet Hulled',
    'ANAEROBIC': 'Anaerobic',
    'CARBONIC_MACERATION': 'Carbonic Maceration',
    'OTHER': 'Other',
  };

  return processingMethodMap[method] || method;
}
