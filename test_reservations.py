#!/usr/bin/env python
"""Test script to create sample reservations"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from api.models import Reservation
from datetime import date, time, timedelta

def create_test_reservations():
    today = date.today()
    tomorrow = today + timedelta(days=1)

    # Test reservations data
    reservations_data = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@example.com',
            'phone': '+355691234567',
            'date': today,
            'time': time(19, 0),
            'party_size': 4,
            'occasion': 'birthday',
            'special_requests': 'Window seat please',
            'status': 'confirmed'
        },
        {
            'first_name': 'Maria',
            'last_name': 'Johnson',
            'email': 'maria.j@example.com',
            'phone': '+355692345678',
            'date': today,
            'time': time(20, 30),
            'party_size': 2,
            'occasion': 'date',
            'special_requests': 'Quiet corner preferred',
            'status': 'pending'
        },
        {
            'first_name': 'Alex',
            'last_name': 'Brown',
            'email': 'alex.brown@example.com',
            'phone': '+355693456789',
            'date': tomorrow,
            'time': time(18, 0),
            'party_size': 6,
            'occasion': 'business',
            'special_requests': 'Need projector access',
            'status': 'confirmed'
        },
        {
            'first_name': 'Emma',
            'last_name': 'Wilson',
            'email': 'emma.w@example.com',
            'phone': '+355694567890',
            'date': tomorrow,
            'time': time(21, 0),
            'party_size': 3,
            'occasion': 'anniversary',
            'dietary_restrictions': 'Vegetarian, Gluten-free',
            'status': 'pending'
        },
    ]

    print("Creating test reservations...")
    print("-" * 50)

    for data in reservations_data:
        reservation, created = Reservation.objects.get_or_create(
            email=data['email'],
            date=data['date'],
            time=data['time'],
            defaults=data
        )

        if created:
            print(f"Created: {reservation.first_name} {reservation.last_name} - {reservation.date} at {reservation.time}")
        else:
            print(f"Already exists: {reservation.first_name} {reservation.last_name} - {reservation.date} at {reservation.time}")

    print("-" * 50)
    print(f"\nTotal reservations in database: {Reservation.objects.count()}")
    print(f"Today's reservations: {Reservation.objects.filter(date=today).count()}")
    print(f"Tomorrow's reservations: {Reservation.objects.filter(date=tomorrow).count()}")

    print("\nAll reservations:")
    for r in Reservation.objects.all().order_by('date', 'time'):
        print(f"  - {r.first_name} {r.last_name} | {r.date} {r.time} | {r.party_size} guests | {r.status}")

if __name__ == '__main__':
    create_test_reservations()
