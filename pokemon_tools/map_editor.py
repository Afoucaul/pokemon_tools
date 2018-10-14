from flask import request, jsonify
from PIL import Image
import io
from .engine import world
from . import app
import base64


@app.route("/map")
def greet():
    return "hello"


@app.route("/map/convert", methods=['POST'])
def convert():
     received_world = request.form['map']
     return b'hello'


@app.route("/map/tileset/prepare", methods=['POST'])
def prepare_tileset():
    image_source = request.files['image']
    width = int(request.form['tileWidth'])
    height = int(request.form['tileHeight'])

    data = image_source.stream.read()
    image_descriptor = io.BytesIO(data)
    original = Image.open(image_descriptor)

    tiles = []
    for i in range(original.width // width):
        for j in range(original.height // height):
            rect = ((width)*i, (height)*j, (width)*(i+1) - 1, (height)*(j+1) - 1)
            tile = original.crop(rect)

            output = io.BytesIO()
            tile.save(output, format='PNG')
            png = base64.b64encode(output.getvalue()).decode('ascii')
            tiles.append(png)

    return jsonify({'tiles': tiles})
