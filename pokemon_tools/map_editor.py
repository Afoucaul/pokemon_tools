from flask import request
from PIL import Image
import io
from .engine import world
from . import app
from . import utils


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
    data = image_source.stream.read()

    image_descriptor = io.BytesIO(data)
    image = Image.open(image_descriptor)
    image.show()

    return ""

