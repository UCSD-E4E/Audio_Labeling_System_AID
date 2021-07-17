import argparse
import os
import prep_create_admin
from backend.models import User, Role
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

msg = "Adds admin user to the application"
parser = argparse.ArgumentParser(description=msg)

parser.add_argument("--username", type=str, help="Admin username",
                    required=True)
parser.add_argument("--password", type=str, help="Admin password",
                    required=True)

args = parser.parse_args()

engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)

session = Session()

username = args.username
password = args.password

print(f"Creating account for {username}")

try:
    user = Role(id=1, role='admin')

    admin = Role(id=2, role='user')

    session.add_all([user, admin])
    session.commit()
except Exception as e:
    print("Error creating roles")
    print(e)

try:
    user = User(username=username, role_id="1")
    user.set_password(password)
    session.add(user)
    session.commit()
    print("Account created!")
except Exception as e:
    print("Error creating admin user")
    print(e)
