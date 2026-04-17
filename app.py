from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# 1. DEFINE APP FIRST (This fixes the NameError)
app = Flask(__name__)
CORS(app)

# 2. CONFIGURE DATABASE
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bakery.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 3. DEFINE MODEL
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "stock": self.stock
        }

# Create tables
with app.app_context():
    db.create_all()

# 4. DEFINE ROUTES (After 'app' is created)
@app.route('/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'POST':
        data = request.json
        new_prod = Product(
            name=data['name'], 
            category=data['category'], 
            price=data['price'], 
            stock=data['stock']
        )
        db.session.add(new_prod)
        db.session.commit()
        return jsonify(new_prod.to_dict()), 201
    
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])

@app.route('/products/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_single_product(id):
    product = Product.query.get_or_404(id)

    if request.method == 'PUT':
        data = request.json
        product.name = data['name']
        product.category = data['category']
        product.price = data['price']
        product.stock = data['stock']
        db.session.commit()
        return jsonify(product.to_dict())

    if request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return '', 204

    return jsonify(product.to_dict())

# 5. START SERVER
if __name__ == '__main__':
    app.run(debug=True, port=5000)