from . import app

@app.route("/hi")
def greet():
    return "hello"
