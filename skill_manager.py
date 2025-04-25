from db import fetch_one, fetch_all, execute_query
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger('skill_manager')

def create_skill(skill_name: str, category: Optional[str] = None) -> Tuple[bool, str, Optional[int]]:
    """
    Creates a new skill.
    Args:
        skill_name: The name of the skill.
        category: The category of the skill (optional).
    Returns:
        A tuple containing:
            - True if the skill was created successfully, False otherwise.
            - A message indicating the result of the operation.
            - The ID of the newly created skill if successful, None otherwise.
    """
    # Check if skill already exists
    check_query = "SELECT skill_id FROM skills WHERE skill_name = %s"
    check_result = fetch_one(check_query, (skill_name,))
    
    if check_result[0] and check_result[2]:
        return False, "Skill already exists", None
    
    query = "INSERT INTO skills (skill_name, category) VALUES (%s, %s)"
    params = (skill_name, category)
    success = execute_query(query, params)
    if success:
        # Fetch the last inserted ID to return the skill_id
        skill_id_result = fetch_one("SELECT LAST_INSERT_ID() as skill_id")
        if skill_id_result[0]:  # Check if the query was successful
            skill_id = skill_id_result[2]['skill_id']
            return True, "Skill created successfully", skill_id
        else:
            return True, "Skill created successfully, but failed to retrieve skill ID", None
    else:
        return False, "Failed to create skill", None

def get_skill_by_id(skill_id: int) -> Tuple[bool, str, Optional[Dict]]:
    """
    Retrieves a skill by its ID.
    
    Args:
        skill_id: The ID of the skill to retrieve
        
    Returns:
        Tuple containing:
            - bool: True if the skill was found, False otherwise
            - str: A message indicating the result of the operation
            - Dict or None: Skill data if the skill was found, None otherwise
    """
    query = "SELECT skill_id, skill_name, category FROM skills WHERE skill_id = %s"
    params = (skill_id,)
    return fetch_one(query, params)

def get_all_skills() -> Tuple[bool, str, List[Dict]]:
    """
    Retrieves all skills.
    
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - List[Dict]: All skills as a list of dictionaries
    """
    query = "SELECT skill_id, skill_name, category FROM skills"
    return fetch_all(query)

def get_skills_by_category(category: str) -> Tuple[bool, str, List[Dict]]:
    """
    Retrieves all skills in a specific category.
    
    Args:
        category: The category to filter by
        
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - List[Dict]: Skills in the specified category as a list of dictionaries
    """
    query = "SELECT skill_id, skill_name, category FROM skills WHERE category = %s"
    params = (category,)
    return fetch_all(query, params)

def update_skill(skill_id: int, skill_name: Optional[str] = None, category: Optional[str] = None) -> Tuple[bool, str]:
    """
    Updates a skill's information.
    
    Args:
        skill_id: The ID of the skill to update
        skill_name: New name for the skill (optional)
        category: New category for the skill (optional)
        
    Returns:
        Tuple containing:
            - bool: True if the skill was updated successfully, False otherwise
            - str: A message indicating the result of the operation
    """
    query_parts = []
    params = []
    if skill_name:
        query_parts.append("skill_name = %s")
        params.append(skill_name)
    if category:
        query_parts.append("category = %s")
        params.append(category)
    if not query_parts:
        return False, "No updates specified"
    query = "UPDATE skills SET " + ", ".join(query_parts) + " WHERE skill_id = %s"
    params.append(skill_id)
    success = execute_query(query, tuple(params))
    if success:
        return True, "Skill updated successfully"
    else:
        return False, "Failed to update skill"

def delete_skill(skill_id: int) -> Tuple[bool, str]:
    """
    Deletes a skill.
    
    Args:
        skill_id: The ID of the skill to delete
        
    Returns:
        Tuple containing:
            - bool: True if the skill was deleted successfully, False otherwise
            - str: A message indicating the result of the operation
    """
    query = "DELETE FROM skills WHERE skill_id = %s"
    params = (skill_id,)
    success = execute_query(query, params)
    if success:
        return True, "Skill deleted successfully"
    else:
        return False, "Failed to delete skill"

def add_user_skill(user_id: int, skill_id: int) -> Tuple[bool, str]:
    """
    Adds a skill to a user.
    
    Args:
        user_id: The ID of the user
        skill_id: The ID of the skill to add
        
    Returns:
        Tuple containing:
            - bool: True if the skill was added successfully, False otherwise
            - str: A message indicating the result of the operation
    """
    # First, check if the association already exists
    check_query = "SELECT 1 FROM user_skills WHERE user_id = %s AND skill_id = %s"
    check_params = (user_id, skill_id)
    check_result = fetch_one(check_query, check_params)
    if check_result[0] and check_result[2]:
        return False, "User already has this skill"
    
    query = "INSERT INTO user_skills (user_id, skill_id) VALUES (%s, %s)"
    params = (user_id, skill_id)
    success = execute_query(query, params)
    if success:
        return True, "Skill added to user successfully"
    else:
        return False, "Failed to add skill to user"

def remove_user_skill(user_id: int, skill_id: int) -> Tuple[bool, str]:
    """
    Removes a skill from a user.
    
    Args:
        user_id: The ID of the user
        skill_id: The ID of the skill to remove
        
    Returns:
        Tuple containing:
            - bool: True if the skill was removed successfully, False otherwise
            - str: A message indicating the result of the operation
    """
    query = "DELETE FROM user_skills WHERE user_id = %s AND skill_id = %s"
    params = (user_id, skill_id)
    success = execute_query(query, params)
    if success:
        return True, "Skill removed from user successfully"
    else:
        return False, "Failed to remove skill from user"

def get_user_skills(user_id: int) -> Tuple[bool, str, List[Dict]]:
    """
    Retrieves all skills for a given user.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - List[Dict]: The user's skills as a list of dictionaries
    """
    query = """
    SELECT s.skill_id, s.skill_name, s.category
    FROM skills s
    JOIN user_skills us ON s.skill_id = us.skill_id
    WHERE us.user_id = %s
    """
    params = (user_id,)
    return fetch_all(query, params)

def get_users_with_skill(skill_id: int) -> Tuple[bool, str, List[Dict]]:
    """
    Retrieves all users who possess a given skill.
    
    Args:
        skill_id: The ID of the skill to search for
        
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - List[Dict]: Users with the specified skill as a list of dictionaries
    """
    query = """
    SELECT u.user_id, u.name, u.email
    FROM users u
    JOIN user_skills us ON u.user_id = us.user_id
    WHERE us.skill_id = %s
    """
    params = (skill_id,)
    return fetch_all(query, params)

def search_skills(search_term: str) -> Tuple[bool, str, List[Dict]]:
    """
    Searches for skills by name or category.
    
    Args:
        search_term: The term to search for
        
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - List[Dict]: Matching skills as a list of dictionaries
    """
    query = """
    SELECT skill_id, skill_name, category
    FROM skills
    WHERE skill_name LIKE %s OR category LIKE %s
    """
    search_pattern = f"%{search_term}%"
    params = (search_pattern, search_pattern)
    
    return fetch_all(query, params)