import type { BookConfigurationBundle } from '@core/book/configuration'
import { TEXT_ROLES } from '@core/book/model'

export const createMockBookConfigurationBundle =
  (): BookConfigurationBundle => ({
    catalogVersion: 'mock-catalog-v0',
    productSpecs: [
      {
        id: 'mock-standard-hardcover-200x200-v0',
        productId: 'mock-standard-hardcover',
        productType: 'photo_book',
        productionStatus: 'mock',
        coverSizeMm: { width: 200, height: 200 },
        spreadSizeMm: { width: 400, height: 200 },
        spreadCount: { min: 1, max: 3, default: 1 },
        optionSpecs: [
          {
            id: 'mock-cover-material',
            valueIds: ['mock-cover-material-sand', 'mock-cover-material-linen'],
          },
        ],
        allowedLayoutIds: [
          'mock-cover-layout-centered-photo-title-v0',
          'mock-spread-layout-full-bleed-v0',
          'mock-spread-layout-photo-caption-v0',
        ],
        allowedThemeIds: ['mock-warm-editorial-v0'],
        allowedTemplateIds: ['mock-warm-family-story-v0'],
        allowedTextRoles: TEXT_ROLES,
        allowedTextSizeTokens: ['caption', 'body', 'title'],
      },
    ],
    layoutSpecs: [
      {
        id: 'mock-cover-layout-centered-photo-title-v0',
        productionStatus: 'mock',
        surface: 'cover',
        supportedProductSpecIds: ['mock-standard-hardcover-200x200-v0'],
        sizeMm: { width: 200, height: 200 },
        photoSlots: [
          {
            slotKey: 'cover-photo',
            frameMm: { x: 10, y: 10, width: 180, height: 140 },
            required: true,
            defaultCrop: { x: 0, y: 0, width: 1, height: 1 },
            defaultFocalPoint: { x: 0.5, y: 0.5 },
          },
        ],
        textSlots: [
          {
            slotKey: 'cover-title',
            frameMm: { x: 20, y: 160, width: 160, height: 20 },
            required: true,
            allowedRoles: ['title'],
            defaultTextStyleId: 'mock-title-style-v0',
            maxCharacters: 48,
          },
        ],
      },
      {
        id: 'mock-spread-layout-full-bleed-v0',
        productionStatus: 'mock',
        surface: 'spread',
        supportedProductSpecIds: ['mock-standard-hardcover-200x200-v0'],
        sizeMm: { width: 400, height: 200 },
        photoSlots: [
          {
            slotKey: 'hero-photo',
            frameMm: { x: 0, y: 0, width: 400, height: 200 },
            required: true,
            defaultCrop: { x: 0, y: 0, width: 1, height: 1 },
            defaultFocalPoint: { x: 0.5, y: 0.5 },
          },
        ],
        textSlots: [],
      },
      {
        id: 'mock-spread-layout-photo-caption-v0',
        productionStatus: 'mock',
        surface: 'spread',
        supportedProductSpecIds: ['mock-standard-hardcover-200x200-v0'],
        sizeMm: { width: 400, height: 200 },
        photoSlots: [
          {
            slotKey: 'main-photo',
            frameMm: { x: 10, y: 10, width: 260, height: 180 },
            required: true,
            defaultCrop: { x: 0, y: 0, width: 1, height: 1 },
            defaultFocalPoint: { x: 0.5, y: 0.5 },
          },
        ],
        textSlots: [
          {
            slotKey: 'caption',
            frameMm: { x: 285, y: 40, width: 95, height: 100 },
            required: false,
            allowedRoles: ['caption', 'body'],
            defaultTextStyleId: 'mock-caption-style-v0',
            maxCharacters: 160,
          },
          {
            slotKey: 'date',
            frameMm: { x: 285, y: 150, width: 95, height: 20 },
            required: false,
            allowedRoles: ['subtitle'],
            defaultTextStyleId: 'mock-date-style-v0',
            maxCharacters: 32,
          },
        ],
      },
    ],
    themeSpecs: [
      {
        id: 'mock-warm-editorial-v0',
        productionStatus: 'mock',
        supportedProductSpecIds: ['mock-standard-hardcover-200x200-v0'],
        colors: {
          background: '#F6F0E8',
          foreground: '#2D2926',
          accent: '#9B5F42',
        },
        textStyles: [
          {
            id: 'mock-title-style-v0',
            role: 'title',
            sizeToken: 'title',
            fontFamilyId: 'mock-editorial-serif',
            fontWeight: 500,
            fontSizePt: 24,
            lineHeight: 1.2,
            textAlign: 'center',
            colorToken: 'foreground',
          },
          {
            id: 'mock-body-style-v0',
            role: 'body',
            sizeToken: 'body',
            fontFamilyId: 'mock-interface-sans',
            fontWeight: 400,
            fontSizePt: 14,
            lineHeight: 1.4,
            textAlign: 'left',
            colorToken: 'foreground',
          },
          {
            id: 'mock-caption-style-v0',
            role: 'caption',
            sizeToken: 'caption',
            fontFamilyId: 'mock-interface-sans',
            fontWeight: 400,
            fontSizePt: 10,
            lineHeight: 1.4,
            textAlign: 'left',
            colorToken: 'foreground',
          },
          {
            id: 'mock-date-style-v0',
            role: 'subtitle',
            sizeToken: 'caption',
            fontFamilyId: 'mock-interface-sans',
            fontWeight: 500,
            fontSizePt: 10,
            lineHeight: 1.2,
            textAlign: 'left',
            colorToken: 'accent',
          },
        ],
      },
    ],
    templateSpecs: [
      {
        id: 'mock-warm-family-story-v0',
        productionStatus: 'mock',
        supportedProductSpecIds: ['mock-standard-hardcover-200x200-v0'],
        themeId: 'mock-warm-editorial-v0',
        categoryTags: ['family', 'travel', 'gift'],
        coverLayoutId: 'mock-cover-layout-centered-photo-title-v0',
        initialSpreadLayoutIds: ['mock-spread-layout-full-bleed-v0'],
      },
    ],
  })
