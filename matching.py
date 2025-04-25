from db import fetch_all
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger('matching')

def find_matches(
    skill_search: Optional[str] = None,
    location_filter: Optional[str] = None,
    availability_filter: Optional[str] = None,
    sort_results: Optional[str] = "match"  # Default sorting
) -> Tuple[bool, str, List[Dict]]:
    """
    Finds matching users based on search criteria.
    
    Args:
        skill_search: Filter by skill name (case-insensitive substring match).
        location_filter: Filter by location (exact match). "virtual" is a special case.
        availability_filter: Filter by availability (exact match). "any" is a special case.
        sort_results:  Sorting criteria: "match" (default - complex placeholder), "rating", "name".
        
    Returns:
        A tuple containing:
            - True if the query was successful, False otherwise.
            - A message indicating the result.
            - A list of dictionaries, where each dictionary represents a matching user.
    """
    query = """
    SELECT
        u.user_id,
        u.name,
        u.email,
        p.bio,
        p.location,
        p.availability,
        p.rating,
        s.skill_id,
        s.skill_name,
        s.category
    FROM
        users u
    LEFT JOIN
        profiles p ON u.user_id = p.user_id
    LEFT JOIN
        user_skills us ON u.user_id = us.user_id
    LEFT JOIN
        skills s ON us.skill_id = s.skill_id
    WHERE 1  -- Start with a condition that's always true to simplify AND chaining
    """
    params = []
    conditions = []
    
    if skill_search:
        conditions.append("s.skill_name LIKE %s")
        params.append(f"%{skill_search}%")  # Add wildcards for substring search
    
    if location_filter and location_filter.lower() != "virtual":
        conditions.append("p.location = %s")
        params.append(location_filter)
    
    if availability_filter and availability_filter.lower() != "any":
        conditions.append("p.availability = %s")
        params.append(availability_filter)
    
    if conditions:
        query += " AND " + " AND ".join(conditions)
    
    # Group by user to avoid duplicates due to multiple skills
    query += " GROUP BY u.user_id"
    
    # Sorting (Placeholder - "match" is complex and needs real logic)
    if sort_results == "rating":
        query += " ORDER BY p.rating DESC"
    elif sort_results == "name":
        query += " ORDER BY u.name ASC"
    else:  # Default or "match"
        query += " ORDER BY u.user_id"  # Placeholder - Replace with actual match logic
    
    try:
        return fetch_all(query, tuple(params) if params else None)
    except Exception as e:
        logger.error(f"Error in find_matches: {e}")
        return False, f"Error finding matches: {e}", []

def find_skill_matches(
    user_id: int,
    limit: int = 10
) -> Tuple[bool, str, List[Dict]]:
    """
    Finds users who have skills that the specified user might be interested in.
    This is a more advanced matching algorithm that looks at complementary skills.
    
    Args:
        user_id: The ID of the user to find matches for
        limit: Maximum number of matches to return
        
    Returns:
        A tuple containing:
            - True if the query was successful, False otherwise.
            - A message indicating the result.
            - A list of dictionaries, where each dictionary represents a matching user.
    """
    # This query finds users who have skills that the specified user doesn't have
    query = """
    SELECT
        u.user_id,
        u.name,
        u.email,
        p.bio,
        p.location,
        p.availability,
        p.rating,
        s.skill_id,
        s.skill_name,
        s.category,
        COUNT(DISTINCT s.skill_id) as skill_count
    FROM
        users u
    JOIN
        user_skills us ON u.user_id = us.user_id
    JOIN
        skills s ON us.skill_id = s.skill_id
    JOIN
        profiles p ON u.user_id = p.user_id
    WHERE
        s.skill_id NOT IN (
            SELECT skill_id
            FROM user_skills
            WHERE user_id = %s
        )
        AND u.user_id != %s
    GROUP BY
        u.user_id
    ORDER BY
        skill_count DESC,
        p.rating DESC
    LIMIT %s
    """
    params = (user_id, user_id, limit)
    
    try:
        return fetch_all(query, params)
    except Exception as e:
        logger.error(f"Error in find_skill_matches: {e}")
        return False, f"Error finding skill matches: {e}", []

def find_mutual_matches(
    user_id: int,
    limit: int = 10
) -> Tuple[bool, str, List[Dict]]:
    """
    Finds users who might be good for skill exchange (mutual benefit).
    Looks for users who have skills the specified user doesn't have,
    and who might be interested in skills the specified user has.
    
    Args:
        user_id: The ID of the user to find matches for
        limit: Maximum number of matches to return
        
    Returns:
        A tuple containing:
            - True if the query was successful, False otherwise.
            - A message indicating the result.
            - A list of dictionaries, where each dictionary represents a matching user.
    """
    # This complex query finds potential mutual matches
    query = """
    WITH
    -- Skills the user has
    user_has_skills AS (
        SELECT skill_id
        FROM user_skills
        WHERE user_id = %s
    ),
    
    -- Skills the user doesn't have
    user_needs_skills AS (
        SELECT s.skill_id
        FROM skills s
        WHERE s.skill_id NOT IN (
            SELECT skill_id
            FROM user_skills
            WHERE user_id = %s
        )
    ),
    
    -- Potential teachers (users who have skills the user doesn't have)
    potential_teachers AS (
        SELECT
            u.user_id,
            COUNT(DISTINCT us.skill_id) as can_teach_count
        FROM
            users u
        JOIN
            user_skills us ON u.user_id = us.user_id
        JOIN
            user_needs_skills uns ON us.skill_id = uns.skill_id
        WHERE
            u.user_id != %s
        GROUP BY
            u.user_id
    ),
    
    -- Potential learners (users who don't have skills the user has)
    potential_learners AS (
        SELECT
            u.user_id,
            COUNT(DISTINCT uhs.skill_id) as can_learn_count
        FROM
            users u
        JOIN
            user_has_skills uhs ON 1=1
        WHERE
            u.user_id != %s
            AND NOT EXISTS (
                SELECT 1
                FROM user_skills us
                WHERE us.user_id = u.user_id
                AND us.skill_id = uhs.skill_id
            )
        GROUP BY
            u.user_id
    )
    
    -- Final selection of mutual matches
    SELECT
        u.user_id,
        u.name,
        u.email,
        p.bio,
        p.location,
        p.availability,
        p.rating,
        pt.can_teach_count,
        pl.can_learn_count,
        (pt.can_teach_count + pl.can_learn_count) as match_score
    FROM
        users u
    JOIN
        profiles p ON u.user_id = p.user_id
    JOIN
        potential_teachers pt ON u.user_id = pt.user_id
    JOIN
        potential_learners pl ON u.user_id = pl.user_id
    ORDER BY
        match_score DESC,
        p.rating DESC
    LIMIT %s
    """
    params = (user_id, user_id, user_id, user_id, limit)
    
    try:
        return fetch_all(query, params)
    except Exception as e:
        logger.error(f"Error in find_mutual_matches: {e}")
        return False, f"Error finding mutual matches: {e}", []