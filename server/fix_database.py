#!/usr/bin/env python
"""
Script to add video columns to the Event table if they don't exist.
This is a workaround for when Django migrations can't be run normally.
"""
import os
import sys
import sqlite3

# Path to the SQLite database
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db.sqlite3')

# SQL statements to add video columns
ALTER_STATEMENTS = [
    "ALTER TABLE api_event ADD COLUMN video_original VARCHAR(100) NULL",
    "ALTER TABLE api_event ADD COLUMN video_webm VARCHAR(100) NULL",
    "ALTER TABLE api_event ADD COLUMN video_status VARCHAR(20) DEFAULT 'none'",
    "ALTER TABLE api_event ADD COLUMN video_task_id VARCHAR(255) NULL",
    "ALTER TABLE api_event ADD COLUMN video_duration REAL NULL",
    "ALTER TABLE api_event ADD COLUMN video_error TEXT NULL",
]

def check_column_exists(cursor, table, column):
    """Check if a column exists in a table"""
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]
    return column in columns

def main():
    print(f"Connecting to database: {DB_PATH}")

    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database file not found at {DB_PATH}")
        return 1

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if api_event table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_event'")
        if not cursor.fetchone():
            print("ERROR: api_event table does not exist. Run initial migrations first.")
            return 1

        print("\nChecking video columns...")

        columns_to_add = {
            'video_original': "ALTER TABLE api_event ADD COLUMN video_original VARCHAR(100) NULL",
            'video_webm': "ALTER TABLE api_event ADD COLUMN video_webm VARCHAR(100) NULL",
            'video_status': "ALTER TABLE api_event ADD COLUMN video_status VARCHAR(20) DEFAULT 'none'",
            'video_task_id': "ALTER TABLE api_event ADD COLUMN video_task_id VARCHAR(255) NULL",
            'video_duration': "ALTER TABLE api_event ADD COLUMN video_duration REAL NULL",
            'video_error': "ALTER TABLE api_event ADD COLUMN video_error TEXT NULL",
        }

        added_count = 0
        for column, sql in columns_to_add.items():
            if check_column_exists(cursor, 'api_event', column):
                print(f"  ✓ Column '{column}' already exists")
            else:
                print(f"  + Adding column '{column}'...")
                cursor.execute(sql)
                added_count += 1

        if added_count > 0:
            conn.commit()
            print(f"\n✓ Added {added_count} column(s) successfully!")
        else:
            print("\n✓ All video columns already exist. No changes needed.")

        # Also update django_migrations table to mark migration as applied
        cursor.execute("""
            SELECT id FROM django_migrations
            WHERE app='api' AND name='0012_add_event_video_fields'
        """)
        if not cursor.fetchone():
            print("\nMarking migration as applied in django_migrations...")
            cursor.execute("""
                INSERT INTO django_migrations (app, name, applied)
                VALUES ('api', '0012_add_event_video_fields', datetime('now'))
            """)
            conn.commit()
            print("✓ Migration marked as applied")

        print("\n" + "="*50)
        print("Database fix completed successfully!")
        print("Please restart the Django server.")
        print("="*50)
        return 0

    except Exception as e:
        print(f"\nERROR: {e}")
        conn.rollback()
        return 1
    finally:
        conn.close()

if __name__ == '__main__':
    sys.exit(main())
