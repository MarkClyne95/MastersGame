class QLearning {
    constructor(states, actions, alpha = 0.1, gamma = 0.6, epsilon = 0.1) {
        this.states = states;
        this.actions = actions;
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;

        this.qTable = new Map();
    }

    initialiseQTable() {
        for (const state of this.states) {
            const actionsMap = new Map();

            for (const action of this.actions) {
                actionsMap.set(action, 0); //initialise all Q-values to be 0
            }
            this.qTable.set(state, actionsMap)
        }
    }

    chooseAction(state) {
        if (Math.random() < this.epsilon) {
            // Explore: choose a random action
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        } else {
            // Exploit: choose the best action based on current Q-values
            const stateActions = this.qTable.get(state);

            return [...stateActions.entries()].reduce((a, b) => a[1], b[1] ? a : b)[0];
        }
    }

    updateQValue(prevState, action, reward, nextState) {
        const oldQValue = this.qTable.get(prevState).get(action);
        const maxFutureQ = Math.max(...Array.from(this.qTable.get(nextState).values()));
        const newQValue = oldQValue + this.alpha * (reward + this.gamma * maxFutureQ - oldQValue);

        this.qTable.get(prevState).set(action, newQValue);
    }

    train(episodes, getReward, getNextState) {
        this.initialiseQTable();

        for (let i = 0; i < episodes; i++) {
            let state = this.states[Math.floor(Math.random() * this.states.length)];

            while (true) {
                const action = this.chooseAction(state);
                const nextState = getNextState(state, action);
                const reward = getReward(state, action, nextState);

                this.updateQValue(state, action, reward, nextState);
                state = nextState;

                if (state === 'terminal') {
                    break;
                }
            }
        }
    }

    getReward(state, action, nextState) {

    }

    getNextState(state, action) {

    }
}