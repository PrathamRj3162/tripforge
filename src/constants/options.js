// `id` is what is sent to the server (see shared/limits.js). `title` is what people read.
export const TRAVELER_OPTIONS = [
  { id: 'solo', title: 'Just Me', desc: 'A sole traveler in exploration', icon: '✈️', people: '1' },
  { id: 'couple', title: 'A Couple', desc: 'Two travelers in tandem', icon: '🥂', people: '2 People' },
  { id: 'family', title: 'Family', desc: 'A group of fun-loving adventurers', icon: '🏡', people: '3 to 5 People' },
  { id: 'friends', title: 'Friends', desc: 'A bunch of thrill-seekers', icon: '⛵', people: '5 to 10 People' },
]

export const BUDGET_OPTIONS = [
  { id: 'cheap', title: 'Cheap', desc: 'Stay conscious of costs', icon: '💵' },
  { id: 'moderate', title: 'Moderate', desc: 'Keep cost on the average side', icon: '💰' },
  { id: 'luxury', title: 'Luxury', desc: "Don't worry about cost", icon: '💸' },
]

export const optionTitle = (options, id) => options.find((o) => o.id === id)?.title ?? id
export const travelerText = (id) => {
  const o = TRAVELER_OPTIONS.find((t) => t.id === id)
  return o ? `${o.title} (${o.people})` : id
}
