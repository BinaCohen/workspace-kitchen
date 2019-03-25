export enum NodeType {
    SPACE = " ",
    EMPLOYEE = "E",
    WALL = "W"
}

export type Route = [number, number][];

export class Node {
    id: number;
    type: NodeType;
    index: [number, number];
    visited: boolean;
    distance: number;
    parent: Node;
    sumOfDistances: number;
    connectedNodes: Node[];
    employeesRoutes:  Route[];

    constructor(id: number, type: NodeType, index: [number, number]) {
        this.id = id;
        this.type = type;
        this.index = index;
        this.visited = false;
        this.distance = Infinity;
        this.parent = null;
        this.sumOfDistances = 0;
        this.connectedNodes = new Array();
        this.employeesRoutes = new Array();
    }
}
