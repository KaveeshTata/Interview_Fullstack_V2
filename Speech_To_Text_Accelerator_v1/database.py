from sqlalchemy import create_engine, Column, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class ClientInfo(Base):
    __tablename__ = 'client_info'

    clientAPIkey = Column(String, primary_key=True)
    registered_email = Column(String)

class ModelInfo(Base):
    __tablename__ = 'model_info'

    clientAPIkey = Column(String, primary_key=True)
    mode_type = Column(String, primary_key=True)
    model_name = Column(String)

# Create the engine and session
engine = create_engine('sqlite:///stt_database.db')
Session = sessionmaker(bind=engine)
session = Session()

# Create tables if they don't exist
Base.metadata.create_all(engine)

# CRUD Operations for ClientInfo Table

def create_client_info(clientAPIkey, registered_email):
    new_client = ClientInfo(clientAPIkey=clientAPIkey, registered_email=registered_email)
    session.add(new_client)
    session.commit()

def get_client_info_by_api_key(clientAPIkey):
    return session.query(ClientInfo).filter(ClientInfo.clientAPIkey == clientAPIkey).first()

def update_registered_email(clientAPIkey, new_email):
    client = session.query(ClientInfo).filter(ClientInfo.clientAPIkey == clientAPIkey).first()
    if client:
        client.registered_email = new_email
        session.commit()

def delete_client_info(clientAPIkey):
    client = session.query(ClientInfo).filter(ClientInfo.clientAPIkey == clientAPIkey).first()
    if client:
        session.delete(client)
        session.commit()

# CRUD Operations for ModelInfo Table

def create_model_info(clientAPIkey, mode_type, model_name):
    new_model = ModelInfo(clientAPIkey=clientAPIkey, mode_type=mode_type, model_name=model_name)
    session.add(new_model)
    session.commit()

def get_models_by_client_api_key(clientAPIkey):
    return session.query(ModelInfo).filter(ModelInfo.clientAPIkey == clientAPIkey).all()

def update_model_name(clientAPIkey, mode_type, new_model_name):
    model = session.query(ModelInfo).filter(ModelInfo.clientAPIkey == clientAPIkey, ModelInfo.mode_type == mode_type).first()
    if model:
        model.model_name = new_model_name
        session.commit()

def delete_model_info(clientAPIkey, mode_type):
    model = session.query(ModelInfo).filter(ModelInfo.clientAPIkey == clientAPIkey, ModelInfo.mode_type == mode_type).first()
    if model:
        session.delete(model)
        session.commit()

def get_mode_and_model_by_api_key(clientAPIkey):
    model_info = session.query(ModelInfo).filter(ModelInfo.clientAPIkey == clientAPIkey).first()
    if model_info:
        return model_info.mode_type, model_info.model_name
    else:
        return None, None
