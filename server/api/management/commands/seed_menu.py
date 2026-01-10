"""
Management command to seed menu data for testing the luxury lounge menu.
Run with: python manage.py seed_menu
"""
from django.core.management.base import BaseCommand
from api.models import MenuCategory, MenuItem
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seeds the database with sample menu data for the luxury lounge menu'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample menu categories and items...')

        # Create Categories
        categories_data = [
            {'name': 'COCKTAILS', 'category_type': 'cocktails'},
            {'name': 'SPIRITS', 'category_type': 'beverages'},
            {'name': 'WINE SELECTION', 'category_type': 'wine'},
            {'name': 'SHISHA', 'category_type': 'shisha'},
            {'name': 'FOOD', 'category_type': 'food'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = MenuCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'category_type': cat_data['category_type'],
                    'is_active': True,
                    'display_order': 0,
                }
            )
            categories[cat_data['name']] = category
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  {status}: {cat_data["name"]}')

        # Menu Items Data
        menu_items = [
            # COCKTAILS
            {
                'category': 'COCKTAILS',
                'name': 'Negroni',
                'description': 'Gin, Campari, sweet vermouth',
                'price': Decimal('14.00'),
            },
            {
                'category': 'COCKTAILS',
                'name': 'Old Fashioned',
                'description': 'Bourbon, bitters, orange',
                'price': Decimal('15.00'),
            },
            {
                'category': 'COCKTAILS',
                'name': 'Espresso Martini',
                'description': 'Vodka, espresso, coffee liqueur',
                'price': Decimal('16.00'),
            },
            {
                'category': 'COCKTAILS',
                'name': 'Mojito',
                'description': 'White rum, lime, mint, soda',
                'price': Decimal('13.00'),
            },
            {
                'category': 'COCKTAILS',
                'name': 'Whiskey Sour',
                'description': 'Bourbon, lemon, egg white, bitters',
                'price': Decimal('14.00'),
            },
            # SPIRITS
            {
                'category': 'SPIRITS',
                'name': 'Grey Goose',
                'description': 'Premium French vodka',
                'price': Decimal('12.00'),
            },
            {
                'category': 'SPIRITS',
                'name': 'Macallan 12',
                'description': 'Single malt Scotch whisky',
                'price': Decimal('18.00'),
            },
            {
                'category': 'SPIRITS',
                'name': 'Don Julio Blanco',
                'description': 'Premium tequila',
                'price': Decimal('14.00'),
            },
            {
                'category': 'SPIRITS',
                'name': 'Hendricks Gin',
                'description': 'Scottish gin with cucumber and rose',
                'price': Decimal('13.00'),
            },
            {
                'category': 'SPIRITS',
                'name': 'Remy Martin VSOP',
                'description': 'Fine Champagne cognac',
                'price': Decimal('16.00'),
            },
            # WINE SELECTION
            {
                'category': 'WINE SELECTION',
                'name': 'Pinot Grigio (Glass)',
                'description': 'Light and crisp Italian white',
                'price': Decimal('12.00'),
            },
            {
                'category': 'WINE SELECTION',
                'name': 'Cabernet Sauvignon (Glass)',
                'description': 'Full-bodied California red',
                'price': Decimal('14.00'),
            },
            {
                'category': 'WINE SELECTION',
                'name': 'Champagne (Bottle)',
                'description': 'Moet & Chandon Imperial',
                'price': Decimal('120.00'),
            },
            {
                'category': 'WINE SELECTION',
                'name': 'Rose (Glass)',
                'description': 'Provence style, dry and refreshing',
                'price': Decimal('13.00'),
            },
            # SHISHA
            {
                'category': 'SHISHA',
                'name': 'Double Apple',
                'description': 'Classic apple blend',
                'price': Decimal('18.00'),
            },
            {
                'category': 'SHISHA',
                'name': 'Mint',
                'description': 'Fresh and cooling',
                'price': Decimal('15.00'),
            },
            {
                'category': 'SHISHA',
                'name': 'Grape Mint',
                'description': 'Sweet grape with cool mint finish',
                'price': Decimal('18.00'),
            },
            {
                'category': 'SHISHA',
                'name': 'Blueberry',
                'description': 'Rich berry flavor',
                'price': Decimal('18.00'),
            },
            {
                'category': 'SHISHA',
                'name': 'Premium Mix',
                'description': 'Natural charcoal, 60-90 min session',
                'price': Decimal('22.00'),
            },
            # FOOD
            {
                'category': 'FOOD',
                'name': 'Mezze Platter',
                'description': 'Hummus, baba ganoush, falafel, pita',
                'price': Decimal('24.00'),
            },
            {
                'category': 'FOOD',
                'name': 'Truffle Fries',
                'description': 'Hand-cut fries, truffle oil, parmesan',
                'price': Decimal('12.00'),
            },
            {
                'category': 'FOOD',
                'name': 'Cheese Board',
                'description': 'Selection of artisan cheeses, crackers, honey',
                'price': Decimal('28.00'),
            },
            {
                'category': 'FOOD',
                'name': 'Bruschetta',
                'description': 'Grilled bread, tomatoes, basil, balsamic',
                'price': Decimal('14.00'),
            },
            {
                'category': 'FOOD',
                'name': 'Grilled Halloumi',
                'description': 'Mediterranean cheese, za\'atar, olive oil',
                'price': Decimal('16.00'),
            },
        ]

        # Create Menu Items
        items_created = 0
        items_existed = 0
        for item_data in menu_items:
            category = categories.get(item_data['category'])
            if not category:
                self.stdout.write(self.style.WARNING(f'  Category not found: {item_data["category"]}'))
                continue

            item, created = MenuItem.objects.get_or_create(
                name=item_data['name'],
                category=category,
                defaults={
                    'description': item_data.get('description', ''),
                    'price': item_data['price'],
                    'is_available': True,
                    'is_featured': False,
                }
            )
            if created:
                items_created += 1
            else:
                items_existed += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created {items_created} new items, {items_existed} already existed.'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Total categories: {MenuCategory.objects.count()}'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Total menu items: {MenuItem.objects.count()}'
        ))
