# workspace-kitchen
Find space to kitchen inside a workspace for a given input file

The floor plan contains employees, walls and spaces.
We need to find the best location for a kitchen (one of the empty spaces), so that the sum of routes from all emplyees to this location will be the minimum.

Example of input file:
<pre>
WWWWWWWWWWWWW
W E   W E   W
W     W     W
W           W
W     W     W
W E   W E   W
WWWWWWWWWWWWW
</pre>

Run instructions:
1. Clone the repo
2. Install npm dendencies by running <b>npm install</b>
3. Update the floor plan in the "input.txt" file
4. Run with <b>npm start</b>

The program will output the kitchen location and the routes from all employees
