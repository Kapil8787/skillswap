import mysql.connector
from typing import List, Dict, Tuple, Any, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='db_operations.log'
)
logger = logging.getLogger('db')

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'skillswap_user',
    'password': 'your_password',  # Replace with actual password in production
    'database': 'skillswap_db'  # Make sure this matches your created database name
}

def get_db_connection():
    """
    Creates and returns a connection to the database.
    Returns:
        mysql.connector.connection.MySQLConnection: Database connection object
    """
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        logger.error(f"Database connection error: {err}")
        return None

def execute_query(query: str, params: tuple = None) -> bool:
    """
    Executes a query that modifies the database (INSERT, UPDATE, DELETE).
    Args:
        query: SQL query to execute
        params: Parameters for the query
    Returns:
        bool: True if the query was executed successfully, False otherwise
    """
    connection = get_db_connection()
    if not connection:
        return False
    
    cursor = connection.cursor()
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        connection.commit()
        return True
    except mysql.connector.Error as err:
        logger.error(f"Query execution error: {err}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

def fetch_one(query: str, params: tuple = None) -> Tuple[bool, str, Optional[Dict]]:
    """
    Fetches a single row from the database.
    Args:
        query: SQL query to execute
        params: Parameters for the query
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - Dict or None: The fetched row as a dictionary, or None if no row was found
    """
    connection = get_db_connection()
    if not connection:
        return False, "Database connection failed", None
    
    cursor = connection.cursor(dictionary=True)
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        result = cursor.fetchone()
        if result:
            return True, "Data fetched successfully", result
        else:
            return True, "No data found", None
    except mysql.connector.Error as err:
        logger.error(f"Query execution error: {err}")
        return False, f"Error fetching data: {err}", None
    finally:
        cursor.close()
        connection.close()

def fetch_all(query: str, params: tuple = None) -> Tuple[bool, str, List[Dict]]:
    """
    Fetches multiple rows from the database.
    Args:
        query: SQL query to execute
        params: Parameters for the query
    Returns:
        Tuple containing:
            - bool: True if the query was executed successfully, False otherwise
            - str: A message indicating the result of the operation
            - List[Dict]: The fetched rows as a list of dictionaries, or an empty list if no rows were found
    """
    connection = get_db_connection()
    if not connection:
        return False, "Database connection failed", []
    
    cursor = connection.cursor(dictionary=True)
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        results = cursor.fetchall()
        return True, f"Data fetched successfully. {len(results)} rows found.", results
    except mysql.connector.Error as err:
        logger.error(f"Query execution error: {err}")
        return False, f"Error fetching data: {err}", []
    finally:
        cursor.close()
        connection.close()