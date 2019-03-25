export enum NodeType {
    SPACE = " ",
    EMPLOYEE = "E",
    WALL = "W"
}

export class Node {
    id: number;
    type: NodeType;
    index: [ number, number ];
    visited: boolean;
    distance: number;
    parent: Node;
    sumOfDistances: number;
    connectedNodes: Node[];

    constructor(id: number, type: NodeType, index: [ number, number ]) {
        this.id = id;
        this.type = type;
        this.index = index;
        this.visited = false;
        this.distance = Infinity;
        this.parent = null;
        this.sumOfDistances = 0;
        this.connectedNodes = new Array();
    }
}