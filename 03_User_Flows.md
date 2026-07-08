# 👥 ENVISION AI - User Flows

Version: 1.0

---

# Purpose

This document defines every important user journey in ENVISION AI.

The AI code editor must use these flows to build intuitive navigation, correct screen transitions, and seamless interactions. Every flow should minimize user effort and maximize clarity.

---

# User Roles

1. Guest
2. Citizen
3. Anonymous Reporter
4. Volunteer
5. NGO Member
6. Municipality Officer
7. Moderator
8. Super Admin

---

# Primary Navigation

## Mobile Bottom Navigation

🏠 Home

🗺 Map

➕ Report

🔔 Alerts

👤 Profile

---

## Desktop Navigation

Dashboard

Community

Live Map

Reports

Knowledge Hub

Events

Leaderboard

Notifications

Profile

Settings

---

# Flow 1 — First-Time User

Launch App

↓

Beautiful onboarding screens

↓

Choose Theme (Auto / Light / Dark)

↓

Allow Location Permission

↓

Notification Permission

↓

Continue as:

• Guest

• Sign in with Google

• Email Login

↓

Home Feed

---

# Flow 2 — Guest User

Open Website

↓

View Home Feed

↓

Browse Live AQI

↓

View Map

↓

Read Knowledge Hub

↓

View Events

↓

Attempt Like / Comment / Report

↓

Prompt to Sign In

---

# Flow 3 — User Registration

Google / Email

↓

Create Profile

↓

Choose Username

↓

Select City

↓

Choose Interests

Examples:

• Air Quality

• Plantation

• Recycling

• Water Conservation

↓

Finish

↓

Welcome Screen

↓

Receive Eco Starter Badge

---

# Flow 4 — Anonymous Pollution Report

Tap Report

↓

Choose Anonymous Mode

↓

Capture Photo / Video

↓

GPS Location

↓

Optional Description

↓

AI Analysis

↓

Preview

↓

Submit

↓

Tracking ID Generated

↓

Status Updates Available

No account required.

---

# Flow 5 — Logged-in Pollution Report

Tap Report

↓

Take Photo

↓

Upload

↓

Location Auto Detected

↓

AI Detects

• Smoke

• Dust

• Fire

• Plastic Waste

↓

User Reviews AI Results

↓

Add Notes

↓

Submit

↓

Eco Points Earned

↓

Report Appears on Map (after verification)

---

# Flow 6 — AI Verification

Image Uploaded

↓

Computer Vision Model

↓

Detect Pollution Category

↓

Calculate Confidence Score

↓

Cross-check Nearby Reports

↓

Compare AQI

↓

Compare Weather

↓

Generate Trust Score

↓

Decision

Verified

Needs Review

Rejected

---

# Flow 7 — Community Feed

Open Home

↓

Infinite Scroll

↓

Like

↓

Comment

↓

Share

↓

Save

↓

Follow User

↓

Open Post Details

↓

View AI Summary

↓

Related Nearby Reports

---

# Flow 8 — Interactive Map

Open Map

↓

Current Location

↓

Live AQI Layer

↓

Toggle Layers

• Heatmap

• Reports

• Weather

• Plantation

• Construction

↓

Tap Marker

↓

Open Bottom Sheet

↓

View Photos

↓

Navigate

↓

Report Similar Issue

---

# Flow 9 — Alerts

Receive Push Notification

↓

Open Alert

↓

Map Focuses on Area

↓

AI Summary

↓

Health Recommendation

↓

Suggested Action

↓

Share Alert

---

# Flow 10 — Knowledge Hub

Open Knowledge

↓

Featured Videos

↓

Government Articles

↓

WHO Guidelines

↓

Climate News

↓

Bookmarks

↓

Continue Watching

---

# Flow 11 — Event Participation

Open Events

↓

Nearby Events

↓

Open Details

↓

Join Event

↓

Calendar Reminder

↓

Navigate

↓

Check In

↓

Upload Photos

↓

Receive Eco Points

---

# Flow 12 — Profile

Open Profile

↓

Statistics

↓

Eco Score

↓

Badges

↓

Posts

↓

Saved Reports

↓

Achievements

↓

Settings

---

# Flow 13 — Notifications

Open Notification Center

↓

Environmental Alerts

↓

Community Activity

↓

Followers

↓

Comments

↓

Events

↓

Government Updates

↓

Mark as Read

---

# Flow 14 — Search

Tap Search

↓

Recent Searches

↓

Trending Topics

↓

Search

Users

Cities

Hashtags

Reports

Events

↓

Results

↓

Open Details

---

# Flow 15 — Municipality Officer

Login

↓

Dashboard

↓

Pending Reports

↓

Open Report

↓

View AI Analysis

↓

Assign Cleanup Team

↓

Update Status

↓

Resolved

↓

Citizen Notified

---

# Flow 16 — Moderator

Review Reports

↓

Review Comments

↓

Detect Spam

↓

Remove Fake Reports

↓

Approve Community Posts

↓

Issue Warnings

---

# Flow 17 — Super Admin

Analytics

↓

User Management

↓

API Monitoring

↓

System Health

↓

Moderators

↓

Municipal Accounts

↓

Platform Settings

---

# Error Handling

If Location Denied

↓

Allow Manual Location

If Camera Denied

↓

Gallery Upload

If AI Fails

↓

Manual Category Selection

If Network Lost

↓

Offline Queue

↓

Auto Sync Later

---

# Offline Flow

User Creates Report

↓

Saved Locally

↓

Connection Restored

↓

Automatic Upload

↓

Confirmation Notification

---

# Push Notification Journey

Pollution Detected

↓

AI Verification

↓

Nearby Users Notified

↓

Municipality Notified

↓

Resolution Update

↓

Resolved Notification

---

# Eco Reward Journey

Verified Report

↓

+20 Eco Points

↓

Leaderboard Updated

↓

Badge Unlock Check

↓

Achievement Animation

---

# UX Rules

* Never require more than 3 taps for common actions.
* Preserve unsaved work if the app is interrupted.
* Use optimistic UI updates where safe.
* Provide immediate feedback after every user action.
* Support deep links to reports, events, and user profiles.
* Every long-running action must show progress.
* Every successful action should end with a clear confirmation and the next recommended action.

---

# Critical Instruction for AI Code Editor

Implement all flows as state-driven, reusable, and accessible journeys. Navigation must be consistent across mobile and desktop. Use smooth transitions, avoid dead ends, and ensure users can always return to the previous context without losing progress.
