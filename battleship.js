var view = {
	
	// Displays a message to the messaging area.
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},
	
	// Marks a cell as a hit.
	displayHit: function(location) {
		this.updateClass(location, "hit");
	},
	
	// Marks a cell as a miss.
	displayMiss: function(location) {
		this.updateClass(location, "miss");
	},
	
	// Updates the class attribute of a cell.
	updateClass: function(location, value) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", value);
	},
};

var ship = function(locations) {	
	this.locations = locations;
	this.hits = [false, false, false];
	this.getIsSunk = function() {
		for (var i = 0; i < this.hits.length; i++) {
			if (!this.hits[i]) {
				return false;
			}
		}

		return true;
	};
};

var model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	
	ships: [new ship([0, 0, 0]),
			new ship([0, 0, 0]),
			new ship([0, 0, 0])],
				 	
	fire: function(guess) {
		
		// Examine each ship and see if it occupies the location.
		for (var i = 0; i < this.ships.length; i++) {
			var ship = this.ships[i];
			
			var locations = ship.locations;
			var index = locations.indexOf(guess);
		
			// If it does we have a hit.
			if (index >= 0) {
				if (!this.isSunk(ship)) {
					// Mark the corresponding item in the hits array.
					ship.hits[index] = true;
			
					// Update the view.
					view.displayHit(guess);
					view.displayMessage("HIT!");
			
					if (this.isSunk(ship)) {
						view.displayMessage("You sank my battleship!");
						this.shipsSunk++;
					}
			
					return true;
				}
				else {
					view.displayMessage("Ship already sunk");
					return false;
				}
			}
		}
		
		view.displayMiss(guess);
		view.displayMessage("You missed.");	
		return false;
	},
	
	isSunk: function(ship) {
		for (var i = 0; i < ship.hits.length; i++) {
			if (!ship.hits[i]) {
				return false;
			}
		}
		
		return true;
	},
	
	generateShipLocations: function() {
		var locations;
		
		// Loop for the number of ships we want to create.
		for (var i = 0; i < this.numShips; i++) {
			
			do {
				// Generate a new ship.
				locations = this.generateShip();
		
				// Test to see if the new ship's locations collide with any
				// existing ships' location.
			} while (this.collision(locations));
			
			// Add the new ship's locations to the ships array.
			this.ships[i].locations = locations;
			console.log("New ship at: " + locations);
		}
	},
	
	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var row;
		var col;	
		
		if (direction === 1) {
			// Generate a starting location for a horizontal ship.
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));		
		} else {
			// Generate a starting location for a vertical ship.
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
			col = Math.floor(Math.random() * this.boardSize);
		}
		
		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				// Add location to array for new horizontal ship.
				newShipLocations.push(row + "" + (col + i));
			} else {
				// Add location to array for new vertical ship.
				newShipLocations.push((row + i) + "" + col);
			}
		}
		
		return newShipLocations;
	},
	
	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		
		return false;	
	},
};

var controller = {
	guesses: 0,
	isGameOver: false,
	
	processGuess: function(guess) {
		if (!this.isGameOver)
		{
			var location = this.parseGuess(guess);
			if (location) {
				this.guesses++;
				var isHit = model.fire(location);
				if (isHit && model.shipsSunk === model.numShips) {
					view.displayMessage("You sank all my battleships, in " +
						this.guesses + " guesses");
					this.isGameOver = true;
				}
			}
		}
		else
		{
			view.displayMessage("The game is over.");
		}
	},
	
	parseGuess: function(guess) {

		// If guess is null, return null.
		if (!guess)
			return null;
		
		guess = String(guess).toLowerCase();
		
		// If guess is too long or too short, return null.
		if (guess.length !== 2)
			return null;
		
		// Take the letter and convert it to a number.
		var letter = guess.charAt(0);
		
		var chars = ["a", "b", "c", "d", "e", "f", "g"];
		var index = chars.indexOf(letter);
		
		// If the number is not valid, return null.
		if (index < 0)
			return null;
		
		// If the second number is not valid, return null.
		var number = guess.charAt(1);
		if (isNaN(number) || number < 0 || number >= model.boardSize) {
			return null;
		}
		
		return String(index) + number;
	}
};

var parseGuessTester = {
	runBatch: function() {
		this.runTest(null);
		this.runTest("E");
		this.runTest("E11");
		this.runTest(15);
		this.runTest("H0");
		this.runTest("A0");
		this.runTest("G6");
		this.runTest("barry");
		this.runTest("G8");
		this.runTest(false);
		this.runTest(true);
	},

	runTest: function(guess) {
		var result = controller.parseGuess(guess);
		console.log("Guess: " + guess + "; result: " + result);
	},
};

var controllerTester = {
	runBatch: function() {
		controller.processGuess("A0");
		controller.processGuess("A6");
		controller.processGuess("B6");
		controller.processGuess("C6");
		controller.processGuess("C4");
		controller.processGuess("E4");
		controller.processGuess("D4");
		controller.processGuess("B2");
		controller.processGuess("B1");
		controller.processGuess("B0");
		//controller.processGuess("B0");
	},
};

function init() {
	
	// Draw the grid.
  drawGrid2(7, 7); 

	// Hook up the fire button event handler.
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;

	// Hook up the guess input key press event handler.
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	// Generate ship locations.
	model.generateShipLocations();

	//** Run tests.	
	//parseGuessTester.runBatch();
	//controllerTester.runBatch();	
}

function handleFireButton() {
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;
	controller.processGuess(guess);
	
	guessInput.value = "";
}

function handleKeyPress(e) {
	if (e.keyCode === 13) {
		handleFireButton();
		return false;
	}
}

// Generates the html for an n x m grid.
function drawGrid(rowCount, colCount) {
	
	// Create the array and add the starting table tag.
	var htmlArray = [];
	htmlArray.push('<table>');
	
	// Iterate through each of the rows and columns and add a cell element
	// for each on
	for (var row = 0; row < rowCount; row++) {
		// Add row starting tag.
		htmlArray.push("<tr>");
		
		// Iterate though each column and add cell tags.
		for (var col = 0; col < colCount; col++) {
			htmlArray.push('<td id="' + row + col + '"></td>');
		}
		
		// Add row closing tag.
		htmlArray.push("</tr>");
	}
	
	// Add closing table tag.
	htmlArray.push("</table>");
	
	// Convert array to a string.
	var html = htmlArray.join("");
	
	// Add the HTML to the document.
	var grid = document.getElementById("grid");
	grid.innerHTML = html;
}

// Draws a grid using the DOM.
function drawGrid2(rowCount, colCount) {

	var grid;
	var table;
	var rowNode;
	var cell;

	// Get the element for the grid.
	grid = document.getElementById("grid");
	
	// Add a table element
	table = document.createElement("table");
	
	// Add the table node to the grid.
	grid.appendChild(table);
	
	
	// For each row and column add a child element to the grid.
	for (var row = 0; row < rowCount; row++) {
		// Create a row node.
		rowNode = document.createElement("tr");
		
		// Add the row node to the table.
		table.appendChild(rowNode);
		
		// For each column add a cell element.
		for (var col = 0; col < colCount; col++) {
			// Create a cell node.
			cell = document.createElement("td");
			cell.id = String(row) + col;
			
			// Append the cell node to the row.
			rowNode.appendChild(cell);
		}
	}
}

window.onload = init;
