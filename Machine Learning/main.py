from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from q_learn import QLearn, FileManipulation
import time

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
npc_loc = [0, 0]
action = ""

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('message')
def handle_message(data):
    npc_loc = (data['x'], data['y'])
    action = QLearn.do_action(npc_loc[0], npc_loc[1])
    emit('action', {'data': f'{action}'})
    time.sleep(1000)

def execute():
    action = QLearn.do_action(npc_loc[0], npc_loc[1])
    if socketio.server.connected.sockets:
        emit('action', {'data': f'{action}'})
    else:
        print("No clients connected")
    time.sleep(4)
    
if __name__ == '__main__':
    FileManipulation.load()
    socketio.run(app)
    

