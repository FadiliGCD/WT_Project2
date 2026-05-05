export function normalizeRecipe(r) {
  if (!r) return null
  const author = r.author
  let authorUsername = 'Unknown'
  if (author && typeof author === 'object' && author.username) {
    authorUsername = author.username
  }
  return {
    ...r,
    _id: String(r._id),
    authorUsername,
  }
}
