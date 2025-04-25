from db import fetch_one, fetch_all, execute_query
from typing import List, Dict, Tuple
from datetime import date, time

def create_session(
    learner_id: int,
    teacher_id: int,
    skill_id: int,
    session_date: date,
    session_time: time,
    session_duration: int  # in minutes
) -> Tuple[bool, str, int]:  # Returns success, message, session_id
    """
    Creates a new session.
    Args:
        learner_id: ID of the learner.
        teacher_id: ID of the teacher.
        skill_id: ID of the skill being taught.
        session_date: Date of the session.
        session_time: Time of the session.
        session_duration: Duration of the session in minutes.
    Returns:
        A tuple containing:
            - True if the session was created successfully, False otherwise.
            - A message indicating the result of the operation.
            - The ID of the newly created session if successful, -1 otherwise.
    """
    query = """
    INSERT INTO sessions (learner_id, teacher_id, skill_id, session_date, session_time, session_duration)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    params = (learner_id, teacher_id, skill_id, session_date, session_time, session_duration)
    success = execute_query(query, params)
    if success:
        # Fetch the last inserted ID
        session_id_result = fetch_one("SELECT LAST_INSERT_ID() as session_id")
        if session_id_result[0]:
            session_id = session_id_result[2]['session_id']
            return True, "Session created successfully", session_id
        else:
            return True, "Session created successfully, but failed to retrieve session ID", -1
    else:
        return False, "Failed to create session", -1

def get_session_by_id(session_id: int) -> Tuple[bool, str, Dict]:
    """Retrieves a session by its ID."""
    query = """
    SELECT
        session_id,
        learner_id,
        teacher_id,
        skill_id,
        session_date,
        session_time,
        session_duration
    FROM
        sessions
    WHERE
        session_id = %s
    """
    params = (session_id,)
    return fetch_one(query, params)

def get_all_sessions() -> Tuple[bool, str, List[Dict]]:
    """Retrieves all sessions."""
    query = """
    SELECT
        session_id,
        learner_id,
        teacher_id,
        skill_id,
        session_date,
        session_time,
        session_duration
    FROM
        sessions
    """
    return fetch_all(query)

def update_session(
    session_id: int,
    learner_id: int = None,
    teacher_id: int = None,
    skill_id: int = None,
    session_date: date = None,
    session_time: time = None,
    session_duration: int = None
) -> Tuple[bool, str]:
    """
    Updates a session's information.
    Args:
        session_id: ID of the session to update.
        learner_id:  New ID of the learner (optional).
        teacher_id:  New ID of the teacher (optional).
        skill_id:    New ID of the skill (optional).
        session_date: New date of the session (optional).
        session_time: New time of the session (optional).
        session_duration: New duration of the session in minutes (optional).
    Returns:
        A tuple containing:
            - True if the session was updated successfully, False otherwise.
            - A message indicating the result of the operation.
    """
    query_parts = []
    params = []
    if learner_id is not None:
        query_parts.append("learner_id = %s")
        params.append(learner_id)
    if teacher_id is not None:
        query_parts.append("teacher_id = %s")
        params.append(teacher_id)
    if skill_id is not None:
        query_parts.append("skill_id = %s")
        params.append(skill_id)
    if session_date is not None:
        query_parts.append("session_date = %s")
        params.append(session_date)
    if session_time is not None:
        query_parts.append("session_time = %s")
        params.append(session_time)
    if session_duration is not None:
        query_parts.append("session_duration = %s")
        params.append(session_duration)
    if not query_parts:
        return False, "No updates specified"
    query = "UPDATE sessions SET " + ", ".join(query_parts) + " WHERE session_id = %s"
    params.append(session_id)
    success = execute_query(query, tuple(params))
    if success:
        return True, "Session updated successfully"
    else:
        return False, "Failed to update session"