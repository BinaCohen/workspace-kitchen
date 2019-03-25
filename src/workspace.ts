import { Node, NodeType, Route } from "./node";

export class Workspace {
    private workspacePlan: string[][] = new Array();
    private employeesIndexes: [number, number][] = new Array();
    private nodesMatrix: Node[][] = new Array();
    private spaceNodesMap: Map<number, Node> = new Map();
    kitchenLocation: [number, number];

    constructor(input: string) {
        this.parseWorkspacePlanInput(input);
        this.saveWorkersIndexes();
        this.initNodesMatrix();
        this.initSpacesNodeMap();
    }

    // Parse the file input into a matrix of characters
    private parseWorkspacePlanInput(input: string): void {
        const lines: string[] = input.split("\n");
        for (const line of lines) {
            this.workspacePlan.push(line.split(""));
        }
    }

    // Save workers indexes
    private saveWorkersIndexes() {
        for (let i = 0; i < this.workspacePlan.length; i++) {
            for (let j = 0; j < this.workspacePlan[i].length; j++) {
                if (this.workspacePlan[i][j] === "E") {
                    this.employeesIndexes.push([i, j]);
                }
            }
        }
    }

    // Print workspace plan
    printWorkspacePlan(): void {
        for (const row of this.workspacePlan) {
            console.log(row.join(""));
        }
    }

    // Create a nodes matrix which contains each element from the original matrix with additional data
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

    // Create a map contains all the space nodes in the matrix
    private initSpacesNodeMap(): void {
        for (let i = 0; i < this.nodesMatrix.length; i++) {
            for (let j = 0; j < this.nodesMatrix[i].length; j++) {
                const node = this.nodesMatrix[i][j];
                if (node.type === NodeType.SPACE) {
                    this.spaceNodesMap.set(node.id, node);
                    this.setNodeConnections(node);
                }
            }
        }
    }

    // Link all neighbors space nodes for a given node
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

    // Update the workspace plan with kitchen location and routes from the employees
    setKitchenLocation(): void {
        const kitchenNode = this.findKitchenNode();
        this.kitchenLocation = kitchenNode.index;
        const [i, j] = kitchenNode.index;
        this.workspacePlan[i][j] = "*";
        for (const employeeRoute of kitchenNode.employeesRoutes) {
            for (const index of employeeRoute) {
                const [i, j] = index;
                if (this.nodesMatrix[i][j].type === NodeType.SPACE) {
                    this.workspacePlan[i][j] = "+";
                }
            }
        }
    }

    // For each employee find the shortest path to all of the space nodes
    // For each space node wee will keep (as part of Node object) the sum of distances from all employees
    private findKitchenNode(): Node {
        for (const employeeIndex of this.employeesIndexes) {
            const [i, j] = employeeIndex;
            const employeNode = this.nodesMatrix[i][j];
            this.findNodeShortestPaths(employeNode);
        }
        const nodesArray = Array.from(this.spaceNodesMap.values());
        // Find the empty sapce with the minimum distance 
        const kitchenNode = nodesArray.filter(node => node.type === NodeType.SPACE)
            .reduce((kitchenNode, node) => node.sumOfDistances < kitchenNode.sumOfDistances ? node : kitchenNode, nodesArray[0]);
        // For case the floor plan does not have a space accessible for all employees
        if (kitchenNode.sumOfDistances === Infinity) {
            throw new Error("There is no space accessible for all employees!");
        }
        return kitchenNode;
    }

    // Dijkstra algorithm
    private findNodeShortestPaths(employeNode: Node) {
        employeNode.distance = 0;
        this.setNodeConnections(employeNode);
        this.spaceNodesMap.set(employeNode.id, employeNode);
        const nonVisitedNodes = Array.from(this.spaceNodesMap.values());
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
        for (const node of this.spaceNodesMap.values()) {
            node.sumOfDistances += node.distance;
            this.saveEmployeeRoute(node);
        }
        for (const node of this.spaceNodesMap.values()) {
            node.visited = false;
            node.distance = Infinity;
            node.parent = null;
        }
    }

    // Save the calculated route from the space node to the source node (the employee)
    saveEmployeeRoute(node: Node): void {
        const employeeRoute: Route = new Array();
        let currentNode: Node = node;
        while (currentNode && currentNode.type !== NodeType.EMPLOYEE) {
            employeeRoute.push(currentNode.parent.index);
            currentNode = currentNode.parent;
        }
        node.employeesRoutes.push(employeeRoute);
    }
}
