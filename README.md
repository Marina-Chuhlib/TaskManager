# TaskManager

A simple React Native app to manage tasks with Firebase integration.

## Features

-   Create, edit, and delete tasks
-   Mark tasks as completed
-   Set deadlines using a date picker
-   Store tasks in Firebase Firestore
-   Persist draft tasks locally using AsyncStorage
-   Prioritize tasks (low, medium, high)
-   Filtering and sorting by status, category, priority, and deadline
-   Redux Toolkit state management
-   Navigation with React Navigation

## Tech Stack

-   React Native
-   TypeScript
-   Redux Toolkit
-   React Navigation
-   Firebase (Firestore)
-   AsyncStorage
-   date-fns for date formatting

## Setup

1. Clone the repository
2. Install dependencies: `yarn`
3. Install iOS pods: `yarn pods`
4. Run the app:
    - iOS: `yarn ios`
    - Android: `yarn android`
