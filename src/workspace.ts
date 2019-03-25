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

    private parseWorkspacePlanInput(input: string): void {
        const lines: string[] = input.split("\n");
        for (const line of lines) {
            this.workspacePlan.push(line.split(""));
        }
    }

    private saveWorkersIndexes() {
        for (let i = 0; i < this.workspacePlan.length; i++) {
            for (let j = 0; j < this.workspacePlan[i].length; j++) {
                if (this.workspacePlan[i][j] === "E") {
                    this.employeesIndexes.push([i, j]);
                }
            }
        }
    }

    printWorkspacePlan(): void {
        for (const row of this.workspacePlan) {
            console.log(row.join(""));
        }
    }

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

    //dijkstra algorithm
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
        const kitchenNode = nodesArray.filter(node => node.type === NodeType.SPACE)
            .reduce((kitchenNode, node) => node.sumOfDistances < kitchenNode.sumOfDistances ? node : kitchenNode, nodesArray[0]);
        if (kitchenNode.sumOfDistances === Infinity) {
            throw new Error("There is no space accessible for all employees!");
        }
        this.kitchenLocation = kitchenNode.index;
        const [i, j] = kitchenNode.index;
        this.workspacePlan[i][j] = "*";
    }
}