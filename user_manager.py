from db import fetch_one, fetch_all, execute_query
from typing import List, Dict, Tuple, Optional
import hashlib
import logging

logger = logging.getLogger('user_manager')

def hash_password(password: str) -> str:
    """
    Hashes a password using SHA-256.
    In a production environment, use a more secure method like bcrypt.
    
    Args:
        password: The plain text password
        
    Returns:
        str: The hashed password
    """
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(name: str, email: str, password: str) -> Tuple[bool, str, int]:
    """
    Creates a new user.
    
    Args:
        name: User's full name
        email: User's email address
        password: User's password (will be hashed)
        
    Returns:
        Tuple containing:
            - bool: True if the user was created successfully, False otherwise
            - str: A message indicating the result of the operation
            - int: The ID of the newly created user if successful, -1 otherwise
    """
    # Check if email already exists
    check_query = "SELECT user_id FROM users WHERE email = %s"
    check_result = fetch_one(check_query, (email,))
    
    if check_result[0] and check_result[2]:
        return False, "Email already in use", -1
    
    # Hash the password
    hashed_password = hash_password(password)
    
    # Insert the new user
    insert_query = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
    insert_params = (name, email, hashed_password)
    
    success = execute_query(insert_query, insert_params)
    if success:
        # Get the user ID
        user_id_result = fetch_one("SELECT LAST_INSERT_ID() as user_id")
        if user_id_result[0]:
            user_id = user_id_result[2]['user_id']
            
            # Create an empty profile for the user
            profile_query = "INSERT INTO profiles (user_id) VALUES (%s)"
            profile_success = execute_query(profile_query, (user_id,))
            
            if profile_success:
                return True, "User created successfully", user_id
            else:
                return True, "User created but profile creation failed", user_id
        else:
            return True, "User created but failed to retrieve user ID", -1
    else:
        return False, "Failed to create user", -1

def authenticate_user(email: str, password: str) -> Tuple[bool, str, Optional[Dict]]:
    """
    Authenticates a user.
    
    Args:
        email: User's email address
        password: User's password
        
    Returns:
        Tuple containing:
            - bool: True if authentication was successful, False otherwise
            - str: A message indicating the result of the operation
            - Dict or None: User data if authentication was successful, None otherwise
    """
    # Hash the password
    hashed_password = hash_password(password)
    
    # Check credentials
    query = """
    SELECT user_id, name, email
    FROM users
    WHERE email = %s AND password = %s
    """
    params = (email, hashed_password)
    
    result = fetch_one(query, params)
    if result[0]:
        if result[2]:
            return True, "Authentication successful", result[2]
        else:
            return False, "Invalid credentials", None
    else:
        return False, "Authentication failed", None

def get_user_by_id(user_id: int) -> Tuple[bool, str, Optional[Dict]]:
    """
    Retrieves a user by their ID.
    
    Args:
        user_id: The ID of the user to retrieve
        
    Returns:
        Tuple containing:
            - bool: True if the user was found, False otherwise
            - str: A message indicating the result of the operation
            - Dict or None: User data if the user was found, None otherwise
    """
    query = """
    SELECT u.user_id, u.name, u.email, p.bio, p.location, p.availability, p.rating
    FROM users u
    LEFT JOIN profiles p ON u.user_id = p.user_id
    WHERE u.user_id = %s
    """
    params = (user_id,)
    
    return fetch_one(query, params)

def get_user_basic_info(user_id: int) -> Tuple[bool, str, Optional[Dict]]:
    """
    Retrieves basic user information by their ID (without profile data).
    
    Args:
        user_id: The ID of the user to retrieve
        
    Returns:
        Tuple containing:
            - bool: True if the user was found, False otherwise
            - str: A message indicating the result of the operation
            - Dict or None: Basic user data if the user was found, None otherwise
    """
    query = "SELECT user_id, name, email FROM users WHERE user_id = %s"
    params = (user_id,)
    return fetch_one(query, params)

def update_user_profile(
    user_id: int,
    bio: str = None,
    location: str = None,
    availability: str = None
) -> Tuple[bool, str]:
    """
    Updates a user's profile.
    
    Args:
        user_id: The ID of the user whose profile to update
        bio: User's bio (optional)
        location: User's location (optional)
        availability: User's availability (optional)
        
    Returns:
        Tuple containing:
            - bool: True if the profile was updated successfully, False otherwise
            - str: A message indicating the result of the operation
    """
    query_parts = []
    params = []
    
    if bio is not None:
        query_parts.append("bio = %s")
        params.append(bio)
    
    if location is not None:
        query_parts.append("location = %s")
        params.append(location)
    
    if availability is not None:
        query_parts.append("availability = %s")
        params.append(availability)
    
    if not query_parts:
        return False, "No updates specified"
    
    query = "UPDATE profiles SET " + ", ".join(query_parts) + " WHERE user_id = %s"
    params.append(user_id)
    
    success = execute_query(query, tuple(params))
    if success:
        return True, "Profile updated successfully"
    else:
        return False, "Failed to update profile"

# Note: User skill management functions have been moved to skill_manager.py
# Import them from there when needed:
# from skill_manager import get_user_skills, add_user_skill, remove_user_skill

def get_all_users() -> Tuple[bool, str, List[Dict]]:
    """
    Retrieves all users with basic information.
    
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - List[Dict]: All users as a list of dictionaries
    """
    query = "SELECT user_id, name, email FROM users"
    return fetch_all(query)

def update_user(
    user_id: int, 
    name: Optional[str] = None, 
    email: Optional[str] = None, 
    password: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Updates a user's basic information.
    
    Args:
        user_id: The ID of the user to update
        name: New name for the user (optional)
        email: New email for the user (optional)
        password: New password for the user (optional, will be hashed)
        
    Returns:
        Tuple containing:
            - bool: True if the user was updated successfully, False otherwise
            - str: A message indicating the result of the operation
    """
    query_parts = []
    params = []
    
    if name:
        query_parts.append("name = %s")
        params.append(name)
        
    if email:
        # Check if email is already in use by another user
        check_query = "SELECT user_id FROM users WHERE email = %s AND user_id != %s"
        check_params = (email, user_id)
        check_result = fetch_one(check_query, check_params)
        
        if check_result[0] and check_result[2]:
            return False, "Email already in use by another user"
            
        query_parts.append("email = %s")
        params.append(email)
        
    if password:
        # Hash the password
        hashed_password = hash_password(password)
        query_parts.append("password = %s")
        params.append(hashed_password)
        
    if not query_parts:
        return False, "No updates specified"
        
    query = "UPDATE users SET " + ", ".join(query_parts) + " WHERE user_id = %s"
    params.append(user_id)
    
    success = execute_query(query, tuple(params))
    if success:
        return True, "User updated successfully"
    else:
        return False, "Failed to update user"

def delete_user(user_id: int) -> Tuple[bool, str]:
    """
    Deletes a user and all associated data.
    
    Args:
        user_id: The ID of the user to delete
        
    Returns:
        Tuple containing:
            - bool: True if the user was deleted successfully, False otherwise
            - str: A message indicating the result of the operation
    """
    # Check if user exists
    check_query = "SELECT user_id FROM users WHERE user_id = %s"
    check_result = fetch_one(check_query, (user_id,))
    
    if not check_result[0] or not check_result[2]:
        return False, "User not found"
    
    # Delete the user (cascading delete will handle related records)
    query = "DELETE FROM users WHERE user_id = %s"
    params = (user_id,)
    
    success = execute_query(query, params)
    if success:
        return True, "User deleted successfully"
    else:
        return False, "Failed to delete user"