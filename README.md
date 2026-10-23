# Bola Bersama

# MASTER PROMPT — YOUTH FOOTBALL ECOSYSTEM PLATFORM
## Mobile-First UI/UX, Multi-Role Platform, Android & iOS Ready

### 1. YOUR ROLE

Act as a senior product strategist, UX researcher, product designer, mobile application architect, and full-stack engineer.

Design and build a modern, mobile-first digital ecosystem for youth football development in Indonesia.

The platform must connect six primary stakeholder groups:

1. Players — Pemain
2. Parents and guardians — Orang Tua/Wali
3. Coaches — Pelatih
4. Football schools and clubs — SSB/Manajemen Klub
5. Tournament and competition organizers — Penyelenggara Turnamen/Kompetisi
6. Football associations — Asosiasi Sepak Bola

The product must not be a collection of disconnected dashboards. It must operate as one connected ecosystem in which users, organizations, teams, player registrations, training activities, competitions, matches, and official results share consistent data and workflows.

Build the user experience first, but establish a credible technical foundation that supports future production implementation.

Product working name: **BOLAID**.

The name, logo, and brand identity must be configurable.

### 2. PRODUCT VISION

Create a trusted digital infrastructure for youth football in Indonesia that helps every young player develop, helps parents monitor development, helps coaches manage training, helps SSBs operate professionally, helps organizers conduct competitions, and helps associations oversee football development.

The platform should make youth football:

- More connected.
- More transparent.
- Easier to manage.
- Safer for children.
- More accessible to families and smaller SSBs.
- More data-driven without making automated systems the authority on sporting decisions.

Primary target users are Indonesian youth football communities, SSBs, clubs, competition organizers, and football associations.

All visible user-facing text must be in Bahasa Indonesia, with natural wording familiar to Indonesian football communities.

### 3. PRODUCT AND PLATFORM STRATEGY

Build a responsive application with a mobile-first design.

Priority:
1. Mobile phone experience.
2. Tablet experience.
3. Desktop administration experience.

Target future distribution on Android and iOS.

For the first implementation, build a responsive, installable web application using an architecture that can later be packaged or adapted for mobile distribution, such as Capacitor, subject to compatibility testing.

Do not claim that a responsive website is already a fully native Android or iOS application.

Use reusable components, a consistent design system, responsive navigation, touch-friendly controls, and mobile-safe layouts.

Avoid designing a desktop dashboard and simply shrinking it to a phone screen.

### 4. ECOSYSTEM RELATIONSHIPS

Implement these connected relationships.

#### A. Player ↔ Parent/Guardian

- A parent or legal guardian manages a child's account and consent.
- A child profile contains only necessary football development information.
- Parents can review training schedules, attendance, coach feedback, match participation, and authorized performance statistics.
- Multiple guardians may be linked when appropriately authorized.
- A child cannot independently authorize sensitive actions that legally or operationally require guardian approval.
- Players must not be exposed to public direct messaging from strangers.

#### B. Player ↔ Coach

- Coaches can access only the players and teams assigned to them.
- Coaches record attendance, training sessions, development assessments, and match participation.
- Parents receive appropriate updates through authorized channels.
- Player development history is preserved over time.
- Evaluations are contextual, explainable, and not automatically treated as official scouting decisions.

#### C. Parent ↔ SSB Management

- Parents submit registration requests.
- SSB management reviews and approves registration.
- Authorized documents and consent records are managed securely.
- Parents receive status updates, schedules, announcements, and authorized fee information.
- Transfer, withdrawal, and membership changes follow explicit workflows.

#### D. Coach ↔ SSB Management

- Management creates teams and assigns coaches.
- Coaches manage authorized training activities.
- Management oversees attendance, roster completeness, operational schedules, and team readiness.
- Changes to team assignments preserve historical records.

#### E. SSB ↔ Tournament Organizer

- Organizers publish competitions with age categories, eligibility rules, schedules, venues, regulations, and registration deadlines.
- SSB management discovers competitions and submits team registrations.
- The organizer reviews and approves entries.
- The system validates registration requirements and flags unresolved eligibility issues.
- Approved teams and rosters are used to generate fixtures and match records.
- Official results feed standings, competition statistics, and final reports.

#### F. Organizer ↔ Association

- Associations establish applicable competition and governance rules.
- Organizers submit competitions for approval when required.
- Associations review competition status, participating organizations, and reports within their jurisdiction.
- Associations can inspect relevant records and audit trails.
- Only authorized officials may approve or amend official records.

#### G. SSB ↔ Association

- SSBs maintain organizational profiles and submit verification requests.
- Associations review relevant organizational information and affiliations.
- Association officials manage their authorized organizational scope.
- Organization status and affiliation history are preserved.
- The platform must support different association structures and jurisdictions without hardcoding one national governance model.

#### H. Shared Ecosystem Data

A verified player identity should not require a completely new profile for every competition.

However, sharing must be permission-based. Each organization receives only the data necessary for its legitimate purpose.

Create a relationship model connecting:

Identity → Guardian Relationship → Organization Membership → SSB → Team → Player Registration → Competition → Match → Official Result.

The data model must support historical membership, transfers, multiple authorized roles, and organization-specific permissions.

### 5. USER ROLES AND EXPERIENCE

Implement role-aware navigation and dashboards.

A single account may hold multiple roles, such as parent and SSB administrator. Provide a visible role or organization switcher when the account is authorized for multiple contexts.

Do not duplicate accounts unnecessarily.

#### ROLE 1 — PLAYER

Create a player-friendly experience with:

- Beranda pemain.
- Profil dan identitas sepak bola.
- Tim dan SSB saat ini.
- Jadwal latihan.
- Jadwal pertandingan.
- Riwayat kehadiran.
- Statistik pertandingan yang terverifikasi.
- Catatan perkembangan dari pelatih.
- Riwayat partisipasi kompetisi.
- Prestasi dan pencapaian.
- Informasi dan pengumuman tim.

Player-facing interfaces should be age-appropriate, encouraging, and easy to understand.

Do not publicly expose children's personal contact information, home addresses, sensitive documents, or precise live locations.

#### ROLE 2 — PARENT/GUARDIAN

Create a parent dashboard with:

- Ringkasan perkembangan anak.
- Profil anak yang terhubung.
- Jadwal latihan dan pertandingan.
- Konfirmasi kehadiran.
- Pesan dan pengumuman resmi.
- Catatan perkembangan dari pelatih.
- Riwayat kompetisi.
- Status pendaftaran SSB dan turnamen.
- Informasi administrasi dan pembayaran, if implemented.
- Persetujuan wali dan pengaturan privasi.
- Riwayat izin penggunaan foto atau media.
- Notifikasi perubahan jadwal.

Allow authorized guardians to manage multiple children from one account.

Use clear status indicators such as Menunggu Persetujuan, Aktif, Perlu Dilengkapi, and Ditolak.

#### ROLE 3 — COACH

Create a coach workspace with:

- Ringkasan tim.
- Daftar pemain yang ditugaskan.
- Kalender latihan dan pertandingan.
- Pencatatan kehadiran.
- Pembuatan sesi latihan.
- Catatan evaluasi pemain.
- Pengelolaan roster.
- Catatan kesiapan pertandingan.
- Pencatatan partisipasi dan statistik yang menjadi kewenangannya.
- Riwayat perkembangan pemain.
- Pengumuman untuk tim.
- Daftar tugas dan administrasi yang tertunda.

Prioritize quick actions that can be completed on a phone in a few taps.

Do not allow coaches to access unrelated teams or private guardian data.

#### ROLE 4 — SSB MANAGEMENT

Create an organization management dashboard with:

- Profil dan status verifikasi SSB.
- Manajemen tim dan kelompok umur.
- Manajemen pemain.
- Manajemen orang tua/wali yang terhubung.
- Manajemen pelatih dan staf.
- Permintaan pendaftaran baru.
- Jadwal latihan dan lapangan.
- Pengelolaan roster.
- Penemuan turnamen dan kompetisi.
- Pendaftaran tim ke kompetisi.
- Status dokumen dan persyaratan pemain.
- Informasi administrasi dan pembayaran, if enabled.
- Pengumuman organisasi.
- Laporan kehadiran dan aktivitas.
- Riwayat perubahan data.
- Pengaturan peran dan izin staf.

Support multiple teams, age categories, and coaches within one SSB.

#### ROLE 5 — TOURNAMENT/COMPETITION ORGANIZER

Create a competition management workspace with:

- Dashboard kompetisi.
- Pembuatan kompetisi.
- Pengaturan kategori umur.
- Peraturan dan kriteria kelayakan.
- Jadwal, venue, dan format pertandingan.
- Pendaftaran SSB dan tim.
- Verifikasi persyaratan peserta.
- Review roster pemain.
- Penyusunan grup dan bracket.
- Pembuatan jadwal pertandingan.
- Penugasan ofisial yang berwenang.
- Pusat operasional pertandingan.
- Pencatatan skor dan peristiwa pertandingan.
- Persetujuan dan publikasi hasil resmi.
- Klasemen dan statistik kompetisi.
- Pengumuman dan perubahan jadwal.
- Laporan hasil kompetisi.
- Audit aktivitas pengelola.

The organizer must be able to manage a competition without obtaining unrestricted access to every participating child's personal data.

#### ROLE 6 — FOOTBALL ASSOCIATION

Create an association workspace with:

- Dashboard organisasi dan kompetisi.
- Direktori SSB dan klub dalam lingkup kewenangan.
- Review permohonan verifikasi organisasi.
- Manajemen afiliasi dan status organisasi.
- Kalender kompetisi.
- Review dan persetujuan kompetisi when required by applicable rules.
- Pemantauan partisipasi kompetisi.
- Akses ke hasil resmi dan laporan yang diizinkan.
- Pemantauan kelengkapan administrasi.
- Pengelolaan aturan dan kebijakan sesuai kewenangan.
- Pemeriksaan riwayat perubahan dan audit.
- Pelaporan pengembangan sepak bola usia dini.

Support configurable governance structures, delegated authority, and organization-specific permissions.

Association dashboards must not automatically grant access to all sensitive child data.

### 6. CORE MOBILE NAVIGATION

Use a mobile bottom navigation bar with no more than five primary destinations per role.

Example parent navigation:
- Beranda
- Jadwal
- Perkembangan
- Notifikasi
- Akun

Example coach navigation:
- Beranda
- Tim
- Jadwal
- Aktivitas
- Akun

Example SSB management navigation:
- Ringkasan
- Pemain
- Tim
- Kompetisi
- Lainnya

Example organizer navigation:
- Ringkasan
- Kompetisi
- Pertandingan
- Peserta
- Lainnya

Place secondary features inside contextual pages, tabs, or menus.

Desktop can use a sidebar and denser tables, but mobile must use readable cards, lists, bottom sheets, and step-by-step forms.

### 7. DESIGN SYSTEM AND VISUAL DIRECTION

Create a premium, modern sports technology interface.

Visual direction:
- Professional football identity.
- Youth-development focused.
- Clean, confident, approachable.
- Trustworthy for parents and organizations.
- Modern and practical rather than overly decorative.
- Clear hierarchy and high readability.

Suggested color palette:
- Deep navy: #10243A
- Football green: #16845B
- Bright green accent: #42C77A
- Warm white: #F7F9F7
- Neutral gray: #667085
- Amber for pending states.
- Red for errors and critical warnings.

Use semantic color tokens rather than hardcoded colors throughout every component.

Typography:
- Use a highly legible sans-serif typeface.
- Large, readable mobile headings.
- Clear labels and concise descriptions.
- Consistent spacing, radius, and component dimensions.

Components:
- Cards.
- Status badges.
- Avatar and team crest.
- Player profile header.
- Calendar and schedule cards.
- Search and filter controls.
- Stepper forms.
- Confirmation dialogs.
- Bottom sheets.
- Empty states.
- Loading skeletons.
- Error and success messages.
- Toast notifications.
- Accessible charts.
- Tables adapted for mobile.
- Permission-aware action menus.

Use real-looking but fictional Indonesian names, SSBs, teams, competitions, and venues.

Do not use real children's personal data.

Avoid excessive gradients, glassmorphism, oversized hero banners, unnecessary animations, and crowded dashboards.

### 8. REQUIRED USER FLOWS

Design and connect the following end-to-end flows.

FLOW A — PLAYER ONBOARDING

1. Parent creates an account.
2. Parent creates a child profile.
3. Parent provides the required information and consents.
4. Parent requests enrollment at an SSB.
5. SSB management reviews the request.
6. The parent receives the decision.
7. The approved player becomes linked to the relevant SSB and team.
8. The coach can access the player within the assigned team.
9. The parent can see the child's schedule and development updates.

FLOW B — SSB REGISTRATION FOR COMPETITION

1. Organizer creates and publishes a competition.
2. SSB management discovers the competition.
3. Management reviews eligibility requirements.
4. Management selects a team.
5. The system displays roster requirements and missing documents.
6. Management submits the registration.
7. Organizer reviews the application.
8. Organizer approves, rejects, or requests corrections.
9. The SSB receives the decision.
10. Approved registrations become available for competition scheduling.

FLOW C — MATCH AND OFFICIAL RESULTS

1. Organizer generates fixtures.
2. Authorized officials confirm match readiness.
3. The match starts under the authorized match operator.
4. The operator records match events and score changes.
5. The match is submitted for finalization.
6. The authorized official confirms the final result.
7. The system publishes the official result.
8. Standings and competition statistics are updated from the official result.
9. Authorized users can inspect the match record and its history.

Implement controlled match states, for example:

Scheduled → Ready → Live → Awaiting Confirmation → Finalized.

Any correction to a finalized match must follow an explicit authorized correction workflow and preserve the previous record.

FLOW D — PLAYER DEVELOPMENT

1. Coach records a training session.
2. Coach marks attendance.
3. Coach adds an authorized development assessment.
4. The assessment is saved with author and timestamp.
5. The parent receives an appropriate notification.
6. The parent views the assessment.
7. Authorized staff can review the player's historical development records.

FLOW E — ASSOCIATION GOVERNANCE

1. SSB submits organizational verification.
2. Authorized association staff review the application.
3. Staff approve, reject, or request corrections.
4. The decision and reason are recorded.
5. Organization status is updated.
6. Relevant authorized organizers can view the verification status.
7. Every decision is auditable.

All these flows must use consistent entities and state transitions rather than independent mock screens.

### 9. REQUIRED SCREENS

Build the following screens first.

Public and authentication:
- Landing page.
- Sign in.
- Sign up.
- Forgot password.
- Role-aware onboarding.
- Organization selection and role switching.

Shared:
- Notification center.
- Profile and account settings.
- Search and discovery.
- Help and support.
- Privacy and consent settings.

Parent:
- Parent home.
- Child profile.
- Schedule.
- Development timeline.
- Attendance history.
- SSB registration.
- Notification center.

Coach:
- Coach home.
- Team roster.
- Player detail.
- Training session.
- Attendance form.
- Development assessment.
- Match readiness.

SSB management:
- Organization dashboard.
- Player directory.
- Registration review.
- Team management.
- Coach management.
- Competition discovery.
- Competition registration.
- Organization settings.

Organizer:
- Competition dashboard.
- Competition creation wizard.
- Participant applications.
- Roster validation.
- Group and fixture management.
- Match operations.
- Official result confirmation.
- Standings and reports.

Association:
- Association dashboard.
- Organization verification queue.
- Organization profile and affiliation.
- Competition oversight.
- Authorized reports.
- Audit log.

Use shared reusable components where possible. Do not create six entirely separate products.

### 10. KEY PRODUCT RULES

Implement role-based access control and organization-scoped permissions.

Important principles:

- UI visibility is not a security boundary.
- Authorization must be enforced by the backend.
- Users can only modify resources within their assigned permissions.
- A coach cannot access every player on the platform.
- A parent cannot access another family's private information.
- An organizer cannot arbitrarily edit official association records.
- Official results must have an explicit authorized publication process.
- Sensitive operations must be auditable.
- Historical records must not be silently overwritten.
- Data sharing must be limited to legitimate, authorized purposes.
- Consent withdrawal and account or profile lifecycle actions must be handled through explicit workflows.
- Do not expose sensitive child data in public search results.
- Avoid public rankings of children that could misrepresent development or create harmful pressure.
- AI-generated evaluations, if added in the future, must be advisory and explainable, never the authoritative source of official decisions.

### 11. DATA MODEL

Establish a normalized, extensible data model covering:

- Users
- Roles
- Organizations
- OrganizationMemberships
- GuardianRelationships
- PlayerProfiles
- Teams
- TeamMemberships
- CoachAssignments
- TrainingSessions
- AttendanceRecords
- DevelopmentAssessments
- Competitions
- CompetitionCategories
- CompetitionRegistrations
- CompetitionRosterEntries
- EligibilityRequirements
- Venues
- Fixtures
- Matches
- MatchEvents
- MatchOfficials
- OfficialResults
- Standings
- Notifications
- ConsentRecords
- Documents
- OrganizationVerifications
- AuditLogs

Use stable identifiers, timestamps, explicit statuses, and appropriate relationships.

Separate identity from organization membership and role assignments.

Model age eligibility using configurable competition rules and the relevant reference date, not only a player's current age.

Do not store sensitive information that is unnecessary for the feature.

### 12. TECHNICAL IMPLEMENTATION

Use Lovable's supported application stack.

Preferred foundation:
- React.
- TypeScript.
- A consistent component system.
- Tailwind CSS where supported.
- Accessible UI primitives.
- Supabase for authentication, PostgreSQL, storage, and server-side functionality when available.

Use environment variables for credentials and configuration. Never hardcode secrets in frontend code.

Implement:
- Authentication.
- Protected routes.
- Role-aware navigation.
- Organization-scoped access.
- Database migrations or a clearly defined schema.
- Server-side validation.
- Row Level Security where Supabase is used.
- Secure document access.
- Consistent loading, empty, success, and error states.

Do not rely on frontend-only checks for permissions.

If a backend integration is not configured, clearly identify it as a development dependency rather than pretending that it is working.

Use seeded fictional data only in development.

For asynchronous features, use a clean service/data-access layer. Keep the application ready for future real-time match updates and notifications without falsely claiming that these integrations are operational.

### 13. UX QUALITY REQUIREMENTS

The application must:
- Be optimized for common mobile screen widths.
- Support one-handed interaction for frequent actions.
- Use appropriately sized touch targets.
- Avoid horizontal overflow on phones.
- Provide clear form validation.
- Explain why a submission cannot proceed.
- Preserve entered form data when safe to do so.
- Confirm destructive or irreversible actions.
- Display timestamps and status changes clearly.
- Handle empty lists and missing data gracefully.
- Provide clear navigation back to the previous context.
- Support accessible contrast and readable text.
- Avoid excessive mandatory data entry during onboarding.

For registration forms, use progressive disclosure and a step-by-step wizard.

For tables on mobile, use cards or compact row layouts rather than forcing desktop-width tables onto small screens.

### 14. IMPLEMENTATION PRIORITY

Do not build every feature at once.

Phase 1 — Foundation and first vertical slice:
- Design system.
- Mobile navigation.
- Authentication foundation.
- Role and organization context.
- Parent onboarding.
- Child profile.
- SSB registration request.
- SSB management approval.
- Team assignment.
- Coach access to assigned player.
- Parent visibility of the child's schedule.

Phase 2 — Training and player development:
- Training calendar.
- Attendance.
- Coach assessment.
- Parent notifications.
- Development history.

Phase 3 — Competition core:
- Competition creation.
- Team registration.
- Eligibility checks.
- Roster validation.
- Fixtures.
- Match operations.
- Official results and standings.

Phase 4 — Governance:
- Organization verification.
- Association dashboard.
- Competition oversight.
- Audit trails and reporting.

Phase 5 — Expansion:
- Payments, if required.
- Advanced statistics.
- Scouting with appropriate child protection.
- Media and consent management.
- Advanced analytics.
- Android and iOS packaging and release preparation.

Keep this dependency order unless implementation evidence justifies a change.

### 15. ACCEPTANCE CRITERIA

The first deliverable is successful only if:

1. The application has a consistent mobile-first visual identity.
2. All six roles have distinct, relevant navigation and experiences.
3. Multi-role accounts are supported by an explicit context switcher.
4. Parent-to-player relationships are represented correctly.
5. Player enrollment follows a review and approval process.
6. Coaches only see players within their authorized assignments.
7. Approved player registrations are reflected consistently across relevant screens.
8. Competition registration can reuse authorized player and team data.
9. Official match results follow a controlled state transition.
10. The same official result drives standings and statistics.
11. Sensitive child data is not exposed through public interfaces.
12. Loading, empty, error, and success states exist.
13. The backend security model is documented and tested where implemented.
14. The first vertical slice can be demonstrated from onboarding to team assignment.
15. Incomplete integrations and mocked features are clearly identified.

### 16. FIRST TASK — START BUILDING

Begin by creating the application shell, design system, mobile navigation, and role-aware dashboards using fictional Indonesian development data.

Then implement the complete Phase 1 vertical slice.

Do not stop after generating static mockup screens.

Where backend credentials or configuration are missing, establish the required schema and integration boundaries, label the dependency, and continue with clearly identified development data.

Before adding Phase 2, verify the Phase 1 flow and its access-control requirements.

At the end, provide:
- Implemented features.
- Screens and reusable components created.
- Data model and relationships.
- Working versus mocked integrations.
- Authorization rules implemented.
- Known limitations.
- Acceptance test results.
- Next implementation tasks.

The final product should feel like a coherent Indonesian youth football platform, not a generic SaaS admin template.

**Primary success metric: all six stakeholder groups can work within one connected ecosystem, while each user sees only the information and actions appropriate to their role and permissions.**

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b6e288dd-004e-424b-9a28-be159f27713d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Implementasi Fase 1

Alur orang tua/wali → profil anak → permintaan pendaftaran → tinjauan SSB → persetujuan dan penempatan tim → penugasan pelatih → jadwal wali menggunakan Supabase Auth, PostgreSQL, RPC, dan Row Level Security. Data organisasi/tim demo pada migrasi bersifat fiktif; profil anak, pendaftaran, penugasan pelatih, dan jadwal hanya menjadi data nyata setelah pengguna membuatnya pada backend yang dikonfigurasi.

Status pendaftaran adalah `pending` (menunggu tinjauan), `needs_info` (perlu dilengkapi), `approved` (disetujui), dan `rejected` (ditolak). Manajemen SSB hanya dapat memutuskan permintaan `pending`; alasan wajib untuk meminta kelengkapan atau menolak. Status `needs_info` hanya dapat kembali menjadi `pending` melalui jawaban wali yang terhubung. Persetujuan mewajibkan tim dari SSB yang sama.

Setelah migrasi diterapkan, kebijakan RLS membatasi profil anak dan relasi wali kepada wali yang terhubung, manajemen SSB yang meninjau, serta pelatih yang ditugaskan pada tim dengan keanggotaan aktif. Jadwal dibaca oleh manajemen/pelatih tim tersebut dan wali pemain aktif. Tulis langsung oleh klien pada data inti tidak diberikan; mutasi alur dilakukan melalui fungsi basis data yang memeriksa kewenangan. Organisasi demo hanya dapat diklaim oleh akun uji yang diberi `app_metadata.allow_demo_role_claims=true` melalui mekanisme administrasi tepercaya—jangan izinkan pengguna mengatur metadata ini sendiri. Penerapan migrasi dan otorisasi backend pada proyek yang dipakai aplikasi masih harus diverifikasi sebelum fitur dinyatakan aktif.

Migrasi tambahan Fase 1 berada di `drizzle/migrations/0002_phase1_access.sql` dan `drizzle/migrations/0003_phase1_security_hardening.sql`. Migrasi harus diterapkan berurutan setelah `0000_migration.sql` dan `0001_migration.sql`. Migrasi 0003 membatasi pemanggilan helper, membatasi akses profil pemain pada pendaftaran yang ditolak, mencegah pendaftaran aktif ganda secara bersamaan, dan mengatur search path aman untuk fungsi `SECURITY DEFINER`. Migrasi ini belum terbukti diterapkan ke backend mana pun sampai statusnya diperiksa pada proyek tujuan. Pastikan variabel `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, serta `VITE_SUPABASE_PUBLISHABLE_KEY` dikonfigurasi sebelum menjalankan alur backend. Tanpa backend tersebut, alur tidak diganti dengan data tiruan yang seolah-olah tersimpan.

Sebelum menerapkan migrasi 0003 pada database yang sudah berisi data, periksa apakah data lama memiliki duplikasi yang akan menghalangi indeks unik:

```sql
select player_id, organization_id, count(*)
from public.enrollment_requests
where status in ('pending', 'needs_info', 'approved')
group by player_id, organization_id
having count(*) > 1;

select team_id, player_id, count(*)
from public.team_memberships
where active
group by team_id, player_id
having count(*) > 1;
```

Kedua pemeriksaan tersebut hanya membaca data. Bersihkan duplikasi secara terkontrol sesuai catatan bisnis sebelum migrasi; jangan menghapus data produksi otomatis.

Tes akses API berada di `supabase/tests/phase1_access.py` dan membutuhkan Python package `requests`. Tes ini membuat data melalui API dan tidak membersihkan data secara otomatis. Jalankan hanya pada proyek Supabase uji khusus yang disposable, dengan lima akun uji (`wali.a@test.local`, `wali.b@test.local`, `admin@test.local`, `coach@test.local`, dan `coach2@test.local`); akun admin uji harus diberi metadata demo melalui mekanisme administrasi tepercaya. Sebelum eksekusi, periksa bahwa URL browser dan server menunjuk ke proyek uji yang sama, pastikan keempat migrasi telah diterapkan berurutan, dan atur `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `TEST_PW`, `PHASE1_TEST_PROJECT_ID`, `PHASE1_ALLOW_WRITES=1`, `PHASE1_PROJECT_IS_DISPOSABLE=1`, serta `PHASE1_MIGRATIONS_CONFIRMED=1`. Pengujian membuat profil dan tim dengan akhiran ID-run unik, tetapi beberapa notifikasi/audit ikut tercatat; setelah pengujian, buang dan buat ulang proyek uji disposable melalui Supabase Dashboard untuk membersihkan seluruh fixture. Jangan menjalankan tes tulis ini pada produksi atau proyek bersama.

Di luar Fase 1: pencatatan kehadiran dan evaluasi perkembangan, pembatalan persetujuan mandiri, pengelolaan pembayaran, kompetisi/pertandingan, analitik lanjutan, serta aplikasi native Android/iOS belum menjadi bagian alur backend ini. Layar kompetisi yang ada masih memakai data pengembangan fiktif.
