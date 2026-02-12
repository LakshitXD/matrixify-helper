/** Mapping from file header (source) to canonical Matrixify column name */
export type ColumnMapping = Record<string, string>;

export type MappingProfile = {
  name: string;
  mapping: ColumnMapping;
  createdAt?: string;
};

export type MappingSuggestion = {
  fileHeader: string;
  canonicalName: string;
  score: number;
};

export type AutoMapResult = {
  mapping: ColumnMapping;
  suggestions: MappingSuggestion[];
  unmapped: string[];
};
