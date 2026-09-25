export const books = [
  {
    slug: 'service-marketplace',
    title: 'Service Marketplace',
    spineTitle: 'Marketplace',
    subtitle: 'Customers, workers, and a map between them',
    author: 'Azhaf Khan',
    year: '2025',
    category: 'Project',
    number: '07',
    role: 'Solo project · Mobile app',
    tags: ['React Native', 'Expo', 'Supabase', 'PostgreSQL'],
    width: 196,
    height: 270,
    depth: 68,
    tilt: '73deg',
    cover: { bg: '#B54B1D', ink: '#F4EFE0', accent: '#F4EFE0', spine: '#933A18' },
    coverImage: '/covers/service-marketplace.webp',
    endpaper: '/endpapers/service-marketplace.webp',
    pageImage: '/pages/service-marketplace.webp',
    photos: [
      '/projects/service-marketplace/1.png',
      '/projects/service-marketplace/2.png',
      '/projects/service-marketplace/3.png',
      '/projects/service-marketplace/4.png',
      '/projects/service-marketplace/5.png',
      '/projects/service-marketplace/6.png',
      '/projects/service-marketplace/7.png',
      '/projects/service-marketplace/8.png',
    ],
    flower: 'tulip',
    blurb:
      'A mobile marketplace connecting customers with local service providers — plumbers, electricians, mechanics, cleaners, and more. Built with React Native and Expo so one codebase ships to iOS, Android, and web.',
    summary:
      'Solo project. A cross-platform mobile marketplace connecting customers with local service providers.',
    paragraphs: [
      'A mobile application connecting customers with local service providers — plumbers, electricians, mechanics, cleaners, and more. Built with React Native and Expo so one codebase ships to iOS, Android, and web.',
      'Customers post jobs with a map pin, browse nearby workers, message them in real time, negotiate a price, and leave ratings. Workers browse jobs by category, toggle availability, and track performance.',
    ],
    lists: [
      {
        heading: 'Stack',
        items: [
          'React Native and Expo',
          'React Navigation and Context API',
          'Supabase (PostgreSQL, auth, realtime)',
          'React Native Maps and Expo Location',
          'Expo Notifications and AsyncStorage',
        ],
      },
      {
        heading: 'What I built',
        items: [
          'User authentication and role-based navigation',
          'Job posting with GPS-based worker discovery',
          'Real-time messaging and price negotiation',
          'Normalized PostgreSQL schema: users, jobs, conversations, messages, ratings',
          'Light / dark theme and a centralized API layer',
        ],
      },
    ],
    links: [{ label: 'Demo', href: 'https://azhaf.com' }],
  },
  {
    slug: 'pineapple-planner',
    title: 'Pineapple Planner',
    spineTitle: 'Pineapple',
    subtitle: 'Tasks, teammates, and a little AI',
    author: 'Azhaf Khan',
    year: '2025',
    category: 'Project',
    number: '08',
    role: 'Team project · 5 people',
    tags: ['C#', 'Blazor', 'Firebase', 'Generative AI'],
    width: 172,
    height: 218,
    depth: 44,
    tilt: '77deg',
    cover: { bg: '#DA990B', ink: '#1A1A1A', accent: '#1A1A1A', spine: '#B87E08' },
    coverImage: '/covers/pineapple-planner.webp',
    endpaper: '/endpapers/pineapple-planner.webp',
    pageImage: '/pages/pineapple-planner.webp',
    flower: 'poppy',
    blurb:
      'A calendar and to-do app with realtime sync, workspace permissions, and Google Generative AI for task suggestions. Built in a five-person team with C#, Blazor, and Firebase.',
    summary:
      'Team project. A calendar and to-do app built with C#, Blazor, and Firebase, with AI-powered task suggestions.',
    paragraphs: [
      'A calendar and to-do list app that helps users manage tasks and events without losing the plot. Realtime synchronization across users, Google Generative AI for task suggestions, workspace permissions, and cloud-backed state on Firebase.',
      'Built in a five-person team, with collaboration managed through Git and Jira.',
    ],
    lists: [
      {
        heading: 'Stack',
        items: ['Blazor Server for realtime UI', 'C# .NET Core', 'Firebase Firestore', 'Google Generative AI API'],
      },
      {
        heading: 'Features',
        items: [
          'Realtime task and event synchronization',
          'AI-powered task suggestions',
          'Workspace management with permissions',
          'Cloud deployment on Firebase',
        ],
      },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/azhaf7/pineapple-planner' }],
  },
  {
    slug: 'hotel-aurora',
    title: 'Hotel Aurora',
    spineTitle: 'Aurora',
    subtitle: 'Rooms, reservations, and payments',
    author: 'Azhaf Khan',
    year: '2025',
    category: 'Project',
    number: '09',
    role: 'Team project · Full-stack web',
    tags: ['React', 'Node.js', 'Stripe', 'JWT', 'Supabase'],
    width: 208,
    height: 298,
    depth: 36,
    tilt: '75deg',
    cover: { bg: '#16243C', ink: '#E8E6E3', accent: '#E8E6E3', spine: '#0F1A2C' },
    coverImage: '/covers/hotel-aurora.webp',
    endpaper: '/endpapers/hotel-aurora.webp',
    pageImage: '/pages/hotel-aurora.webp',
    flower: 'lily',
    blurb:
      'A hotel booking platform with room listings, reservations, and Stripe payments. Guests book online; staff manage inventory from a protected admin dashboard.',
    summary:
      'Team project. A full-stack hotel booking platform with React, Node.js, Express, JWT, Stripe, and Supabase.',
    paragraphs: [
      'A hotel booking platform with room listings, reservations, and an admin dashboard for managing rooms and bookings. Guests browse availability and pay online; staff manage the inventory behind a protected dashboard.',
    ],
    lists: [
      {
        heading: 'Stack',
        items: ['React', 'Node.js and Express', 'Supabase', 'JWT authentication', 'Stripe payments'],
      },
      {
        heading: 'What I built',
        items: [
          'Room listings and reservation flow',
          'JWT authentication with role-based access',
          'Stripe payment processing',
          'Admin dashboard',
        ],
      },
    ],
    links: [{ label: 'Live demo', href: 'https://project-booking2-0.vercel.app' }],
  },
  {
    slug: 'internship-tracker',
    title: 'Internship Tracker',
    spineTitle: 'Tracker',
    subtitle: 'From wishlist to offer',
    author: 'Azhaf Khan',
    year: '2026',
    category: 'Project',
    number: '10',
    role: 'Solo project · Full-stack web',
    tags: ['React', 'Vite', 'Express', 'MongoDB'],
    width: 164,
    height: 248,
    depth: 52,
    tilt: '82deg',
    cover: { bg: '#1E5C90', ink: '#F4EFE0', accent: '#F4EFE0', spine: '#164A75' },
    coverImage: '/covers/internship-tracker.webp',
    endpaper: '/endpapers/internship-tracker.webp',
    pageImage: '/pages/internship-tracker.webp',
    flower: 'marigold',
    blurb:
      'Tracks internship and job applications from wishlist to offer. Kanban and table views share the same data, with search, stage filters, and pipeline statistics.',
    summary:
      'Solo project. A full-stack app for tracking internship and job applications with React, Vite, Express, and MongoDB.',
    paragraphs: [
      'Tracks every internship and job application from wishlist to offer. A Kanban board and a table view share the same data, with search, stage filters, and pipeline statistics so it’s always clear where things stand.',
    ],
    lists: [
      {
        heading: 'Stack',
        items: ['React and Vite', 'Express.js', 'MongoDB and Mongoose'],
      },
      {
        heading: 'Features',
        items: [
          'Kanban and table views',
          'Search, stage filters, and pipeline statistics',
          'Four-collection data model',
        ],
      },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/azhaf7/internship-tracker' }],
  },
  {
    slug: 'portfolio-website',
    title: 'Portfolio Website',
    spineTitle: 'Portfolio',
    subtitle: 'This site: a bookshelf you can open',
    author: 'Azhaf Khan',
    year: '2026',
    category: 'Project',
    number: '11',
    role: 'Solo project · Web app',
    tags: ['React', 'Vite', 'CSS 3D', 'TypeScript'],
    width: 186,
    height: 226,
    depth: 18,
    tilt: '76deg',
    cover: { bg: '#B7A6D4', ink: '#1A1A1A', accent: '#1A1A1A', spine: '#9A88B8' },
    coverImage: '/covers/portfolio-website.webp',
    endpaper: '/endpapers/portfolio-website.webp',
    pageImage: '/pages/portfolio-website.webp',
    flower: 'hibiscus',
    blurb: 
      'The portfolio you are reading: projects as 3D books on a shelf that open like hardcovers, a name you fly into, and olive and blush colour themes. Built with React and Vite, animated with CSS 3D transforms and hand-written motion code.',
    summary: 
      'Solo project. This portfolio: a React site where every project is a hardcover book you can pick up, open and page through.',
    paragraphs: [
      'Each project stands on a shelf as a 3D book. Click one and it lifts off the shelf, turns to face you and opens like a hardcover: the board has real thickness, swings open under its own weight and lands with a small bounce. Pages curl when you turn them, and the text reflows to fit any screen.',
      'The site opens on my name: scroll and the camera flies through one of the letters into the page. Books can be dragged to rearrange the shelf, projects can also be read as a plain list, and the whole site can be switched between olive and blush.',
    ],
    lists: [
      {
        heading: 'Stack',
        items: [
          'React and React Router',
          'Vite',
          'CSS 3D transforms and custom properties',
          'TypeScript (scroll-driven name portal)',
        ],
      },
      {
        heading: 'Features',
        items: [
          'Hardcover books that open, page-turn and close',
          'Drag-and-drop bookshelf that remembers its order',
          'Scroll-driven fly-through of my name',
          'Olive and blush themes, list view and contact form',
          'Responsive, keyboard accessible, respects reduced motion',
        ],
      },
    ],
    links: [{ label: 'Live site', href: 'https://azhaf.com' }],
  },
  {
    slug: 'pig-dice',
    title: 'Pig Dice Game',
    spineTitle: 'Pig Dice',
    subtitle: 'Turn-based luck and a little nerve',
    author: 'Azhaf Khan',
    year: '2024',
    category: 'Project',
    number: '12',
    role: 'Team project · Console game',
    tags: ['Python', 'OOP'],
    width: 154,
    height: 198,
    depth: 78,
    tilt: '84deg',
    cover: { bg: '#F2A3A0', ink: '#1A1A1A', accent: '#1A1A1A', spine: '#E08B88' },
    coverImage: '/covers/pig-dice.webp',
    endpaper: '/endpapers/pig-dice.webp',
    pageImage: '/pages/pig-dice.webp',
    flower: 'sunflower',
    blurb:
      'A classic Pig Dice game built as a Python team project. Hold or roll: a one wipes the turn, anything else adds up.',
    summary:
      'Python team project implementing the classic Pig Dice game with turn-based mechanics and multiplayer support.',
    paragraphs: [
      'A classic Pig Dice game built as a Python team project. Hold or roll: a one wipes the turn, anything else adds up. Implemented with object-oriented design, score management, input validation, and a console interface.',
    ],
    lists: [
      {
        heading: 'Stack',
        items: ['Python', 'OOP', 'Git for collaborative development'],
      },
      {
        heading: 'Features',
        items: [
          'Turn-based multiplayer',
          'Score tracking and edge-case handling',
          'Modular structure with separated concerns',
        ],
      },
    ],
    links: [],
  },
  {
    slug: 'forest-adventure',
    title: 'Forest Adventure',
    spineTitle: 'Forest',
    subtitle: 'A text game in a mysterious wood',
    author: 'Azhaf Khan',
    year: '2024',
    category: 'Project',
    number: '13',
    role: 'Solo project · Text adventure',
    tags: ['Python', 'State machine'],
    width: 200,
    height: 284,
    depth: 24,
    tilt: '71deg',
    cover: { bg: '#2A4F36', ink: '#F4EFE0', accent: '#F4EFE0', spine: '#1E3A28' },
    coverImage: '/covers/forest-adventure.webp',
    endpaper: '/endpapers/forest-adventure.webp',
    pageImage: '/pages/forest-adventure.webp',
    flower: 'cosmos',
    blurb:
      'A Python text adventure in a mysterious forest. Players explore locations, collect items, and make decisions that branch the story.',
    summary:
      'Python text adventure set in a mysterious forest. Decisions, locations, and an inventory that matters.',
    paragraphs: [
      'Players explore locations, collect items, and make decisions that branch the story. Built as a state machine with location-based events and a command interface.',
    ],
    lists: [
      {
        heading: 'Stack',
        items: ['Python', 'Object-oriented design', 'State machine for game flow'],
      },
      {
        heading: 'Features',
        items: [
          'Branching narrative paths',
          'Inventory and item collection',
          'Location-based exploration with dynamic events',
        ],
      },
    ],
    links: [],
  },
]

export function getShelfBays() {
  return [
    {
      id: 'projects',
      label: 'Projects',
      books,
    },
  ]
}

export function getBookBySlug(slug) {
  return books.find((book) => book.slug === slug)
}
