from . import app
from .engine.world import World
from .utils import get_body
from PIL import Image
from flask import request, jsonify, send_file
import base64
import io
import json
import numpy as np
import pickle


@app.route("/map")
def greet():
    return "hello"


@app.route("/map/tileset/prepare", methods=['POST'])
def prepare_tileset():
    image_source = request.files['image']
    width = int(request.form['tileWidth'])
    height = int(request.form['tileHeight'])

    data = image_source.stream.read()
    image_descriptor = io.BytesIO(data)
    original = Image.open(image_descriptor)

    tiles = []
    for j in range(original.height // height):
        for i in range(original.width // width):
            rect = ((width)*i, (height)*j, (width)*(i+1) - 1, (height)*(j+1) - 1)
            tile = original.crop(rect)

            output = io.BytesIO()
            tile.save(output, format='PNG')
            png = base64.b64encode(output.getvalue()).decode('ascii')
            tiles.append(png)

    return jsonify({'tiles': tiles})


@app.route("/map/convert", methods=['POST'])
def convert_json_world():
    body = get_body(request)
    lower_tiles = body['lowerTiles']

    world = World(height=len(lower_tiles), width=len(lower_tiles[0]))
    world.set_layer("lower_tiles", lower_tiles)
    world.lower_tiles = np.transpose(world.lower_tiles)

    data = pickle.dumps(world)
    print(__name__.split('.', 1)[0].encode('ascii'))
    print(data)
    data = data.replace("{}.".format(__name__.split('.', 1)[0]).encode('ascii'), b'')
    print(data)
    with open("oui", 'wb') as oui:
        oui.write(data)

    return send_file(io.BytesIO(data), mimetype="application/octet-stream")
