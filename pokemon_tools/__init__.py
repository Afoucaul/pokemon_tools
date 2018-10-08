from importlib import import_module
import flask

version = "0.0.0"

app = flask.Flask(__name__)
map_editor = import_module(".map_editor", __name__)
