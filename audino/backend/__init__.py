from .create_app import app, db, migrate, jwt, redis_client
from .init_routes import (
    app, db, migrate, jwt, redis_client, auth, api
)
