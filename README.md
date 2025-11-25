# Booking System for UT Fabrication Labs 

A full-stack scheduling platform built for the University of Tampa's fabrication facilities, enabling students and faculty to book equipment while automating capacity management, conflict resolution, and usage tracking.

## Overview

The University of Tampa's fabrication facilities were managing equipment scheduling manually through emails, leading to a lack of transparency and data, scheduling conflicts, and limited equipment access. This platform centralizes the booking process, serving the Department of Art & Design's 130+ students and 20+ faculty members across two facilities (FabLab and Woodshop).

### Key Features

- **Multi-step booking workflow** with conditional logic based on equipment type
- **Real-time capacity-aware scheduling** preventing overbooking
- **Role-based dashboards** (Student, Faculty, Admin) with tailored interfaces
- **Equipment availability management** with maintenance scheduling
- **Automated email notifications** for cancellations
- **Faculty class reservations** supporting 3-hour equipment blocks
- **Usage tracking** for operational insights

## Live Demo

**Try it out:** https://fabrication-labs.vercel.app/

**Demo Accounts:**
- **Student:** demo-student@fabricationlabs.com / FabricationLabsDemo
- **Faculty:** demo-faculty@fabricationlabs.com / FabricationLabsDemo
- **Admin:** demo-admin@fabricationlabs.com / FabricationLabsDemo

## Tech Stack

**Frontend:**
- React.js
- React Context (state management)
- React Router
- Material-UI (MUI Date Picker)
- Pure CSS

**Backend:**
- Node.js (native HTTP modules)
- Vercel Serverless Functions
- Custom routing implementation

**Database:**
- MongoDB

**Services:**
- JWT Authentication
- Resend API (email notifications)

**Tools:**
- Git & GitHub
- Figma (UI/UX design)
- Vite (development)

## Key Features Explained

### Multi-Step Booking Workflow

The booking process guides users through:
1. Equipment selection (FabLab or Woodshop equipment)
2. Material selection (conditional based on equipment)
3. File requirements confirmation
4. Date selection (MUI Date Picker with custom availability logic)
5. Time slot selection (30-minute or up to 3 hours for faculty)
6. Details form with terms acceptance

Users can navigate backward through steps without losing progress.

### Intelligent Time Slot Generation

The system generates available dates and time slots by checking:
- Semester dates and facility operating hours 
- Equipment capacity (for example, 3D printers support 3 concurrent users)
- Existing appointments and conflicts
- Equipment maintenance schedules
- Holidays and blockout dates

### Role-Based Access Control

Three user roles with distinct permissions:

**Student:**
- Book individual 30-minute appointments
- View/edit/cancel their own appointments

**Faculty:**
- All student permissions
- Reserve equipment for entire class sessions (up to 3 hours)

**Admin:**
- View all appointments for assigned facilities
- Cancel appointments with reason notifications
- Manage equipment availability and maintenance
- Update material inventory
- Set facility schedules (semester dates, holidays)

## Authentication Flow

1. User registers with university email
2. Verification email sent via Resend API
3. User clicks verification link
4. Account activated, JWT token issued
5. Token stored in localStorage (client)
6. Protected routes validate JWT on each request

## 📧 Email Notifications

Automated emails sent for:
- Account verification (registration)
- Appointment cancellation (admin action with reason)

## Known Issues & Improvements

### Current Challenges

**Email Deliverability:**
University email systems occasionally flag automated emails. Implementing SPF/DKIM authentication to improve deliverability.

### Planned Improvements

- [ ] Automated conflict resolution for class reservations
- [ ] Analytics dashboard for usage patterns
- [ ] Flexible operating hours per day of week

## Contributing

This is a private project for the University of Tampa. For questions or suggestions, please contact the repository owner.

## 📄 License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

**Built by:** Maria Blokhina

**Contact:** blokhinamariyayu@gmail.com

**Portfolio:** https://mariablokhina.framer.website/
