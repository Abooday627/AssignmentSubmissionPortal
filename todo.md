# Assignment Submission Portal - TODO

## Core Features
- [x] Database schema for universities, specializations, submissions, and files
- [x] Telegram bot integration configuration (store bot tokens per university)
- [x] File upload API supporting multiple files and all formats
- [x] Student information collection (name, university, specialization, group number)
- [x] Telegram message forwarding with submission details and file attachments
- [x] Display available universities and specializations on frontend
- [x] Elegant submission form UI with file upload
- [x] Submission confirmation and status display
- [x] Support for multiple file formats (PDF, DOC, DOCX, images, etc.)

## Frontend UI
- [x] Landing page with submission form
- [x] University selection dropdown
- [x] Specialization selection dropdown (dynamic based on university)
- [x] Student information fields (name, group number)
- [x] Multiple file upload with drag-and-drop
- [x] File preview and removal before submission
- [x] Submission success/error messages
- [x] Elegant and modern design with proper styling

## Backend API
- [x] tRPC procedure for fetching universities and specializations
- [x] tRPC procedure for file upload handling
- [x] tRPC procedure for submission creation
- [x] Telegram API integration for sending messages and files
- [x] File storage in S3
- [x] Submission validation and error handling

## Testing & Deployment
- [ ] Vitest tests for API procedures
- [ ] Manual testing of file uploads and Telegram forwarding
- [ ] Telegram bot tokens configuration (via secrets)
- [ ] Deployment and user testing

## Completed Implementation
- [x] Full-stack web application with React + Express + tRPC
- [x] MySQL database with universities, specializations, submissions, and files tables
- [x] Telegram bot integration for forwarding submissions
- [x] Elegant UI with gradient backgrounds and modern components
- [x] File upload with S3 storage integration
- [x] Dynamic form fields based on university selection
