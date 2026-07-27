# Graph Report - .  (2026-07-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 723 nodes · 1766 edges · 34 communities (30 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- requireRole
- pharmacist/dashboard/obat/page.tsx
- devDependencies
- getCurrentUser
- dependencies
- utils.ts
- app/page.tsx
- drugs.ts
- sidebar.tsx
- session-list.tsx
- compilerOptions
- tulis-obat/page.tsx
- start-chat-prompt.tsx
- components.json
- (dashboard)/dashboard/chat/[sessionId]/page.tsx
- app-message.tsx
- carousel.tsx
- cn
- drug-form.tsx
- admin/page.tsx
- button.tsx
- sheet.tsx
- app/layout.tsx
- faq-section.tsx
- seed.ts
- react
- drug-search.ts
- patient-snapshot.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- prisma.config.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 144 edges
2. `requireRole()` - 47 edges
3. `Button()` - 41 edges
4. `value()` - 26 edges
5. `fail()` - 26 edges
6. `AppMessage()` - 18 edges
7. `getCurrentUser()` - 18 edges
8. `compilerOptions` - 16 edges
9. `Card()` - 15 edges
10. `CardContent()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `PersonalDetailsPage()` --calls--> `requireRole()`  [EXTRACTED]
  app/(dashboard)/dashboard/profile/personal-details/page.tsx → lib/session.ts
- `AdminLayout()` --calls--> `requireRole()`  [EXTRACTED]
  app/admin/layout.tsx → lib/session.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `PharmacistDashboardPage()` --calls--> `requireRole()`  [EXTRACTED]
  app/pharmacist/dashboard/page.tsx → lib/session.ts
- `PharmacistProfilePage()` --calls--> `requireRole()`  [EXTRACTED]
  app/pharmacist/dashboard/profile/page.tsx → lib/session.ts

## Import Cycles
- None detected.

## Communities (34 total, 4 thin omitted)

### Community 0 - "requireRole"
Cohesion: 0.07
Nodes (57): publishDrug(), reviewPharmacist(), dateValue(), listValue(), optionalText(), requireVerifiedReviewer(), saveDrug(), verifiedReviewerId() (+49 more)

### Community 1 - "pharmacist/dashboard/obat/page.tsx"
Cohesion: 0.06
Nodes (49): DashboardDrugPage(), PageProps, parsePage(), greeting(), HomePage(), PageProps, PageProps, DrugInformationPage() (+41 more)

### Community 2 - "devDependencies"
Cohesion: 0.05
Nodes (41): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, tailwindcss (+33 more)

### Community 3 - "getCurrentUser"
Cohesion: 0.10
Nodes (29): field(), finalStatuses, saveConsultationSummary(), finalStatuses, imageTypes, sendConsultationMessage(), GET(), GET() (+21 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (39): better-auth, class-variance-authority, clsx, dotenv, embla-carousel-react, lucide-react, next, next-themes (+31 more)

### Community 5 - "utils.ts"
Cohesion: 0.10
Nodes (22): AdminLayout(), AdminDashboardShell(), adminNavItems, DashboardNavItem, DashboardNavLink(), DashboardShell(), DashboardShellProps, getUserInitials() (+14 more)

### Community 6 - "app/page.tsx"
Cohesion: 0.09
Nodes (19): DashboardDrugDetailPage(), PageProps, faqs, DrugDetailPage(), generateMetadata(), PageProps, DrugDetail(), FaqSection() (+11 more)

### Community 7 - "drugs.ts"
Cohesion: 0.08
Nodes (30): PageProps, PharmacistDrugDetailPage(), AdminDrugDetailData, adminDrugDetailSelect, AdminDrugListItem, AdminDrugListParams, adminDrugListSelect, countDrugSearch() (+22 more)

### Community 8 - "sidebar.tsx"
Cohesion: 0.08
Nodes (29): Separator(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction() (+21 more)

### Community 9 - "session-list.tsx"
Cohesion: 0.12
Nodes (21): finalStatuses, ChatMessage, MessageBubble(), formatUpdatedAt(), getInitials(), SessionList(), SessionListItem, TypingIndicator() (+13 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (29): dom, dom.iterable, esnext, **/*.mts, next.config.ts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+21 more)

### Community 11 - "tulis-obat/page.tsx"
Cohesion: 0.14
Nodes (23): AdminDrugsPage(), formatDate(), letterHref(), pageHref(), PageProps, parseOption(), parsePage(), statusLabels (+15 more)

### Community 12 - "start-chat-prompt.tsx"
Cohesion: 0.19
Nodes (17): initials(), PageProps, PharmacistChatSessionPage(), toSessionListItem(), initials(), PromptContent(), StartChatPromptProps, SummaryData (+9 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "(dashboard)/dashboard/chat/[sessionId]/page.tsx"
Cohesion: 0.16
Nodes (16): initials(), PageProps, PatientChatSessionPage(), toSessionListItem(), initials(), PageProps, ProfilePage(), ChatRoom() (+8 more)

### Community 15 - "app-message.tsx"
Cohesion: 0.19
Nodes (10): PageProps, PageProps, PersonalDetailsPage(), PageProps, PharmacistProfilePage(), verificationLabels, PageProps, AppMessage() (+2 more)

### Community 16 - "carousel.tsx"
Cohesion: 0.18
Nodes (15): DashboardPromoCarousel(), promoItems, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem() (+7 more)

### Community 17 - "cn"
Cohesion: 0.19
Nodes (12): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia(), AlertDialogOverlay() (+4 more)

### Community 18 - "drug-form.tsx"
Cohesion: 0.16
Nodes (11): EditDrugPage(), PageProps, dateInput(), DrugForm(), lines(), markdownList(), Reviewer, SaveDrugAction (+3 more)

### Community 19 - "admin/page.tsx"
Cohesion: 0.24
Nodes (11): adminHref(), AdminPage(), fileLink(), filterHref(), formatDate(), PageProps, parseStatus(), PharmacistRow (+3 more)

### Community 20 - "button.tsx"
Cohesion: 0.29
Nodes (6): availabilityLabels, PageProps, DrugSubmitButton(), isComplete(), Button(), buttonVariants

### Community 21 - "sheet.tsx"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 22 - "app/layout.tsx"
Cohesion: 0.29
Nodes (5): fontMono, inter, RootLayout(), ThemeHotkey(), ThemeProvider()

### Community 23 - "faq-section.tsx"
Cohesion: 0.48
Nodes (5): faqs, Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 24 - "seed.ts"
Cohesion: 0.38
Nodes (6): admin, demoDrugs, getDemoPharmacistDrugData(), main(), markdownList(), pharmacists

### Community 25 - "react"
Cohesion: 0.40
Nodes (5): SidebarMenuSkeleton(), SidebarProvider(), useIsMobile(), react, react

### Community 26 - "drug-search.ts"
Cohesion: 0.50
Nodes (3): filterDrugs(), SearchableDrug, drugs

### Community 27 - "patient-snapshot.tsx"
Cohesion: 0.67
Nodes (3): PatientSnapshot(), PatientSnapshotData, value()

## Knowledge Gaps
- **197 isolated node(s):** `PageProps`, `PageProps`, `PageProps`, `PageProps`, `availabilityLabels` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `pharmacist/dashboard/obat/page.tsx`, `utils.ts`, `app/page.tsx`, `sidebar.tsx`, `session-list.tsx`, `tulis-obat/page.tsx`, `start-chat-prompt.tsx`, `(dashboard)/dashboard/chat/[sessionId]/page.tsx`, `app-message.tsx`, `carousel.tsx`, `drug-form.tsx`, `admin/page.tsx`, `button.tsx`, `sheet.tsx`, `app/layout.tsx`, `faq-section.tsx`, `react`?**
  _High betweenness centrality (0.271) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `react`, `devDependencies`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `pharmacist/dashboard/obat/page.tsx`, `dependencies`, `sidebar.tsx`, `carousel.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **What connects `PageProps`, `PageProps`, `PageProps` to the rest of the system?**
  _197 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `requireRole` be split into smaller, more focused modules?**
  _Cohesion score 0.07458405048766495 - nodes in this community are weakly interconnected._
- **Should `pharmacist/dashboard/obat/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061754385964912284 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._