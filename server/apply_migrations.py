#!/usr/bin/env python
"""
Script to apply Django migrations.
Run this script to apply any pending migrations.
"""
import os
import sys
import django

# Add the server directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# Initialize Django
django.setup()

# Now run migrations
from django.core.management import call_command

if __name__ == '__main__':
    print("Checking for pending migrations...")
    call_command('showmigrations', 'api')
    print("\n" + "="*50)
    print("Applying migrations...")
    print("="*50 + "\n")
    call_command('migrate')
    print("\n" + "="*50)
    print("Migrations applied successfully!")
    print("="*50)
