import { Node, NodeType } from "./node";

export class Workspace {
    private workspacePlan: string[][] = new Array();
    private employeesIndexes: [number, number][] = new Array();
    private nodesMatrix: Node[][] = new Array();
    private nodesMap: Map<number, Node> = new Map();
    kitchenLocation: [number, number];

    constructor(input: string) {
        this.parseWorkspacePlanInput(input);
        this.saveWorkersIndexes();
        this.initNodesMatrix();
        this.initNodeMap();
    }
//Divide the string containing the file content into a matrix of characters
    private parseWorkspacePlanInput(input: string): void {
        const lines: string[] = input.split("\n");
        for (const line of lines) {
            this.workspacePlan.push(line.split(""));
        }
    }
//Save workers indexes
    private saveWorkersIndexes() {
        for (let i = 0; i < this.workspacePlan.length; i++) {
            for (let j = 0; j < this.workspacePlan[i].length; j++) {
                if (this.workspacePlan[i][j] === "E") {
                    this.employeesIndexes.push([i, j]);
                }
            }
        }
    }
//Print workspace plan
    printWorkspacePlan(): void {
        for (const row of this.workspacePlan) {
            console.log(row.join(""));
        }
    }
//Create a nodes matrix that save each element from the original matrix and adds an ID number 
    private initNodesMatrix(): void {
        let id = 0;
        for (let i = 0; i < this.workspacePlan.length; i++) {
            const nodesRow = new Array();
            for (let j = 0; j < this.workspacePlan[i].length; j++) {
                nodesRow.push(new Node(id, this.workspacePlan[i][j] as NodeType, [i, j]));
                id++;
            }
            this.nodesMatrix.push(nodesRow);
        }
    }
//Create a map and save all the spaces in the matrix by ID
    private initNodeMap(): void {
        for (let i = 0; i < this.nodesMatrix.length; i++) {
            for (let j = 0; j < this.nodesMatrix[i].length; j++) {
                const node = this.nodesMatrix[i][j];
                if (node.type === NodeType.SPACE) {
                    this.nodesMap.set(node.id, node);
                    this.setNodeConnections(node);
                }
            }
        }
    }
//For each of the spaces in the map save all spaces neighbors
    private setNodeConnections(node: Node): void {
        const [i, j] = node.index;
        const neighborsNodes: Node[] = new Array();
        neighborsNodes.push(this.nodesMatrix[i][j + 1]);
        neighborsNodes.push(this.nodesMatrix[i][j - 1]);
        neighborsNodes.push(this.nodesMatrix[i + 1][j]);
        neighborsNodes.push(this.nodesMatrix[i - 1][j]);
        for (const neighborNode of neighborsNodes) {
            if (neighborNode && neighborNode.type === NodeType.SPACE) {
                node.connectedNodes.push(neighborNode);
            }
        }
    }

    //For each of the empty spaces save distance - the shortest path from the employee to the empty space (The amount of nodes).
    //For each of the empty space sum the distances from all employees to the empty space.
    //Implementing an Dijkstra algorithm for finding the distance.
    setKitchenLocation(): void {
        for (const employeeIndex of this.employeesIndexes) {
            const [i, j] = employeeIndex;
            const employeNode = this.nodesMatrix[i][j];
            employeNode.distance = 0;
            this.setNodeConnections(employeNode);
            this.nodesMap.set(employeNode.id, employeNode);
            const nonVisitedNodes = Array.from(this.nodesMap.values());
            while (nonVisitedNodes.length > 0) {
                const minDistanceNode = nonVisitedNodes
                    .reduce((minDistanceNode, node) => node.distance < minDistanceNode.distance ? node : minDistanceNode, nonVisitedNodes[0]);
                for (const connectedNode of minDistanceNode.connectedNodes) {
                    if (!connectedNode.visited) {
                        const newDistabce = minDistanceNode.distance + 1;
                        if (newDistabce < connectedNode.distance) {
                            connectedNode.distance = newDistabce;
                            connectedNode.parent = minDistanceNode;
                        }
                    }
                }
                minDistanceNode.visited = true;
                nonVisitedNodes.splice(nonVisitedNodes.indexOf(minDistanceNode), 1);
            }
            for (const node of this.nodesMap.values()) {
                node.sumOfDistances += node.distance;
                node.visited = false;
                node.distance = Infinity;
                node.parent = null;
            }
        }
        const nodesArray = Array.from(this.nodesMap.values());
        //Finding the empty sapce with the minimum amount of distances.
        const kitchenNode = nodesArray.filter(node => node.type === NodeType.SPACE)
            .reduce((kitchenNode, node) => node.sumOfDistances < kitchenNode.sumOfDistances ? node : kitchenNode, nodesArray[0]);
        //If the floor plan does not allow for a kitchen
        if (kitchenNode.sumOfDistances === Infinity) {
            throw new Error("There is no space accessible for all employees!");
        }
        this.kitchenLocation = kitchenNode.index;
        const [i, j] = kitchenNode.index;
        this.workspacePlan[i][j] = "*";
    }
}
