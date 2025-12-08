from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
from models import db, User
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[])