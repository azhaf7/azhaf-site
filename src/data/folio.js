// About and Hobbies live on the page as prose sections, not as books.
export const folio = [
  {
    id: 'about',
    title: 'About',
    copy: [
      'I learn by building: most of what I know comes from making things, breaking them and fixing them.',
      'I work across the stack, on web apps, mobile apps and the APIs behind them. When something breaks, I stay with it until I understand why.',
    ],
    facts: [
      {
        label: 'Education',
        value: 'BA Software Development',
        detail: 'Högskolan Kristianstad · 2024–2027',
      },
      { label: 'Based in', value: 'Copenhagen, Denmark', detail: 'Central European Time' },
      { label: 'Status', value: 'Open to work', detail: 'Available for projects' },
    ],
    lists: [
      { heading: 'Languages', items: ['Java', 'Python', 'C#', 'JavaScript', 'SQL'] },
      { heading: 'Web & mobile', items: ['React', 'React Native', 'Node.js', 'Express', 'Blazor'] },
      { heading: 'Data', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Supabase', 'Firebase'] },
      { heading: 'Tools & practice', items: ['Git', 'REST', 'JWT', 'Stripe', 'Agile / Scrum'] },
    ],
  },
]

export const hobbies = {
  id: 'hobbies',
  title: 'Hobbies',
  copy: 'Away from the keyboard.',
  items: [
    { name: 'Photography', note: 'Behind the camera', mark: 'aperture' },
    { name: 'Sketching', note: 'Pen on paper', mark: 'pencil' },
    { name: 'Paddle tennis', note: 'On the court', mark: 'racket' },
    { name: 'Movies & TV', note: 'Lost in a good story', mark: 'film' },
  ],
}
