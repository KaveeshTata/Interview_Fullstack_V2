from sqlalchemy import Column, Integer, String, ForeignKey, SmallInteger
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.schema import PrimaryKeyConstraint
import json

Base = declarative_base()

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    user = relationship("User", back_populates="refresh_tokens")

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(128))
    email = Column(String(50), unique=True, nullable=False)
    firstname = Column(String(50))
    lastname = Column(String(50))
    contact_number = Column(String(20))
    contact_number_verification = Column(Integer, nullable=True, default=False)
    temp_otp = Column(String(6))  # Change the length as needed
    roles = Column(String(50))  # Store roles 
    
    transactions = relationship("Transaction", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user")

    def _init_(self, username, password, email, roles, **kwargs):
        self.username = username
        self.password = password
        self.email = email
        self.roles = json.dumps(roles)


class Question(Base):
    __tablename__ = "questions"
    
    qid = Column(Integer, primary_key=True, autoincrement=True)
    question = Column(String(200))
    question_type = Column(String(20))
    selected_flag = Column(SmallInteger, default=0,nullable=False) 
    transactions = relationship("Transaction", back_populates="question")

class Transaction(Base):
    __tablename__ = "transactions"
    
    username = Column(String(50), ForeignKey("users.username"), nullable=False)
    session_id = Column(Integer, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.qid"), nullable=False)
    videoflag = Column(SmallInteger, nullable=True)
    promptflag = Column(SmallInteger, nullable=True)
    llmflag = Column(SmallInteger, nullable=True)
    result = Column(String(500),nullable=True)
    user = relationship("User", back_populates="transactions")
    question = relationship("Question", back_populates="transactions")
    
    __table_args__ = (
        PrimaryKeyConstraint("username", "session_id", "question_id"),
    )