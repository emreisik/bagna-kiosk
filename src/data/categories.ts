export interface CategoryStructure {
  id: string;
  subcategories?: string[];
}

export const categoryStructure: CategoryStructure[] = [
  {
    id: 'ustgiyim',
    subcategories: ['bluz', 'gomlek', 'ceket'],
  },
  {
    id: 'altgiyim',
    subcategories: ['etek', 'pantolon'],
  },
  {
    id: 'elbise',
  },
  {
    id: 'takim',
  },
  {
    id: 'disgiyim',
  },
];
