export const GLYPH_CATEGORIES = {
  HINT: 'Hint',
  WARNING: 'Warning', 
  SECRET: 'Secret',
  PRAISE: 'Praise',
  LORE: 'Lore'
};

export const CATEGORY_ICONS = {
  [GLYPH_CATEGORIES.HINT]: '💡',
  [GLYPH_CATEGORIES.WARNING]: '⚠️',
  [GLYPH_CATEGORIES.SECRET]: '💰',
  [GLYPH_CATEGORIES.PRAISE]: '❤️',
  [GLYPH_CATEGORIES.LORE]: '👁️'
};

export const CATEGORY_OPTIONS = [
  {
    value: GLYPH_CATEGORIES.HINT,
    label: `${CATEGORY_ICONS[GLYPH_CATEGORIES.HINT]} ${GLYPH_CATEGORIES.HINT} - Helpful tip`,
    icon: CATEGORY_ICONS[GLYPH_CATEGORIES.HINT]
  },
  {
    value: GLYPH_CATEGORIES.WARNING,
    label: `${CATEGORY_ICONS[GLYPH_CATEGORIES.WARNING]} ${GLYPH_CATEGORIES.WARNING} - Important alert`,
    icon: CATEGORY_ICONS[GLYPH_CATEGORIES.WARNING]
  },
  {
    value: GLYPH_CATEGORIES.SECRET,
    label: `${CATEGORY_ICONS[GLYPH_CATEGORIES.SECRET]} ${GLYPH_CATEGORIES.SECRET} - Hidden gem`,
    icon: CATEGORY_ICONS[GLYPH_CATEGORIES.SECRET]
  },
  {
    value: GLYPH_CATEGORIES.PRAISE,
    label: `${CATEGORY_ICONS[GLYPH_CATEGORIES.PRAISE]} ${GLYPH_CATEGORIES.PRAISE} - Love this place`,
    icon: CATEGORY_ICONS[GLYPH_CATEGORIES.PRAISE]
  },
  {
    value: GLYPH_CATEGORIES.LORE,
    label: `${CATEGORY_ICONS[GLYPH_CATEGORIES.LORE]} ${GLYPH_CATEGORIES.LORE} - History & stories`,
    icon: CATEGORY_ICONS[GLYPH_CATEGORIES.LORE]
  }
];

// Helper function to get icon for a category
export const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || '📍';
};

// Helper function to get all category values
export const getAllCategoryValues = () => {
  return Object.values(GLYPH_CATEGORIES);
};