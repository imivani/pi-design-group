// One set of project types for the archive, menus and the About page.
// Archive ids stay as they are so existing ?category= links keep working.
export const archiveCategories = [
  { id: 'multifamily', label: 'Multifamily' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'single-homes', label: 'Residential' },
] as const;

// The About page's project record also covers work outside the archive.
export const experienceCategories = ['Multifamily', 'Commercial', 'Residential', 'Institutional', 'Other'] as const;
