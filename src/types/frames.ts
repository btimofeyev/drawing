export interface FrameTemplate {
  id: string
  name: string
  category: 'classic' | 'fun' | 'themed' | 'seasonal'
  cssClass: string
  preview: string
  description: string
}

export const frameTemplates: FrameTemplate[] = [
  // Classic Frames
  {
    id: 'gold-ornate',
    name: 'Golden Gallery',
    category: 'classic',
    cssClass: 'frame-gold-ornate',
    preview: '🖼️',
    description: 'Elegant gold frame for museum-quality artwork'
  },
  {
    id: 'silver-modern',
    name: 'Silver Modern',
    category: 'classic',
    cssClass: 'frame-silver-modern',
    preview: '⚪',
    description: 'Sleek silver frame for contemporary art'
  },
  {
    id: 'wood-rustic',
    name: 'Rustic Wood',
    category: 'classic',
    cssClass: 'frame-wood-rustic',
    preview: '🪵',
    description: 'Natural wood frame with rustic charm'
  },
  {
    id: 'museum-white',
    name: 'Museum White',
    category: 'classic',
    cssClass: 'frame-museum-white',
    preview: '⬜',
    description: 'Clean white frame like in art galleries'
  },
  {
    id: 'bronze-vintage',
    name: 'Bronze Vintage',
    category: 'classic',
    cssClass: 'frame-bronze-vintage',
    preview: '🥉',
    description: 'Antique bronze frame with vintage patina'
  },
  {
    id: 'black-elegant',
    name: 'Midnight Black',
    category: 'classic',
    cssClass: 'frame-black-elegant',
    preview: '⬛',
    description: 'Sophisticated black frame for dramatic effect'
  },

  // Fun Frames
  {
    id: 'rainbow-gradient',
    name: 'Rainbow Magic',
    category: 'fun',
    cssClass: 'frame-rainbow-gradient',
    preview: '🌈',
    description: 'Colorful rainbow gradient frame'
  },
  {
    id: 'crayon-texture',
    name: 'Crayon Box',
    category: 'fun',
    cssClass: 'frame-crayon-texture',
    preview: '🖍️',
    description: 'Textured frame that looks like crayons'
  },
  {
    id: 'paint-splatter',
    name: 'Paint Splash',
    category: 'fun',
    cssClass: 'frame-paint-splatter',
    preview: '🎨',
    description: 'Artistic paint splatter border'
  },
  {
    id: 'glitter-sparkle',
    name: 'Sparkle Frame',
    category: 'fun',
    cssClass: 'frame-glitter-sparkle',
    preview: '✨',
    description: 'Glittery frame that sparkles'
  },
  {
    id: 'neon-glow',
    name: 'Neon Dreams',
    category: 'fun',
    cssClass: 'frame-neon-glow',
    preview: '💫',
    description: 'Electric neon frame with glowing edges'
  },
  {
    id: 'candy-stripes',
    name: 'Candy Stripes',
    category: 'fun',
    cssClass: 'frame-candy-stripes',
    preview: '🍭',
    description: 'Sweet candy-striped frame with bright colors'
  },

  // Themed Frames
  {
    id: 'space-stars',
    name: 'Cosmic Adventure',
    category: 'themed',
    cssClass: 'frame-space-stars',
    preview: '🌟',
    description: 'Space-themed frame with stars and planets'
  },
  {
    id: 'underwater-bubbles',
    name: 'Ocean Deep',
    category: 'themed',
    cssClass: 'frame-underwater-bubbles',
    preview: '🫧',
    description: 'Underwater theme with bubbles and waves'
  },
  {
    id: 'flower-garden',
    name: 'Flower Garden',
    category: 'themed',
    cssClass: 'frame-flower-garden',
    preview: '🌸',
    description: 'Beautiful floral border design'
  },
  {
    id: 'geometric-modern',
    name: 'Geometric Art',
    category: 'themed',
    cssClass: 'frame-geometric-modern',
    preview: '🔶',
    description: 'Modern geometric pattern frame'
  },
  {
    id: 'jungle-adventure',
    name: 'Jungle Explorer',
    category: 'themed',
    cssClass: 'frame-jungle-adventure',
    preview: '🌿',
    description: 'Wild jungle frame with tropical leaves'
  },
  {
    id: 'medieval-castle',
    name: 'Royal Castle',
    category: 'themed',
    cssClass: 'frame-medieval-castle',
    preview: '🏰',
    description: 'Majestic castle frame for royal artwork'
  },

  // Seasonal Frames
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    category: 'seasonal',
    cssClass: 'frame-autumn-leaves',
    preview: '🍂',
    description: 'Fall-themed frame with colorful leaves'
  },
  {
    id: 'winter-snowflakes',
    name: 'Winter Wonder',
    category: 'seasonal',
    cssClass: 'frame-winter-snowflakes',
    preview: '❄️',
    description: 'Winter frame with snowflakes'
  },
  {
    id: 'spring-flowers',
    name: 'Spring Bloom',
    category: 'seasonal',
    cssClass: 'frame-spring-flowers',
    preview: '🌺',
    description: 'Spring frame with blooming flowers'
  },
  {
    id: 'summer-sun',
    name: 'Summer Sunshine',
    category: 'seasonal',
    cssClass: 'frame-summer-sun',
    preview: '☀️',
    description: 'Bright summer frame with sun rays'
  },
  {
    id: 'halloween-spooky',
    name: 'Spooky Halloween',
    category: 'seasonal',
    cssClass: 'frame-halloween-spooky',
    preview: '🎃',
    description: 'Fun Halloween frame with pumpkins and bats'
  },
]

export const getFramesByCategory = (category: FrameTemplate['category']) => {
  return frameTemplates.filter(frame => frame.category === category)
}

export const getFrameById = (id: string) => {
  return frameTemplates.find(frame => frame.id === id)
}