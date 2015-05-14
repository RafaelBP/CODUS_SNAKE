var gamecontroller = {
	foodArray       : [],      
	nextSquare      : [0,0],  // Coordinates of the snake NEXT movement.
	timeStep        : 250,    //in milliseconds
	// timeOut         : window.setTimeout(function(){gamecontroller.nextMovement();}, this.timeStep),
	timeOut         : window.setInterval(function(){gamecontroller.nextMovement();},this.timeStep),

	placeFood   : function(){
		var i;    //counter
		var x,y;  //coordinates

		//iterate over foodArray and print on screen those food squares.
		for(i=0; i < this.foodArray.length; i++){
			x = (this.foodArray[i])[0];
			y = (this.foodArray[i])[1];

			//Set the corresponding square on grid visible and RED[#B20000]
			graphicController.setSquareVisibility([x,y],"visible");
			graphicController.setSquareBackgroundColor([x,y],"#B20000");
		}
	},

	generateFood : function(){
		// Creates exactly ONE new entry in gamecontroller.foodArray
		var i;
		var x,y;
		var foodsquare;
		var flag;

		do {
			// flag is false when foodsquare is not already an segment of the snake, true otherwise.
			flag=false;

			//Generates two random coordinates of integers in the range [1..graphicController.canvasResolution]
			x = Math.floor(Math.random() * graphicController.canvasResolution) + 1;
			y = Math.floor(Math.random() * graphicController.canvasResolution) + 1;
			foodsquare = [x,y];

			//Check if it doensn't have already a snake segment on this location
			for (i=0; i < snake.segmentArray.length; i++){
				if (foodsquare.equals(snake.segmentArray[i])) {
					flag=true;
				}
			}
		}
		while(flag==true);

		//Add the new food to gamecontroller.foodArray
		this.foodArray.push(foodsquare);
	},

	nextMovement : function(){
		// Evaluate if the next movement falls in one of the four possibe scenarios, that is,
		// snake head falls on (empty square || food || itself || wall)
		var i;

		this.nextSquare = snake.segmentArray[snake.headIndex].SumArray(snake.direction);
		
		//Check for wall collision
		if ( (this.nextSquare[0] < 1 || this.nextSquare[0] > graphicController.canvasResolution) || 
								(this.nextSquare[1] < 1 || this.nextSquare[1] > graphicController.canvasResolution) ) {
			alert("GAME OVER, you SUCK!");
			this.reset();
			return false;
		}

		//Check for Self Collision
		for(i=0; i < snake.segmentArray.length; i++){
			if( this.nextSquare.equals(snake.segmentArray[i]) ){
				alert("GAME OVER, newba!");
				this.reset();
				return false;
			}
		}

		//Check for food
		for(i=0; i < this.foodArray.length; i++){
			if(this.nextSquare.equals(this.foodArray[i])){
				//First, remove the entry in this.foodArray
				this.foodArray.splice(i,1);
				//call snake method to grow it
				snake.grow();
				return true;  // while true game goes on
			}
		}

		//In the case none of the above conditions are met, the nextSquare is just an empty square
		snake.move();
		return true;
	},

	validateDirection : function(newdirection){
		// Check if newdirection is a valid direction. That is, newdirection should not be
		// [0,0] as a result of a non valid keystroke. And newdirection shouldn't be opposite
		// to current snake direction. OBS. newdirection comes from keyboard
		if (newdirection.equals(snake.direction.ScalarMult(-1)) || newdirection.equals([0,0])) {
		 	return false;
		}else{
			//Direction is valid. Update snake.direction
			snake.direction = newdirection;
			return true;
		}
	},

	reset : function(){
		var i,j; 

		//First set all squares on grid as hidden 	
		for(i=1; i<=graphicController.canvasResolution; i++){
			for(j=1;j<=graphicController.canvasResolution;j++){
				graphicController.setSquareVisibility([i,j],"hidden");
				graphicController.setSquareBackgroundColor([i,j],"black");
			}
		}
	
		//Stop time
		window.clearInterval(this.timeOut);

		// Reset snake 
		snake.reset();

		// Reset controller
		this.foodArray = [];

		//set initial food
		this.generateFood();
		this.placeFood();

		//place Initial Snake
		graphicController.placeInitialSnake();
	}


};

var graphicController = {

	canvasResolution : 16,    // Number of squares per dimension. e.g. 32 x 32 canvas etc.
 
	generateGrid : function (){
		// Generate N by N grid of small floating divs that we refer as squares.
		var i, j;
		for(j=1; j<= this.canvasResolution; j++){
			for (i=1; i<= this.canvasResolution; i++) {

				//HTML generation
				$(".main-container" ).append( "<div class='square' id=square_" + i.toString() + "_" + 
					j.toString() + "/>" );

				//Set initial visibility as hidden
				this.setSquareVisibility([i,j],"hidden");
			}
		}
	},


	setSquareVisibility : function(square,status){
		$("#square_" + square[0].toString() + "_" + square[1].toString()).css("visibility",status);
	},

	setSquareBackgroundColor : function(square,color){
		$("#square_" + square[0].toString() + "_" + square[1].toString()).css("background-color",color);
	},

	placeInitialSnake : function(){
		var i;
		for(i=0; i < snake.segmentArray.length; i++){
			graphicController.setSquareVisibility(snake.segmentArray[i],"visible");
		}
	}
};


var interfaceController = {
};

var snake = {
	segmentArray : [[0,0]],  //[[15,16],[16,16],[17,16]],  //Initial segments that build up the snake.
	direction    : [1,0],                      //direction travelling.
	headIndex    : 2,	  			           //index that points to snake head.
	tailIndex    : 0,    					   //index that point to snake tail.
	move         : function(){
		// JQuery to capture and hide the former tail segment
		$("#square_" + (this.segmentArray[this.tailIndex])[0].toString() + 
		  "_" + (this.segmentArray[this.tailIndex])[1].toString()).css("visibility","hidden");

		// The new head segment is stored in the former tail position
		this.segmentArray[this.tailIndex] = this.segmentArray[this.headIndex].SumArray(this.direction);

		//Increment headIndexes 
		this.incrementHeadIndex();
		this.incrementTailIndex();

		//Set the new head segment as visible and black
		graphicController.setSquareVisibility(this.segmentArray[this.headIndex],"visible");
		graphicController.setSquareBackgroundColor(this.segmentArray[this.headIndex],"black");

	},

	grow         : function(){
		var x,y;
	
		// The new head segment is SPLICED in the position of the TAIL 
		this.segmentArray.splice(this.tailIndex,0,gamecontroller.nextSquare);

		//Increment headIndexes 
		this.incrementHeadIndex();
		if (this.tailIndex == 0){   // This if block is to fix indexes when growth occurs in T _ _ _ H config.
			this.incrementHeadIndex();
		}
		this.incrementTailIndex(); 

		//set new head segment as visible AND BLACK
		graphicController.setSquareVisibility(this.segmentArray[this.headIndex],"visible");
		graphicController.setSquareBackgroundColor(this.segmentArray[this.headIndex],"black");
	},

	incrementHeadIndex : function(){
		if(this.headIndex != this.segmentArray.length - 1){
			this.headIndex += 1;
		}else{
			this.headIndex = 0;
		}

	},

	incrementTailIndex : function(){
		if(this.tailIndex != this.segmentArray.length - 1){
			this.tailIndex += 1;
		}else{
			this.tailIndex = 0;
		}
	},

	reset : function(){
		var i,j;

		j = Math.floor( graphicController.canvasResolution / 2 );
		i = j - 1;

		this.segmentArray = [[i,j]];
		i += 1;
		this.segmentArray.push([i,j]);
		i += 1;
		this.segmentArray.push([i,j]);

		this.headIndex = 2;
		this.tailIndex = 0;
	}
};	





//----------------------------------AUTORUN----------------------------------------//
// As soon as document loads executes
$(document).ready(function(){
	//Create the Grid
	graphicController.generateGrid();

	//Reset and good to go
	gamecontroller.reset();
});


// Capture keypress
document.onkeypress = function(e) {
    e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    

    //Ask controller for movement validity
    if (gamecontroller.validateDirection(decode(charCode))){
    	//Override gamecontroller interval
    	window.clearInterval(gamecontroller.timeOut);
    	gamecontroller.nextMovement();

    	//Respawn the Interval
    	gamecontroller.timeOut  = window.setInterval(function(){gamecontroller.nextMovement();},
    															gamecontroller.timeStep);

    }

    document.getElementById("demo").innerHTML= "Code: [" + charCode + "]";
    document.getElementById("vector").innerHTML= "Direction: [" + snake.direction + "]";
};
//------------------------------------------------------------------------------------//

//A função decode recebe o input do teclado em ASCII através da variável charCode
//e a transforma em um vetor de direção [X,Y].
function decode(charCode){
	switch(Number(charCode)){
		// UP --> i key
		case 105:
			return [0,-1];
			break ;

		// LEFT --> j key
		case 106:
			return [-1,0];
			break;
		
		// DOWN --> k key
		case 107:
			return [0,1];
			break;

		// RIGHT --> L key 
		case 108:
			return [1,0];
			break;

		// RESET GAME -> R key
		case 114:
			gamecontroller.reset();
			return[0,0];
			break;

		//TEMPORARY - DEBBUGING
		case 113:
			console.log(snake.segmentArray);
			console.log("head", snake.headIndex);
			console.log("tail", snake.tailIndex);
			return [0,0];
			break;

		//PLACE ANOTHER FOOD - W key
		case 119:  
			gamecontroller.generateFood();
			gamecontroller.placeFood();
			return [0,0];
			break;
		default :
			return [0,0];
	}
}

// ----------------------------ARRAY ALGEBRA EXPANSION-------------------------------
Array.prototype.SumArray = function (arr) {
    var sum = [];
    if (arr != null && this.length == arr.length) {
        for (var i = 0; i < arr.length; i++) {
            sum.push(this[i] + arr[i]);
        }
    }
    return sum;
}

Array.prototype.ScalarMult = function(scl){
	var i; //counter
	var temp = [];
	for (i=0; i < this.length; i++){
		temp[i] = this[i]*scl;
	}
	return temp;
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
