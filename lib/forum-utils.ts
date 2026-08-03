export type ForumAuthorRole = "PATIENT" | "PHARMACIST" | "ADMIN"

export function forumSlug(title: string) {
  return (
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "diskusi"
  )
}

export function forumAuthorName({
  authorName,
  authorRole,
}: {
  authorName: string
  authorRole: ForumAuthorRole
}) {
  if (authorRole !== "PATIENT") return authorName
  return authorName.trim().split(/\s+/)[0] || authorName
}

export function canWriteForum(user: {
  role: string
  pharmacistProfile?: { verificationStatus?: string } | null
}) {
  if (user.role === "PATIENT") return true
  if (user.role === "PHARMACIST") {
    return user.pharmacistProfile?.verificationStatus === "VERIFIED"
  }
  return false
}
