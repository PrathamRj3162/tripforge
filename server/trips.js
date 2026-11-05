// Saves a validated plan under the user's own path: users/{uid}/trips/{autoId}
// Firestore rules let the owner read and delete it, but only this server can create it.
export async function saveTrip({ db, uid, input, plan, model, cached, now = new Date() }) {
  const ref = await db.collection('users').doc(uid).collection('trips').add({
    destination: input.destination,
    days: input.days,
    budget: input.budget,
    travelers: input.travelers,
    plan: JSON.parse(JSON.stringify(plan)),
    model,
    cached,
    schemaVersion: 1,
    createdAt: now,
  })
  return ref.id
}
