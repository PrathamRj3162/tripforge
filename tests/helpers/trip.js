export function makeTrip(days = 2) {
  return {
    summary: 'A relaxed trip with culture and food.',
    hotels: [1, 2, 3].map((i) => ({
      hotelName: `Hotel ${i}`, hotelAddress: `${i} Main Street`, price: '$80-120', rating: 4.2, description: 'Clean and central.',
    })),
    itinerary: Array.from({ length: days }, (_, d) => ({
      day: d + 1,
      theme: `Theme ${d + 1}`,
      plan: [1, 2, 3].map((p) => ({
        placeName: `Place ${d + 1}-${p}`, placeDetails: 'A famous spot.', ticketPricing: 'Free', rating: 4.5, bestTime: 'Morning', travelTime: '10 min',
      })),
    })),
  }
}

export const validInput = (over = {}) => ({ destination: 'Paris, France', days: 2, budget: 'moderate', travelers: 'couple', fresh: false, ...over })

export const silentLog = { error() {} }
