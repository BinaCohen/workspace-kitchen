import * as fs from "fs";
import { Workspace } from "./workspace";

console.log("Hello! Wellcome to Find kitchen in Workspace program");

const inputFile: string = "input.txt";
console.log(`Loading workspace plan from ${inputFile}..`);
const input: Buffer = fs.readFileSync(inputFile);

const workspace = new Workspace(input.toString());
console.log(`Workspace plan:`);
workspace.printWorkspacePlan();
try {
    workspace.setKitchenLocation();
    console.log("Workspace plan with kitchen:");
    workspace.printWorkspacePlan();
    console.log(`Kitchen location is in [${workspace.kitchenLocation}]`);
} catch (e) {
    console.log(e.message);
}