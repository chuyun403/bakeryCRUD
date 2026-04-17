import random
from app import app, db, Product

# Bakery data for randomization
names = ["Sourdough", "Baguette", "Croissant", "Ciabatta", "Rye Bread", "Focaccia", 
         "Brioche", "Pumpernickel", "Challah", "Multigrain", "Bagel", "English Muffin"]
adjectives = ["Classic", "Artisan", "Rustic", "Golden", "Honey", "Whole Wheat", "Olive", "Seeded"]
categories = ["Breads", "Pastries", "Specialty", "Breakfast"]

def seed_database():
    with app.app_context():
        # Optional: Clear existing data so you don't double up
        # db.drop_all() 
        # db.create_all()

        print("🥖 Seeding 50 bakery items...")
        
        for _ in range(50):
            # Generate random product details
            product_name = f"{random.choice(adjectives)} {random.choice(names)}"
            product_category = random.choice(categories)
            product_price = round(random.uniform(2.50, 15.00), 2)
            product_stock = random.randint(0, 40) # Some will be low (0-5) for testing!

            new_item = Product(
                name=product_name,
                category=product_category,
                price=product_price,
                stock=product_stock
            )
            db.session.add(new_item)
        
        db.session.commit()
        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
    