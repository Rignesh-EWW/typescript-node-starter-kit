export interface MediaConversion {
  name: string;
  width?: number;
  height?: number;
}

export interface MediaCollectionOptions {
  singleFile?: boolean;
  maxFiles?: number;
  acceptsMimeTypes?: string[];
  acceptsExtensions?: string[];
  fallbackUrl?: string;
  conversions?: MediaConversion[];
}

export const mediaCollections: Record<string, MediaCollectionOptions> = {
  avatar: {
    singleFile: true,
    conversions: [{ name: 'thumb', width: 200, height: 200 }],
    acceptsMimeTypes: ['image/png', 'image/jpeg'],
    fallbackUrl: '/images/default-avatar.png',
  },
  gallery: {
    maxFiles: 10,
  },
  documents: {},
};
