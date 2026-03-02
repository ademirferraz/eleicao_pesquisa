# Consulta Eleitoral - TODO

## Phase 1: Backend & Database Setup
- [x] Upgrade to web-db-user (database, server, auth)
- [x] Create database schema for candidates, voters, votes
- [x] Create database schema for admin settings
- [x] Implement tRPC procedures for candidates CRUD
- [x] Implement tRPC procedures for voter registration
- [x] Implement tRPC procedures for voting
- [x] Implement tRPC procedures for results/analytics
- [x] Add admin authentication (password: 1234)

## Phase 2: Admin Panel
- [ ] Create AdminPanel page with candidate management
- [ ] Add/Edit/Delete candidates (max 6)
- [ ] Upload candidate photos
- [ ] Generate test data
- [ ] View real-time vote counts
- [ ] Admin login with password

## Phase 3: Voter Interface
- [ ] Simplify Register.tsx (Nome, CPF, Data, Estado, Município, Bairro)
- [ ] Create Welcome page with "Cadastre-se" button
- [ ] Create Voting page with candidate photos (max 5)
- [ ] Implement vote confirmation with sound
- [ ] Add vote synchronization (real-time)

## Phase 4: Results & Analytics
- [ ] Create Results page with interactive charts
- [ ] Show vote count by candidate
- [ ] Show analysis by neighborhood
- [ ] Show analysis by municipality
- [ ] Real-time updates

## Phase 5: Deployment & Sharing
- [ ] Deploy to web with public link
- [ ] Test vote synchronization across devices
- [ ] Create shareable link for WhatsApp/Email/Instagram/Facebook
- [ ] Verify votes persist across sessions
- [ ] Test admin controls

## Phase 6: Polish & Testing
- [ ] Add candidate images (5 photos)
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify sound works everywhere
- [ ] Performance optimization
