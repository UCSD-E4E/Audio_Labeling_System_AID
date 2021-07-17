from .create_app import app, db, migrate, jwt, redis_client

from .routes import auth, api

app.register_blueprint(auth)
app.register_blueprint(api)
