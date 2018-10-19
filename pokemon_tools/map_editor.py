from . import app
from .engine.world import World
from .utils import get_body
from PIL import Image
from flask import request, jsonify, send_file
import base64
import io
import numpy as np
import pickle

import time


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
            rect = ((width)*i, (height)*j, (width)*(i+1), (height)*(j+1))
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
    data = data.replace("{}.".format(__name__.split('.', 1)[0]).encode('ascii'), b'')

    return send_file("../oui", mimetype="application/octet-stream")


@app.route("/map/load", methods=['POST'])
def convert_pickled_world():
    world_source = request.files['world']
    data = world_source.stream.read()
    data = data.replace(b'engine', b'pokemon_tools.engine', 1)
    world = pickle.loads(data)

    return world_to_json(world)


def world_to_json(world):
    as_json = {
        "lowerTiles":   world.lower_tiles.tolist(),
        "upperTiles":   world.upper_tiles.tolist(),
        "collisions":   world.collisions.tolist(),
        "events":       [],
        "npcs":         []
    }

    return jsonify(as_json)
