from flask import Flask, request, jsonify, redirect, session, url_for, send_from_directory
import json
import os
from datetime import datetime, date, time, timedelta
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from authlib.integrations.flask_client import OAuth
from flask_cors import CORS
import user_manager
import skill_manager
import session_manager
import matching
from db import fetch_one, execute_query

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Secret key for session
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-for-development')

# JWT configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key-for-development')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# OAuth setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID'),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET'),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params={'access_type': 'offline'},
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
    client_kwargs={'scope': 'openid email profile'},
)

# Helper function to convert date and time objects to strings for JSON serialization
def json_serial(obj):
    if isinstance(obj, (date, time, datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

# OAuth routes
@app.route('/login/google')
def google_login():
    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/auth/google/callback')
def google_callback():
    try:
        token = google.authorize_access_token()
        resp = google.get('userinfo')
        user_info = resp.json()
        email = user_info['email']
        name = user_info['name']
        
        # Check if user exists
        query = "SELECT user_id, name FROM users WHERE email = %s"
        success, message, user = fetch_one(query, (email,))
        
        if success:
            if not user:
                # Auto-register the user
                random_password = os.urandom(16).hex()  # Generate a random password
                success, message, user_id = user_manager.create_user(name, email, random_password)
                
                if not success:
                    return jsonify({
                        'success': False,
                        'message': 'Failed to create user account: ' + message
                    }), 500
                    
                # Fetch the newly created user
                success, message, user = fetch_one(query, (email,))
            
            # Create JWT token
            access_token = create_access_token(identity=user['user_id'])
            
            # Create user object
            user_obj = {
                'user_id': user['user_id'],
                'name': user['name'],
                'email': email
            }
            
            # Redirect to dashboard with token and user info
            redirect_url = f"/dashboard.html?token={access_token}&user={json.dumps(user_obj)}"
            return redirect(redirect_url)
        else:
            # Redirect to login page with error
            return redirect("/login.html?error=Authentication+failed")
    except Exception as e:
        # Log the error
        print(f"Google OAuth error: {str(e)}")
        # Redirect to login page with error
        return redirect("/login.html?error=OAuth+error")

# User endpoints
@app.route('/api/users', methods=['GET'])
@jwt_required(optional=True)
def get_users():
    success, message, users = user_manager.get_all_users()
    return jsonify({'success': success, 'message': message, 'users': users})

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    success, message, user_id = user_manager.create_user(name, email, password)
    return jsonify({'success': success, 'message': message, 'user_id': user_id})

@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    success, message, user_data = user_manager.authenticate_user(email, password)
    
    if success and user_data:
        # Create JWT token
        access_token = create_access_token(identity=user_data['user_id'])
        return jsonify({
            'success': True, 
            'message': 'Login successful',
            'access_token': access_token,
            'user': user_data
        })
    else:
        return jsonify({'success': False, 'message': message}), 401

@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required(optional=True)
def get_user(user_id):
    success, message, user_data = user_manager.get_user_by_id(user_id)
    return jsonify({'success': success, 'message': message, 'user': user_data})

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # Check if the authenticated user is the same as the requested user
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
    
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    success, message = user_manager.update_user(user_id, name, email, password)
    return jsonify({'success': success, 'message': message})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    # Check if the authenticated user is the same as the requested user
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
    
    success, message = user_manager.delete_user(user_id)
    return jsonify({'success': success, 'message': message})

@app.route('/api/users/<int:user_id>/profile', methods=['PUT'])
@jwt_required()
def update_profile(user_id):
    # Check if the authenticated user is the same as the requested user
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
    
    data = request.json
    bio = data.get('bio')
    location = data.get('location')
    availability = data.get('availability')
    
    success, message = user_manager.update_user_profile(user_id, bio, location, availability)
    return jsonify({'success': success, 'message': message})

@app.route('/api/users/<int:user_id>/skills', methods=['GET'])
@jwt_required(optional=True)
def get_user_skills(user_id):
    success, message, skills = skill_manager.get_user_skills(user_id)
    return jsonify({'success': success, 'message': message, 'skills': skills})

@app.route('/api/users/<int:user_id>/skills/<int:skill_id>', methods=['POST'])
@jwt_required()
def add_skill(user_id, skill_id):
    # Check if the authenticated user is the same as the requested user
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
    
    success, message = skill_manager.add_user_skill(user_id, skill_id)
    return jsonify({'success': success, 'message': message})

@app.route('/api/users/<int:user_id>/skills/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def remove_skill(user_id, skill_id):
    # Check if the authenticated user is the same as the requested user
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
    
    success, message = skill_manager.remove_user_skill(user_id, skill_id)
    return jsonify({'success': success, 'message': message})

# Skill endpoints
@app.route('/api/skills', methods=['GET'])
def get_skills():
    success, message, skills = skill_manager.get_all_skills()
    return jsonify({'success': success, 'message': message, 'skills': skills})

@app.route('/api/skills', methods=['POST'])
def create_skill():
    data = request.json
    skill_name = data.get('skill_name')
    category = data.get('category')
    
    if not skill_name:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    success, message, skill_id = skill_manager.create_skill(skill_name, category)
    return jsonify({'success': success, 'message': message, 'skill_id': skill_id})

@app.route('/api/skills/<int:skill_id>', methods=['GET'])
def get_skill(skill_id):
    success, message, skill = skill_manager.get_skill_by_id(skill_id)
    return jsonify({'success': success, 'message': message, 'skill': skill})

@app.route('/api/skills/search', methods=['GET'])
def search_skills():
    search_term = request.args.get('q', '')
    success, message, skills = skill_manager.search_skills(search_term)
    return jsonify({'success': success, 'message': message, 'skills': skills})

@app.route('/api/skills/category/<category>', methods=['GET'])
def get_skills_by_category(category):
    success, message, skills = skill_manager.get_skills_by_category(category)
    return jsonify({'success': success, 'message': message, 'skills': skills})

# Session endpoints
@app.route('/api/sessions', methods=['POST'])
@jwt_required()
def create_session():
    data = request.json
    learner_id = data.get('learner_id')
    teacher_id = data.get('teacher_id')
    skill_id = data.get('skill_id')
    session_date_str = data.get('session_date')
    session_time_str = data.get('session_time')
    session_duration = data.get('session_duration')
    
    # Check if the authenticated user is either the learner or the teacher
    current_user_id = get_jwt_identity()
    if current_user_id != learner_id and current_user_id != teacher_id:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
    
    if not all([learner_id, teacher_id, skill_id, session_date_str, session_time_str, session_duration]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        session_date = datetime.strptime(session_date_str, '%Y-%m-%d').date()
        session_time = datetime.strptime(session_time_str, '%H:%M').time()
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid date or time format'}), 400
    
    success, message, session_id = session_manager.create_session(
        learner_id, teacher_id, skill_id, session_date, session_time, session_duration
    )
    return jsonify({'success': success, 'message': message, 'session_id': session_id})

@app.route('/api/sessions/<int:session_id>', methods=['GET'])
@jwt_required(optional=True)
def get_session(session_id):
    success, message, session = session_manager.get_session_by_id(session_id)
    return jsonify({'success': success, 'message': message, 'session': session})

@app.route('/api/sessions', methods=['GET'])
@jwt_required(optional=True)
def get_sessions():
    success, message, sessions = session_manager.get_all_sessions()
    return jsonify({'success': success, 'message': message, 'sessions': sessions})

@app.route('/api/sessions/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_session_route(session_id):
    # First, get the session to check if the user is authorized
    success, message, session = session_manager.get_session_by_id(session_id)
    
    if not success or not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
    
    # Check if the authenticated user is either the learner or the teacher
    current_user_id = get_jwt_identity()
    if current_user_id != session['learner_id'] and current_user_id != session['teacher_id']:
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 403
    
    data = request.json
    learner_id = data.get('learner_id')
    teacher_id = data.get('teacher_id')
    skill_id = data.get('skill_id')
    
    session_date = None
    if 'session_date' in data:
        try:
            session_date = datetime.strptime(data['session_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format'}), 400
    
    session_time = None
    if 'session_time' in data:
        try:
            session_time = datetime.strptime(data['session_time'], '%H:%M').time()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid time format'}), 400
    
    session_duration = data.get('session_duration')
    
    success, message = session_manager.update_session(
        session_id, learner_id, teacher_id, skill_id, session_date, session_time, session_duration
    )
    return jsonify({'success': success, 'message': message})

# Testimonials endpoint
@app.route('/api/testimonials', methods=['GET'])
def get_testimonials():
    # Sample testimonials data
    testimonials = [
        {
            "text": "SkillSwap helped me learn Spanish while teaching programming. It's amazing how many talented people are willing to exchange knowledge!",
            "name": "John Doe",
            "role": "Web Developer",
            "avatar": "https://api.dicebear.com/6.x/avataaars/svg?seed=1"
        },
        {
            "text": "The platform made it easy to find someone to exchange photography lessons for my graphic design skills. Highly recommended!",
            "name": "Jane Smith",
            "role": "Graphic Designer",
            "avatar": "https://api.dicebear.com/6.x/avataaars/svg?seed=2"
        },
        {
            "text": "I've been teaching piano and learning digital marketing. The skill exchange concept is brilliant and the community is so supportive!",
            "name": "Michael Johnson",
            "role": "Music Teacher",
            "avatar": "https://api.dicebear.com/6.x/avataaars/svg?seed=3"
        }
    ]
    
    return jsonify({
        'success': True,
        'message': 'Testimonials retrieved successfully',
        'testimonials': testimonials
    })

# Matching endpoints
@app.route('/api/matches', methods=['GET'])
def find_matches_route():
    skill_search = request.args.get('skill', None)
    location_filter = request.args.get('location', None)
    availability_filter = request.args.get('availability', None)
    sort_results = request.args.get('sort', 'match')
    
    success, message, matches = matching.find_matches(
        skill_search, location_filter, availability_filter, sort_results
    )
    return jsonify({'success': success, 'message': message, 'matches': matches})

@app.route('/api/users/<int:user_id>/skill-matches', methods=['GET'])
def find_skill_matches_route(user_id):
    limit = request.args.get('limit', 10, type=int)
    success, message, matches = matching.find_skill_matches(user_id, limit)
    return jsonify({'success': success, 'message': message, 'matches': matches})

@app.route('/api/users/<int:user_id>/mutual-matches', methods=['GET'])
def find_mutual_matches_route(user_id):
    limit = request.args.get('limit', 10, type=int)
    success, message, matches = matching.find_mutual_matches(user_id, limit)
    return jsonify({'success': success, 'message': message, 'matches': matches})

# Routes to serve HTML files
@app.route('/')
def index():
    return send_from_directory('.', 'home.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

# Custom JSON encoder to handle date and time objects
@app.before_request
def before_request():
    app.json.encoder = lambda obj: json.dumps(obj, default=json_serial)

if __name__ == '__main__':
    app.run(debug=True, port=5000)