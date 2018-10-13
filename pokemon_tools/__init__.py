from importlib import import_module
import flask
import flask_cors

version = "0.0.0"

app = flask.Flask(__name__)
flask_cors.CORS(app)
map_editor = import_module(".map_editor", __name__)
engine = import_module(".engine", __name__)
