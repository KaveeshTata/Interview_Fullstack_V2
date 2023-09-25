import os
import time
import shutil
import subprocess
import requests
from flask import Flask, request, jsonify, make_response, Blueprint, g
from flask_mail import Mail, Message
from sqlalchemy.orm import scoped_session, sessionmaker
from database import *
import smtplib
from random import randint
import asyncio

app = Flask(__name__) 

app.config['MAIL_SERVER'] = 'smtp.example.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'sivatar7@gmail.com'
app.config['MAIL_PASSWORD'] = 'Sivatar@123'
smtpobject = smtplib.SMTP('smtp.gmail.com', 587)
mail = Mail(app)
smtpobject.starttls()
smtpobject.login('sivatar7@gmail.com', 'hhdiqzrtkxrmkoyc')
def send_otp_email(email):
    otp = str(randint(100000, 999999))  # Generate a 6-digit OTP
    subject = 'Password Reset OTP'
    otpMessage = f'Your OTP for password reset is: {otp}'
    message = f'''\
   
     Subject: Appreciation

    Dear Contributor,

    Your contributed article is greatly appreciated. Looking forward to future contributions!

    Your OTP for password reset is: {otpMessage}
    '''

    msg = Message(subject, sender='sivatar7@gmail.com', recipients=[f"{email}"])
    msg.body = message
    print(f'111111 msg: {msg}')
    try:
        smtpobject.sendmail('sivatar7@gmail.com', email , message)
        print(f"{email} this is the registered email") 
        print(f'444444 msg: {mail}')
        smtpobject.quit()
        print(f'555555 msg: {mail}')
        # mail.send(msg)
        # print(f'2222222 msg: {mail}')
        print(otp)
        return otp
    except Exception as e:
        print(f'33333333 msg: {e}')
        return None

@app.route('/api/get_timestamp', methods=['POST'])
def rettime():
    try:
        timestamp = int(time.time())
        #Todo: username to be appended to timestamp
        return jsonify({"sessionid": timestamp}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/get-session')
def get_session():
    session = scoped_session(sessionmaker(bind=engine))
    return jsonify({'session': str(session)})

@app.route('/api/get_num_questions', methods=['POST'])
def get_num_questions():
    data = request.get_json()
    global num
    num=data.get("num_questions")
    global chosen_qs
    chosen_qs = get_random_questions(num)
    global questions_data
    questions_data = []
    for q in chosen_qs:
      questions_data.append({
        'qid': q.qid, 
        'question': q.question,
        'question_type': q.question_type
      })
      create_db_questions_file(questions_data)
    return jsonify({"num_questions": num}), 200

@app.route('/api/get_chosen_questions', methods=['POST'])
def get_chosen_questions():
  try:
    return jsonify({"chosen_questions": questions_data}), 200
  except Exception as e:
    return jsonify({"message": "An error occurred", "error":str(e)}),500
        
@app.route('/api/summary', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()

        # Access the data sent from the UI Flask server
        user_id = data.get('user_id')
        session_id = data.get('session_id')
        qid = data.get('question_id')
        saved_flag = data.get('question_saved_flag')
        prompt_flag = data.get('prompt_flag')
        llm_flag = data.get('llm_flag')

        # Use the data to create a transaction using your create_transaction function
        # Assuming create_transaction accepts these parameters
        create_transaction(user_id, session_id, qid, saved_flag, prompt_flag, llm_flag)

        return 'Data received and transaction created successfully', 200
    except Exception as e:
        return 'Failed to process data: ' + str(e), 500
    
@app.route('/api/dashboard', methods=['POST'])
def dashboardinfo():
    try:
        data = request.get_json()
        username = data.get('username')
        session_id = data.get('session_id')
        transactions = session.query(Transaction).filter_by(username=username, session_id=session_id).all()
        transaction_data = []
        
        for transaction in transactions:
            transaction_item = {
                "username": transaction.username,
                "sessionId": transaction.session_id,
                "questionId": transaction.question_id,
                "videoFlag": transaction.videoflag,
                "promptFlag": transaction.promptflag,
                "llmFlag": transaction.llmflag,
                "result": transaction.result
            }
            transaction_data.append(transaction_item)

        return jsonify({'transactions': transaction_data})
    
    except Exception as e:
        return 'Failed to fetch Transactions:' + str(e), 500
    
@app.route('/api/alldata', methods=['POST'])
def alldata():
    usernames = [user.username for user in session.query(User).all()]
    session_ids = [transaction.session_id for transaction in session.query(Transaction).all()]
    data={
        "usernames":usernames,
        "session_ids":session_ids
    }
    return jsonify(data)

@app.route('/api/initialdashboard', methods=['GET'])
def initialdashboard():
    usernames = [user.username for user in session.query(User).all()]
    session_ids = []
    data={
        "usernames":usernames,
        "session_ids":session_ids
    }
    print(data)
    return jsonify(data)

@app.route('/api/get_sessions',methods=['POST'])
def get_sessions():
    data = request.get_json()
    username = data.get('username')
    sessions = session.query(Transaction.session_id).filter_by(username=username).distinct().all()

    session_options = ''.join([f'<option value="{session[0]}">{session[0]}</option>' for session in sessions])
    print(session_options)
    return jsonify(session_options)
    

@app.route('/api/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()  # Expect JSON data in the request bod
        print(data)
        details=data.get("details")
        session=get_session()
        # Call the signup_user function from database.py
        result, status_code = signup_user(details, session)

        # Close the session after use
        session.close()

        return jsonify(result), status_code

    except IntegrityError:
        session.rollback()  # Rollback the session in case of an integrity error
        return {'message': 'Username already registered'}, 200

    except Exception as e:
        session.rollback()  # Rollback the session in case of any other error
        return {'message': f'An error occurred: {str(e)}'}, 500
    
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()  # Assuming the client sends JSON data
        if 'username' not in data or 'password' not in data:
            return jsonify({'message': 'Username and password are required'}), 400

        username = data['username']
        password = data['password']
        print(data)
        auth_result = authenticate_user(username, password, session)
        print(auth_result)
        if auth_result['status'] == 'success':
            user_data = {
                'username': username,
                'roles': auth_result['roles']
                # Add more fields as needed
            }
            return jsonify(user_data), 200
        else:
            return jsonify({'message': auth_result['message']}), 401

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500



@app.route('/api/get-user-roles', methods=['POST'])
def get_user_roles():
    try:
        data = request.get_json()
        username = data.get('username')  # Assuming you pass the username in the request JSON

        # Fetch the user from your database based on the provided username
        user = session.query(User).filter_by(username=username).first()

        if user:
            # Use the check_user_roles function to get the roles
            roles = check_user_roles(user)
            return jsonify({'roles': roles}), 200
        else:
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

def get_session():
    """Get or create a thread-local session."""
    if not hasattr(g, 'session'):
        g.session = scoped_session(sessionmaker(bind=engine))
    return g.session

@app.route('/api/refreshtoken', methods=['POST'])
def apirefreshtoken():
    data = request.get_json()
    print(data)
    user_data=data.get("user_data")
    refresh_token=data.get("refresh_token")
    user_id=user_data["user_id"]
    new_refresh_token = RefreshToken(user_id=user_id, token=refresh_token)
    session.add(new_refresh_token)
    session.commit()
    response_data = {"token": new_refresh_token.token}
    
    print("new refresh token:", new_refresh_token)
    return jsonify(response_data)

@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()  # Extract data from the request
    user = session.query(User).filter_by(email=data['email']).first()
    if not user:
        return {'status': 'error', 'message': 'Email not registered'}, 404  # 404 for not found

    otp = send_otp_email(user.email)  # Replace with your OTP sending logic
    if otp:
        user.temp_otp = otp
        session.commit()
        return {'status': 'success', 'message': 'OTP sent to your email'}, 200  # 200 for success
    else:
        return {'status': 'error', 'message': 'Failed to send OTP. Please try again later'}, 500  # 500 for internal server error

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    data = request.get_json()  # Extract data from the request
    user = session.query(User).filter_by(email=data['email']).first()
    if not user:
        return {'status': 'error', 'message': 'Email not registered'}, 404  # 404 for not found

    if user.temp_otp == data['otp']:
        # Here, you can add the logic to clear the temporary OTP or mark it as used if needed
        return {'status': 'success', 'message': 'OTP verified'}, 200  # 200 for success
    else:
        return {'status': 'error', 'message': 'Invalid OTP'}, 401  # 401 for unauthorized

@app.route('/update_password', methods=['POST'])
def update_password():
    data = request.json  # Assuming data is sent as JSON in the POST request
    user = session.query(User).filter_by(email=data['email']).first()
    if not user:
        return {'status': 'error', 'message': 'Email not registered'}, 404  # 404 for not found
    
    new_password = data['new_password']
    user.password = generate_password_hash(new_password, method='sha256')
    session.commit()
    
    return {'status': 'success', 'message': 'Password updated successfully'}, 200  # 200 for success

@app.route('/api/create_user_directory/', methods=['POST'])
async def create_user_directory():
    try:
        data = request.get_json()
        print(data)
        username = data.get("username")
        user_directory = os.path.join(os.getcwd(), username)
        os.makedirs(user_directory, exist_ok=True)

        response_data = {
            "message": "User directory created successfully",
            "user_directory": user_directory
        }
        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

@app.route('/api/create_session', methods=['POST'])
async def create_session():
    try:
        data = request.get_json()
        print(data)
        username = data.get("user_id")  # Modify this according to your needs
        videos = data.get("videos")
        videos.sort()
        question_ids = data.get("qid")
        timestamp= data.get("timestamp")
        question_file = os.path.join(os.path.dirname(__file__), 'dbquestions.txt')

        if not username or not videos or not question_ids or not question_file:
            return jsonify({"message": "Invalid request data"}), 400

        user_directory = os.path.join(os.getcwd(), username)
            
        questions = []

        if os.path.exists(question_file):
            with open(question_file, 'r') as q_file:
                for line in q_file:
                    question = line.strip()
                    questions.append(question)
        print(questions)            

        for video, qid, question in zip(videos, question_ids, questions):
            video_path = os.path.join(user_directory, video)
            if os.path.exists(video_path):
                video_destination = video_path
                video_name = os.path.splitext(os.path.basename(video_destination))[0]
                print("*************Videoname: "+video_name+"**************")
                answer =convert_video_to_audio(video_destination, user_directory, video_name)
                add_prompt_flag(username, timestamp, qid, 1)
                result = llm_accelerator_result(answer, question)
                add_result(username, timestamp, qid, result)
                add_llm_flag(username, timestamp, qid, 1)
        response_data = {
            "message": "LLM models executed successfully",
            "user_directory": user_directory,
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
                    



def convert_video_to_audio(video_file, user_directory, video_name):
    try:
        print("Inside convert_video_to_audio function")
        audio_name = "audio_" + video_name
        audio_file = os.path.join(user_directory, f"{audio_name}.mp3")
        ffmpeg_flag=0
        if ffmpeg_flag==1:
            # ffmpeg_executable = "C:\\ffmpeg\\bin\\ffmpeg.exe"  # Replace with the actual path
            # ffmpeg_cmd = f"{ffmpeg_executable} -i {video_file} -map 0:a -acodec libmp3lame {audio_file}"
            # subprocess.run(ffmpeg_cmd, shell=True, check=True)
            ffmpeg_cmd = f"ffmpeg -i {video_file} -map 0:a -acodec libmp3lame {audio_file}"
            subprocess.run(ffmpeg_cmd, shell=True, check=True)
            configdata={
            "clientAPIkey": "Z46I-CMFJ-3TC2-9SCT",
                "video_name": audio_file
            }
        else:
            configdata={
            "clientAPIkey": "Z46I-CMFJ-3TC2-9SCT",
                "video_name": video_file
            }
        url = "http://127.0.0.1:5003/stt/upload/"
        response = requests.post(url, json=configdata)
        if response.status_code == 200:
            transcribed_text = response.json()["result"] 
        else:
            transcribed_text = ""
            print("Request was not successful. Status code:", response.status_code)
        return transcribed_text

        # audio_text_file = os.path.join(user_directory, f"{audio_name}.txt")
        # with open(audio_text_file, 'w') as f:
        #     f.write(transcribed_text)
    except Exception as e:
        print(f"Error occurred while converting video to audio: {e}")
    return None
        
def llm_accelerator_result(audio_text, question):
    try:
        print("**********LLM REQUEST SENT************")
        customer_data = {
            "clientApiKey": "Z8IS-9RVL-2SNI-PXJF",
            "modeType": "Local",
            "modelId": "Model-1",
            "promptId": "7692",
            "question": question,
            "audio_text": audio_text
        }

        url = "http://127.0.0.1:5002/llm/server"
        response = requests.post(url, json=customer_data)
        
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        
        result = response.text
        print(result)
        return result

    except requests.exceptions.RequestException as e:
        print(f"Error occurred while making the request: {e}")
    except Exception as e:
        print(f"An error occurred in llm_accelerator_result: {e}")

    return None




def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get('x-access-tokens')
        if not token:
            return jsonify({'message': 'A valid token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['public_id'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorator
# Index route

def reset_password(data):
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return {'status': 'error', 'message': 'Email not registered'}

    otp = send_otp_email(user.email)  # Replace with your OTP sending logic
    if otp:
        user.temp_otp = otp
        session.commit()
        return {'status': 'success', 'message': 'OTP sent to your email'}
    else:
        return {'status': 'error', 'message': 'Failed to send OTP. Please try again later'}

def verify_otp(data):
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return {'status': 'error', 'message': 'Email not registered'}

    if user.temp_otp == data['otp']:
        # Here, you can add the logic to clear the temporary OTP or mark it as used if needed
        return {'status': 'success', 'message': 'OTP verified'}
    else:
        return {'status': 'error', 'message': 'Invalid OTP'}
    
def update_password(data):
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return {'status': 'error', 'message': 'Email not registered'}
    
    new_password = data['new_password']
    user.password = generate_password_hash(new_password, method='sha256')
    session.commit()
    
    return {'status': 'success', 'message': 'Password updated successfully'}

if __name__ == '__main__':
   app.run(debug=True, port=5001)