# SkillSwap

SkillSwap is a platform that allows users to exchange skills with each other. Users can register, list skills they can teach, find skills they want to learn, and schedule sessions with other users.

## Project Structure

### Frontend
- `home.html` - Homepage
- `profile.html` - User profile page
- `schedule.html` - Session scheduling page
- `feedback.html` - Feedback submission page
- CSS files for styling
- JavaScript files for client-side functionality

### Backend (Python)
- `db.py` - Database connection and query functions
- `session_manager.py` - Functions for managing sessions
- `user_manager.py` - Functions for managing users
- `skill_manager.py` - Functions for managing skills
- `matching.py` - Functions for finding and matching users based on skills
- `api.py` - Flask API endpoints for the application
- `database_schema.sql` - SQL schema for the database

## Setup Instructions

### Database Setup
1. Install MySQL if you haven't already
2. Create a MySQL user for the application:
   ```sql
   CREATE USER 'skillswap_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON skillswap_db.* TO 'skillswap_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Run the database schema script:
   ```
   mysql -u skillswap_user -p < database_schema.sql
   ```

### Python Setup
1. Install required Python packages:
   ```
   pip install mysql-connector-python flask authlib flask-jwt-extended
   ```
2. Update the database configuration in `db.py` with your actual database credentials
3. Set up environment variables for OAuth and JWT:
   ```
   # For Windows
   set SECRET_KEY=your-secret-key
   set JWT_SECRET_KEY=your-jwt-secret-key
   set GOOGLE_CLIENT_ID=your-google-client-id
   set GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # For Linux/Mac
   export SECRET_KEY=your-secret-key
   export JWT_SECRET_KEY=your-jwt-secret-key
   export GOOGLE_CLIENT_ID=your-google-client-id
   export GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
4. Run the Flask API server:
   ```
   python api.py
   ```

### Running the Application
1. Start your web server (e.g., Apache, Nginx) and configure it to serve the HTML files
2. Run the Flask API server:
   ```
   python api.py
   ```
3. Access the application through your web browser at http://localhost:5000

### API Endpoints

#### Authentication Endpoints
- `POST /api/users/login` - Authenticate a user with email and password (returns JWT token)
- `GET /login/google` - Redirect to Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback (returns JWT token)

#### User Endpoints (JWT protected)
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/{user_id}` - Get user information
- `PUT /api/users/{user_id}` - Update user basic information (requires authentication)
- `DELETE /api/users/{user_id}` - Delete a user (requires authentication)
- `PUT /api/users/{user_id}/profile` - Update user profile (requires authentication)
- `GET /api/users/{user_id}/skills` - Get user skills
- `POST /api/users/{user_id}/skills/{skill_id}` - Add a skill to a user (requires authentication)
- `DELETE /api/users/{user_id}/skills/{skill_id}` - Remove a skill from a user (requires authentication)

#### Skill Endpoints
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create a new skill
- `GET /api/skills/{skill_id}` - Get skill information
- `GET /api/skills/search?q={search_term}` - Search for skills
- `GET /api/skills/category/{category}` - Get skills by category

#### Session Endpoints (JWT protected)
- `POST /api/sessions` - Create a new session (requires authentication)
- `GET /api/sessions/{session_id}` - Get session information
- `GET /api/sessions` - Get all sessions
- `PUT /api/sessions/{session_id}` - Update a session (requires authentication)

#### Matching Endpoints
- `GET /api/matches?skill={skill}&location={location}&availability={availability}&sort={sort}` - Find matching users
- `GET /api/users/{user_id}/skill-matches?limit={limit}` - Find users with complementary skills
- `GET /api/users/{user_id}/mutual-matches?limit={limit}` - Find potential skill exchange partners

## Database Schema

### Users Table
- `user_id` - Primary key
- `name` - User's full name
- `email` - User's email address (unique)
- `password` - Hashed password

### Profiles Table
- `profile_id` - Primary key
- `user_id` - Foreign key referencing users.user_id
- `bio` - User's biography
- `location` - User's location
- `availability` - User's availability
- `rating` - User's rating (0-5)

### Skills Table
- `skill_id` - Primary key
- `skill_name` - Name of the skill
- `category` - Category of the skill

### User Skills Table
- `user_skill_id` - Primary key
- `user_id` - Foreign key referencing users.user_id
- `skill_id` - Foreign key referencing skills.skill_id

### Sessions Table
- `session_id` - Primary key
- `learner_id` - Foreign key referencing users.user_id
- `teacher_id` - Foreign key referencing users.user_id
- `skill_id` - Foreign key referencing skills.skill_id
- `session_date` - Date of the session
- `session_time` - Time of the session
- `session_duration` - Duration of the session in minutes