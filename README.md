# USOF

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-green) ![MySQL](https://img.shields.io/badge/MySQL-Database-blue) 

> **USOF** is a forum platform inspired by Stack Overflow, designed for programmers and enthusiasts. It allows users to create accounts, post questions, comment, and like content. Administrators can manage content and users via an integrated AdminJS panel. This is the frontend for the web application, which provides functionalities like user registration, login, post creation, viewing posts, filtering content by category, interacting with other users through comments and likes, and more. The frontend interacts with the backend API to provide a smooth user experience, supporting features like email confirmation, post management, and user authentication.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Frontend Features Overview](#frontend-features-overview)
- [Key Sections](#key-sections)
- [License](#license)

---

## Tech Stack
- **React.js** — for building the user interface
- **Redux** — for managing application state
- **React Router** — for routing and page navigation
- **Axios** — for making HTTP requests to the server
- **Tailwind CSS** — for styling and layout
- **Font Awesome** — for icons
- **React Icons** — for additional icons
## Features

---

## Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org) version 14.0.0 or higher
- [MySQL](https://www.mysql.com/) database
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   git clone [usof_backend_alukash](https://github.com/AntonLukash/usof_backend)

2. **Configure file `config.json`:**
   Change the user and password to your existing user. Example:
   - `"user": "alukash"` to `"user": "name_of_your_user"`
  
   - `"password": "alukash"` to `"password": "your_own_password"`,
   
4. **Install all dependencies:**
   npm install
   
5. **Set up the MySQL database:**
   - In file `db.sql` change username 'alukash' to your own exist user.
   - Run the SQL script from file `db.sql` to create tables and insert test data.

6. **Start the server:**

   npm start
   
7. **Clone the repository for frontend part:**
   git clone [usof_frontend_alukash](https://github.com/AntonLukash/usof_frontend)
   Make sure that your backend part is located in API diractory

8. **Install all dependencies for frontend part:**
   npm install

9. **Start the client:**

   npm start

Access the API at [http://localhost:5000](http://localhost:5000).
Access the Client at [http://localhost:3000](http://localhost:3000).

---
## Frontend Features Overview

### 1. Authentication

#### Registration

Users can register by providing their `login`, `email`, `password`, and `passwordConfirmation`. Once registered, they can log in to access the platform and manage their posts.

#### Login

Upon successful login, the user will receive a JWT token, which is used for authentication in subsequent requests. If the user is not confirmed via email, they will receive an error message prompting them to confirm their email.

#### Password Reset

Users can request a password reset via their email address. If the user exists, they will receive a link to reset their password.

---

### 2. User Profile Management

#### View Profile

Authenticated users can view their profile, which includes their `login`, `email`, `avatar`, and `rating`. The profile can be updated by changing the avatar or modifying the full name.

#### Update Avatar

Users can update their avatar through a file upload form. The new avatar image is saved and displayed on the user's profile.

#### Delete Account

Authenticated users can delete their accounts. This action will permanently remove all their data from the system.

---

### 3. Posts

#### Fetch All Posts

Users can view all posts available on the platform. The posts can be filtered by categories and sorted by date or popularity.

#### Create Post

Users can create a new post by providing a title, content, and selecting categories. Each post can also have comments.

#### Update Post

Authenticated users (the author or admin) can update their own posts. This includes changing the title, content, or associated categories.

#### Delete Post

Authenticated users (the author or admin) can delete posts. Once deleted, the post is permanently removed from the system.

#### Pinning Posts (Admin Feature)

Admin users can pin up to 3 posts. Pinned posts will be highlighted and displayed at the top of popular categories. If no posts are pinned, the section remains hidden for regular users. *It will be implemented in near future

---

### 4. Comments

#### Fetch Comments

Users can fetch all comments associated with a particular post. Comments are displayed in chronological order.

#### Add Comment

Authenticated users can add comments to posts. The comment will be displayed below the post content.

#### Delete Comment

Users can delete their own comments. Admins can delete any comment on the platform.

---

### 5. Likes

#### Like a Post

Authenticated users can like or dislike a post. The total like/dislike count is displayed on each post. A post can be liked or disliked only once by each user.

#### Remove Like

Authenticated users can remove their like/dislike from a post at any time.

---

### 6. Categories

#### View Categories

Users can view all available categories and filter posts based on them.

#### Popular Categories

On the homepage, popular categories are displayed. Users can click on a category to filter posts based on the selected category.

#### Admin Functions for Categories

Admin users can manage categories, including adding, updating, or removing categories.

---

### Key Sections:
1. **Authentication**: User registration and login.
2. **Users**: User profile and management.
3. **Posts**: Fetching, creating, and managing posts.
4. **Saved Posts**: Saving and removing posts.
5. **Comments**: Adding and deleting comments.
6. **Likes**: Liking and unliking posts.
7. **Admin Panel**: Admin functionality for managing posts, users, etc.

---

## License

This project is licensed under the ISC License. MIT © Anton
