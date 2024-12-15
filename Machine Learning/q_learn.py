import numpy as np
import pickle
import os
from enum import Enum

Q_table = {}
FILE_NAME = "qtable.pytxt"
alpha = 0.1
gamma = 0.9
epsilon = 0.5
next_state = (0,0)

terminal_state = (8, 7)

class Action(Enum):
        UP = 1,
        DOWN = 2,
        LEFT = 3,
        RIGHT = 4,
        Z = 5

#export the q-table to a file
class FileManipulation():
    def export_table(q_table, filename):
        with open(filename, 'wb') as fs:
            pickle.dump(q_table, fs)

    def load_q_table(filename):
        if os.path.exists(filename):
            with open(filename, 'rb') as f:
                return pickle.load(f)
        else:
            print(f"Q-table file '{filename}' not found. Creating a new one.")
            new_q_table = {}  # Create an empty Q-table
            FileManipulation.export_table(new_q_table, filename)  # Save the new Q-table
            return new_q_table
        
    def load():
        FileManipulation.load_q_table(FILE_NAME)

class QLearn:
    
        
    def update_q_table(state, action, reward, next_state):
            old_value = Q_table.get((state, action), 0)
            next_max = max([Q_table.get((next_state, a), 0) for a in Action])
            new_value = (1-alpha) * old_value * (reward + gamma + next_max)
            Q_table[(state, action)] = new_value
            print(Q_table)
            FileManipulation.export_table(Q_table, FILE_NAME)

    def choose_action(state, Q_table, epsilon):
            if np.random.rand() < epsilon:
                return np.random.choice(Action)
            else:
                q_values = [Q_table.get((state, a), 0) for a in Action]
                return np.argmax(q_values)
            
    def get_next_state_and_reward(state, action):
        x, y = state

        if action == Action.UP:
            next_state = (x, y - 1)
        elif action == Action.DOWN:
            next_state = (x, y + 1)
        elif action == Action.LEFT:
            next_state = (x - 1, y)
        elif action == Action.RIGHT:
            next_state = (x + 1, y)
        else:
            next_state = (x, y)

        reward = -1
            
        #Reward function:
        reward = -0.1  # Base reward for taking a step
        if next_state is terminal_state:
            reward = 10  # Reward for reaching the goal
            print("Ladies and gents, we gottem.")
            
            
            
        else:
            next_state = (x, y)
            reward = 0
            

        return next_state, reward

    def do_action(x, y):
        state = (x, y)
        action = QLearn.choose_action(state, Q_table, epsilon)
        print(f'Action: {action}', flush=True)
        next_state, reward = QLearn.get_next_state_and_reward(state, action)
        QLearn.update_q_table(state, action, reward, next_state)
        #print(reward)

        return action

    def __init__(self):
        global Q_table
        Q_table = FileManipulation.load_q_table(FILE_NAME)
    