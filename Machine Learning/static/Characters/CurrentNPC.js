let npcName;
let npcLocation;
let currentCoord = {x: 0, y: 0};
let releventLocation = { x: 0, y: 0 };
let playerLocRef;

export default class CurrentNpc {
    constructor(name, location) {
        this.setName(name);
        this.setLocation(location);
    }

    setName(name) {
        npcName = name;
    }
    getName() {
        return npcName;
    }

    setCoord(coord) {
        currentCoord = coord;
    }
    getCoord(){
        return currentCoord;
    }

    setLocation(location) {
        npcLocation = location;
    }
    getLocation() {
        return npcLocation;
    }

    getRelativeLocation(playerLoc) {
        playerLocRef = playerLoc;
        this.loc = releventLocation - playerLoc;
        return this.loc;
    }
}

