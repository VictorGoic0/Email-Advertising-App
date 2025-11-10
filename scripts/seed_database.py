#!/usr/bin/env python3
"""Seed database with initial user data from JSON file."""
import json
import sys
import argparse
from pathlib import Path

# Add backend directory to path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from database import SessionLocal, engine
from models import User
from database import Base


def read_json_data(json_path: Path) -> list:
    """Read user data from JSON file.
    
    Args:
        json_path: Path to JSON file containing user data
        
    Returns:
        List of user dictionaries
    """
    with open(json_path, "r") as f:
        data = json.load(f)
    return data


def insert_users(db_session, users_data: list) -> int:
    """Insert users into database.
    
    Args:
        db_session: Database session
        users_data: List of user dictionaries
        
    Returns:
        Number of users inserted
    """
    inserted_count = 0
    
    for user_data in users_data:
        # Check if user already exists
        existing_user = db_session.query(User).filter(
            User.email == user_data["email"]
        ).first()
        
        if existing_user:
            print(f"User {user_data['email']} already exists, skipping...")
            continue
        
        # Create new user
        user = User(
            email=user_data["email"],
            password=user_data["password"],  # Plain text for MVP
            full_name=user_data["full_name"],
            role=user_data["role"],
        )
        
        db_session.add(user)
        inserted_count += 1
        print(f"Created user: {user_data['email']} ({user_data['role']})")
    
    db_session.commit()
    return inserted_count


def main():
    """Main function to seed database."""
    parser = argparse.ArgumentParser(description="Seed database with user data")
    parser.add_argument(
        "--json-file",
        type=str,
        default="../data/seed_users.json",
        help="Path to JSON file containing user data (default: ../data/seed_users.json)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop all tables and recreate them before seeding",
    )
    
    args = parser.parse_args()
    
    # Resolve JSON file path
    json_path = Path(__file__).resolve().parent / args.json_file
    if not json_path.exists():
        json_path = Path(args.json_file)
        if not json_path.exists():
            print(f"Error: JSON file not found: {json_path}")
            sys.exit(1)
    
    # Reset database if requested
    if args.reset:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("Database reset complete.")
    
    # Read user data
    print(f"Reading user data from: {json_path}")
    users_data = read_json_data(json_path)
    print(f"Found {len(users_data)} users in JSON file")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Insert users
        inserted_count = insert_users(db, users_data)
        print(f"\nSuccessfully inserted {inserted_count} users")
    except Exception as e:
        print(f"Error inserting users: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

