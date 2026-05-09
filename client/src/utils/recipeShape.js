export function normalizeRecipe(r) {
  if (!r) return null
  const author = r.author
  let authorUsername = 'Unknown'
  let authorId = ''
  if (author && typeof author === 'object') {
    if (author.username) authorUsername = author.username
    if (author._id != null) authorId = String(author._id)
  } else if (author != null) {
    authorId = String(author)
  }
  return {
    ...r,
    _id: String(r._id),
    authorUsername,
    authorId,
  }
}
