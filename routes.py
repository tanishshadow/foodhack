from flask import Flask, jsonify, request

app = Flask(__name__)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

# Get all items
@app.route('/api/items', methods=['GET'])
def get_items():
    items = []  # Replace with database query
    return jsonify(items), 200

# Get single item
@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = {}  # Replace with database query
    return jsonify(item), 200

# Create item
@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json()
    # TODO: validate and save to database
    return jsonify(data), 201

# Update item
@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.get_json()
    # TODO: validate and update in database
    return jsonify(data), 200

# Delete item
@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    return jsonify({'message': 'Item deleted'}), 204

if __name__ == '__main__':
    app.run(debug=True)