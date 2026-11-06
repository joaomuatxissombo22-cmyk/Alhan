# Security Specification — ALHAN SGI Platform

## 1. Data Invariants
1. **Default-Deny Safety Net**: Every path not explicitly matched is denied (`allow read, write: if false;`).
2. **PII Split Collection**: User PII (`email`, `phone`) is strictly isolated in `/users/{userId}/private/{docId}` and only readable by the document owner (`request.auth.uid == userId`) or a verified Admin.
3. **Self-Assigned Role Prevention**: Regular users creating their `/users/{userId}` document can only assign `ALUNO` or `CLIENTE_EMPRESARIAL`, never `SUPER_ADMIN` or `ADMIN` unless their verified email matches the bootstrapped admin or `/admins/{uid}` exists.
4. **Immutable Ownership & Creation Timestamps**: `uid`, `studentId`, `userId`, `companyId`, and `createdAt` cannot be mutated on `update`.
5. **Strict Server Timestamps**: `createdAt` must equal `request.time` on `create`.
6. **Terminal State Locking**: Once an `Enrollment` reaches `paymentStatus == 'Reembolsado'` or `Certificate` reaches `status == 'cancelado'`, non-admins cannot mutate the record.
7. **Query Enforcement**: Every `allow list` rule evaluates `resource.data` (e.g., `resource.data.published == true` or `resource.data.studentId == request.auth.uid`), never delegating security to client queries.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection**: `{ "uid": "u1", "fullName": "Ana", "username": "ana", "role": "ALUNO", "companyId": "none", "status": "ativo", "createdAt": "<SERVER_TIME>", "isVerified": true }` -> Rejected by `hasOnly`.
2. **Privilege Escalation on Create**: Non-admin user attempts `{ "role": "SUPER_ADMIN" }` on `/users/{userId}` -> Rejected by role check.
3. **Role Mutation on Update**: User attempts to update `role` on `/users/{userId}` via `affectedKeys` -> Rejected because non-admin update only permits `['fullName', 'username']`.
4. **Unverified Admin Email Spoof**: Token with `email == 'joaomuatxissombo22@gmail.com'` and `email_verified == false` -> Rejected by `request.auth.token.email_verified == true`.
5. **PII Cross-User Read**: Authenticated user `u2` attempts `get` on `/users/u1/private/info` -> Rejected by `isOwner(userId) || isAdmin()`.
6. **Unbounded ID Poisoning**: Document ID exceeding 128 chars or containing `/` or `$` -> Rejected by `isValidId(id)`.
7. **Value Poisoning on Update**: Updating `fullName` on `/users/{userId}` with a number `12345` or 5000-char string -> Rejected because `isValidUserProfile(incoming())` wraps the update block.
8. **Student Self-Marking Payment as Paid**: Student attempts to create or update `Enrollment` with `paymentStatus: "Pago"` -> Rejected because student create enforces `paymentStatus == 'Pendente'` and student update only permits `['progressPercent', 'receiptNote', 'paymentReference']`.
9. **Terminal State Reversal**: Student attempts to update an `Enrollment` where `existing().paymentStatus == 'Cancelado'` -> Rejected by terminal state lock.
10. **Cross-Tenant ISO Project Read**: Corporate user from `compA` attempts `list` or `get` on `/isoProjects` belonging to `compB` -> Rejected by `resource.data.companyId` check.
11. **Fake Client Timestamp**: Client supplies past/future timestamp for `createdAt` instead of `request.time` -> Rejected by `incoming().createdAt == request.time`.
12. **Blanket List Scraping on Enrollments**: Authenticated user runs `getDocs(collection(db, 'enrollments'))` without filtering by `studentId == request.auth.uid` -> Rejected by `allow list` check on `resource.data.studentId == request.auth.uid`.
