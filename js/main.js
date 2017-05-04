// TEXAS HOLDEM POKER - Bartosz Chrząszczak 2016-2017

//SETTINGS
//var numberOfPlayers; //for future
var humanPlayerId = 0;
var showAllCards = false; //Showing all players cards
var bigBlindValue = 20;
var bigBlindIncreaseTimerSet = true;
var bigBlindIncreaseTime = 300000; //in ms
var aiDifficulty = "normal"; //checking, easy, normal, (hard in future)
var aiSpeed = 500; //in ms
var newRoundDelay = 500 //in ms
var soundEnabled = true;

$.expr.cacheLength = 1;

//nativeCards deck initialisation
var nativeCards = []; //Array of all 52 cards
var nativeSuits = ["clubs", "diamonds", "spades", "hearts"];
var nativeValues = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];

var n = 0;
for (var i = 0; i < nativeSuits.length; i++) {
	for (var j = 0; j < nativeValues.length; j++) {
		nativeCards.push({
			id: n,
			suit: nativeSuits[i],
			value: nativeValues[j],
			order: j
    });	
		n = n+1;
	}
}
//Shuffling deck and adding pointer that points next card on top of deck.
var deck = shuffle(nativeCards);
var deckPointer = 0;

//Players initialisation
var players = [];
var humanPlayer = {
	id: 0,
	name: "Human",
	tokens: 1000,
	cards: [],
	hands: []
}
var CPU1 = {
	id: 1,
	name: "CPU1",
	tokens: 1000,
	cards: [],
	hands: []
}
var CPU2 = {
	id: 2,
	name: "CPU2",
	tokens: 1000,
	cards: [],
	hands: []
}
var CPU3 = {
	id: 3,
	name: "CPU3",
	tokens: 1000,
	cards: [],
	hands: []
}
var CPU4 = {
	id: 4,
	name: "CPU4",
	tokens: 1000,
	cards: [],
	hands: []
}
var CPU5 = {
	id: 5,
	name: "CPU5",
	tokens: 1000,
	cards: [],
	hands: []
}
players.push(humanPlayer, CPU1, CPU2, CPU3, CPU4, CPU5);

var smallBlindPosition = 0;
var bigBlindPosition = 1;
var currentPlayerPosition;
var currentBids = [];
var currentStatus = [];
var tableCards = [];
var potValue;
var roundCounter = 0;
var playerMove = false;
var bigBlindIncrease = false; //flag for function 

var bigBlindInterval;
if (bigBlindIncreaseTimerSet == true && !bigBlindInterval){
	bigBlindInterval = setInterval(function(){
		bigBlindIncrease = true;
	}, bigBlindIncreaseTime);
}


function roundStart(){
	tableCards = [];
	potValue = 0;

	for (var i=0; i<players.length; i++){
		currentBids[i] = 0;
		players[i].cards = [];
		
		if (players[i].tokens < bigBlindValue){
			if (currentStatus[i] != "not playing"){
				currentStatus[i] = "not playing";
			}
		}else {
			currentStatus[i] = "";
		}		
	}
	//set blind positions based on status
	increaseBlindPosition("SB");
	var minimumPlayersCounter = 0;
	while (currentStatus[smallBlindPosition] == "not playing"){
		increaseBlindPosition("SB");
		minimumPlayersCounter++;
		if (minimumPlayersCounter >= players.length-1){
			clearInterval(aiTimer);
			alert("Not enough players playing!");
			return;
		}
	}

	bigBlindPosition = smallBlindPosition+1;
	if (bigBlindPosition >= players.length){
		bigBlindPosition = 0;
	}
	
	var minimumPlayersCounter = 0;
	while (currentStatus[bigBlindPosition] == "not playing"){
		increaseBlindPosition("BB");
		minimumPlayersCounter++;
		if (minimumPlayersCounter >= players.length-1){
			clearInterval(aiTimer);
			alert("Not enough players playing!");
			return;
		}
	}

	currentPlayerPosition = smallBlindPosition+2;
	if (smallBlindPosition+2 >= players.length) {
		currentPlayerPosition = smallBlindPosition+2-players.length;
	}
	
	while (currentStatus[currentPlayerPosition] == "not playing"){
		currentPlayerPosition++;
		if (currentPlayerPosition >= players.length){
			currentPlayerPosition = 0;
		}
	}
	//Checking if bigBlindInterval is set
	if (bigBlindIncreaseTimerSet == true && !bigBlindInterval){
		bigBlindInterval = setInterval(function(){
			bigBlindIncrease = true;
		}, bigBlindIncreaseTime);
	}
	if (bigBlindIncreaseTimerSet == false && bigBlindInterval){
		clearInterval(bigBlindInterval);
	}

	//Reshuffling deck and resetting pointer
	deck = shuffle(nativeCards);
	deckPointer = 0;

	//Printing round number
	roundCounter++;
	addToLog("♠♣♥♦ Round "+roundCounter+" ♠♣♥♦", false);

	giveTwoCards();
	takeBlinds();
	checkPlayersHands();
	displayStatus();
	
	if (players[currentPlayerPosition].id == 0 && currentStatus[humanPlayerId] != "not playing"){
		playerMove = true;
	}
		
	var winnerInfo = checkWinner()[1];

	addToLog(winnerInfo, true);
	if (currentStatus[humanPlayerId] != "not playing"){
		addToLog("Player highest hand: "+players[humanPlayerId].hands.type, false);
	}

	
	function increaseBlindPosition(blindName){ //SB or BB
		if (blindName == "SB"){
			smallBlindPosition++;
			if (smallBlindPosition >= players.length){
				smallBlindPosition = 0;
			}
		} else if (blindName == "BB"){
			bigBlindPosition++;
			if (bigBlindPosition >= players.length){
				bigBlindPosition = 0;
			}
		}
	}	
}

roundStart();

//INTERFACE BUTTONS
$(".options-button").click(function() {
	$('.options-window').show();
	if (showAllCards == true){
		$('#godmode-checkbox').attr("checked", true);
	}else {
		$('#godmode-checkbox').attr("checked", false);
	}
	
	if (soundEnabled == true){
		$('#sound-checkbox').attr("checked", true);
	}else {
		$('#sound-checkbox').attr("checked", false);
	}
	
	if ($('.difficulty-select :selected').val() != aiDifficulty){
		$('.difficulty-select').val(aiDifficulty);
	}
	if ($('#ai-speed :selected').val() != aiSpeed){
		$('#ai-speed').val(aiSpeed);
		$('.ai-speed-value').html(" "+aiSpeed);
	}
	if ($('#new-round-delay :selected').val() != newRoundDelay){
		$('#new-round-delay').val(newRoundDelay);
		$('.new-round-delay-value').html(" "+newRoundDelay);
	}
	if (bigBlindIncreaseTimerSet == true){
		$('#enable-bb-increase-checkbox').attr("checked", true);
	}else{
		$('#enable-bb-increase-checkbox').attr("checked", false);
	}
	
});

$('#ai-speed').on("change mousemove", function() {
	var aiSpeedChange = $(this).val();

	if (aiSpeedChange != aiSpeed){
		aiSpeed = aiSpeedChange;
		$('.ai-speed-value').html(" "+aiSpeed);
	}
});

$('#new-round-delay').on("change mousemove", function() {
	var newRoundDelayChange = $(this).val();

	if (newRoundDelayChange != newRoundDelay){
		newRoundDelay = newRoundDelayChange;
		$('.new-round-delay-value').html(" "+newRoundDelay);
	}
});

var maxTokensChange = 100000;
var minTokensChange = 100;
$('#tokens-change').focusout(function(){
	var tokensChangeInputValue = $(this).val();
	
	if(Math.floor(tokensChangeInputValue) != tokensChangeInputValue  && $.isNumeric(tokensChangeInputValue ) == false){
		alert('Tokens must be integer number!');
		$(this).val(1000);
	}
	
	if (tokensChangeInputValue > maxTokensChange){
		alert('Out of max range of 100 000 tokens!');
		$(this).val(100000);
	}else if (tokensChangeInputValue < minTokensChange) {
		alert('Out of min range of 100 tokens!');
		$(this).val(100);
	}
});
$("#tokens-change-button").click(function() {
	var tokensNumber = parseInt($("#tokens-change").val());
	for (var i=0; i<players.length; i++){
		players[i].tokens = tokensNumber;
	}
});

var maxBBChange = 1000;
var minBBChange = 10;
$('#bb-change').focusout(function(){
	var bbChangeInputValue = $(this).val();
	
	if(Math.floor(bbChangeInputValue) != bbChangeInputValue || $.isNumeric(bbChangeInputValue) == false){
		alert('Big Blind must be integer number!');
		$(this).val(10);
	}
	
	if (bbChangeInputValue > maxBBChange){
		alert('Out of max range of 1000 tokens!');
		$(this).val(1000);
	}else if (bbChangeInputValue < minBBChange) {
		alert('Out of min range 10 of tokens!');
		$(this).val(10);
	}
});
$("#bb-change-button").click(function() {
	var bbChangeValue = parseInt($("#bb-change").val());
	bigBlindValue = bbChangeValue;
});

$('#bb-increase-time').on("change mousemove", function() {
	var newBBIncreaseTime = $(this).val();

	if (newBBIncreaseTime*60000 != bigBlindIncreaseTime){
		bigBlindIncreaseTime = newBBIncreaseTime*60000;
		$('.bb-increase-time-value').html(" "+newBBIncreaseTime);
	}
});
													
$(".save-options-button").click(function() {
	if ($('#godmode-checkbox').is(":checked")) {
		showAllCards = true;
	} else {
		showAllCards = false;
	}
	
	if ($('#sound-checkbox').is(":checked")) {
		soundEnabled = true;
	} else {
		soundEnabled = false;
	}
	
	aiDifficulty = $('.difficulty-select').val();
	
	if ($('#enable-bb-increase-checkbox').is(":checked")) {
		bigBlindIncreaseTimerSet = true;
	} else {
		bigBlindIncreaseTimerSet = false;
	}

	
	
	$('.options-window').hide();
	displayStatus();

});

$(".button-columns-container button" ).click(function() {
	if (playerMove === true){
		if ($(this).hasClass('add-bb-button')){
			var bidValue = $('#bid-value').val();
			$('#bid-value').val(parseInt(bidValue)+20);
			$(".bid-button").html("Raise by "+$('#bid-value').val());
			
			return;
		}else if ($(this).hasClass('options-button')){
			return;
		}else {
			playerMove = false;
		
			var action = $(this).attr("class").slice(0, -7)
			if (action === "bid"){
				makeMove($("#bid-value").val());
			}else{
				makeMove(action);
			}
		}
	}
});

$('#bid-value').on("change mousemove", function() {
	$(".bid-button").html("Raise by "+$(this).val());
});

//AI SECTION
function aiAction(){
	var maxCurrentBid = Math.max(...currentBids);
	
	if (playerMove === false && currentStatus[currentPlayerPosition] != "not playing"){
		if (aiDifficulty == "checking"){ //AI always checks
			makeMove("check");
		} else if (aiDifficulty == "easy"){ //AI decides move based on other players biddings
			if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0 ) {
				doRandomAction("check", 1*bigBlindValue, 90);
			}else if (maxCurrentBid - currentBids[currentPlayerPosition] <= 3*bigBlindValue){
				doRandomAction("check", "pass", 90);
			}else {
				doRandomAction("check", "pass", 50);
			}
			
		} else if (aiDifficulty == "normal"){ //AI decides move based on hand strength and bid values
			var randomNumber = Math.floor((Math.random() * 10) + 1);
			var handStrength = players[currentPlayerPosition].hands.order;
			var cards = tableCards.concat(players[currentPlayerPosition].cards);
			cards.sort(function(a, b) { return parseFloat(b.order) - parseFloat(a.order); });
			
			if (tableCards.length == 0){
				if (handStrength == 1){ //player have pair
					if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0 ) {
						makeMove(3*bigBlindValue);
					}else if (maxCurrentBid - currentBids[currentPlayerPosition] < 3*bigBlindValue){
						if (cards[0].order >= 11){
							makeMove(3*bigBlindValue);
						}else if ((cards[0].order >= 8) && (cards[0].order < 11)){
							makeMove("check");
						}else {
							doRandomAction("check", "pass", 50);
						}
					}else if ((maxCurrentBid - currentBids[currentPlayerPosition] >= 3*bigBlindValue) && (maxCurrentBid - currentBids[currentPlayerPosition] < 10*bigBlindValue)){
						if (cards[0].order >= 11){
							makeMove("check");
						}else if ((cards[0].order >= 8) && (cards[0].order < 11)){
							doRandomAction("check", "pass", 60);
						}else {
							makeMove("pass");
						}
					}else {
						if (cards[0].order >= 11){
							makeMove("check");
						}else if (cards[0].order == 10) {
							doRandomAction("check", "pass", 50);
						}else {
							makeMove("pass");
						}
					}
				}else { //player doesnt have pair
					if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0) {
						if (cards[0].order >= 11 && cards[1].order >= 8){
							doRandomAction("check", 3*bigBlindValue, 50);
						}else {
							makeMove("check");
						}
					}else if (maxCurrentBid - currentBids[currentPlayerPosition] < 3*bigBlindValue){
						if (cards[0].order >= 11){
							if (cards[1].order >= 9){
								doRandomAction("check", 3*bigBlindValue, 50);
							}else if (cards[1].order >= 7 && cards[1].order < 9){
								makeMove("check");
							}else {
								doRandomAction("check", "pass", 50);
							}
						}else if ((cards[0].order >= 9) && (cards[0].order < 11)){
							if (cards[1].order >= 8){
								makeMove("check");
							}else if (cards[1].order >= 7 && cards[1].order < 8){
								doRandomAction("check", "pass", 70);
							}else {
								doRandomAction("check", "pass", 30);
							}
						}else {
							if (cards[1].order >= 6){
								doRandomAction("check", "pass", 10);
							}else {
								doRandomAction("check", "pass", 5);
							}
						}
					}else if ((maxCurrentBid - currentBids[currentPlayerPosition] >= 3*bigBlindValue) && (maxCurrentBid - currentBids[currentPlayerPosition] < 10*bigBlindValue)){
						if (cards[0].order >= 11){
							if (cards[1].order >= 9){
								doRandomAction("check", "pass", 80);
							}else if (cards[1].order >= 7 && cards[1].order < 9){
								doRandomAction("check", "pass", 50);
							}else {
								doRandomAction("check", "pass", 10);
							}
						}else if ((cards[0].order >= 9) && (cards[0].order < 11)){
							if (cards[1].order >= 8){
								doRandomAction("check", "pass", 50);
							}else if (cards[1].order >= 7 && cards[1].order < 8){
								doRandomAction("check", "pass", 10);
							}else {
								makeMove("pass");
							}
						}else {
							makeMove("pass");
						}
					}else {
						if (cards[0].order >= 11){
							if (cards[1].order >= 9){
								doRandomAction("check", "pass", 20);
							}else{
								makeMove("pass");
							}
						}else {
							makeMove("pass");
						}
					}
				}
				
			}else if (tableCards.length >= 3){
				if (handStrength == 0){ //high hand
					if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0 ) {
						makeMove("check");
					}else if (maxCurrentBid - currentBids[currentPlayerPosition] < 3*bigBlindValue){
						doRandomAction("check", "pass", 30);
					}else {
						makeMove("pass");
					}
					
				}else if (handStrength == 1){ //pair
					if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0 ) {
						if (cards[0].order >= 10){
							makeMove(3*bigBlindValue);
						}else {
							makeMove("check");
						}
					}else if (maxCurrentBid - currentBids[currentPlayerPosition] < 3*bigBlindValue){
						if (cards[0].order >= 10){
							makeMove("check");
						}else if ((cards[0].order >= 8) && (cards[0].order < 10)){
							doRandomAction("check", "pass", 70);
						}else {
							doRandomAction("check", "pass", 20);
						}
					}else if ((maxCurrentBid - currentBids[currentPlayerPosition] >= 3*bigBlindValue) && (maxCurrentBid - currentBids[currentPlayerPosition] < 10*bigBlindValue)){
						if (cards[0].order >= 11){
							makeMove("check");
						} else if ((cards[0].order >= 9) && (cards[0].order < 11)){
							doRandomAction("check", "pass", 50);
						}	else {
							makeMove("pass");
						}
					}else {
						if (cards[0].order >= 11){
							doRandomAction("check", "pass", 50);
						}else if ((cards[0].order >= 10) && (cards[0].order < 11)){
							doRandomAction("check", "pass", 10);
						}else {
							makeMove("pass");
						}
					}
				}else if (handStrength == 2){ //double pair
					if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0 ) {
						makeMove(3*bigBlindValue);
					}else if (maxCurrentBid - currentBids[currentPlayerPosition] < 3*bigBlindValue){
						if (cards[0].order >= 8 && cards[2].order >= 8){
							makeMove(3*bigBlindValue);
						}else {
							doRandomAction("check", 3*bigBlindValue, 60);
						}
					}else if ((maxCurrentBid - currentBids[currentPlayerPosition] >= 3*bigBlindValue) && (maxCurrentBid - currentBids[currentPlayerPosition] < 10*bigBlindValue)){
						if (cards[0].order >= 8 && cards[2].order >= 8){
							makeMove("check");
						}	else {
							doRandomAction("check", "pass", 10);
						}
					}else {
						if (cards[0].order >= 9 && cards[2].order >= 9){
							makeMove("check");
						}else {
							doRandomAction("check", "pass", 10);
						}
					}			
				}else if (handStrength == 3){ //three of kind
					if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0 ) {
							makeMove(3*bigBlindValue);
					}else if (maxCurrentBid - currentBids[currentPlayerPosition] < 3*bigBlindValue){
						if (cards[0].order >= 7){
							makeMove(3*bigBlindValue);
						}else {
							doRandomAction("check", 3*bigBlindValue, 40);
						}
					}else if ((maxCurrentBid - currentBids[currentPlayerPosition] >= 3*bigBlindValue) && (maxCurrentBid - currentBids[currentPlayerPosition] < 10*bigBlindValue)){
						if (cards[0].order >= 6){
							makeMove("check");
						}else {
							doRandomAction("check", "pass", 90);
						}
					}else {
						if (cards[0].order >= 10){
							makeMove("check");
						}else if (cards[0].order >= 8 && cards[0].order < 10){
							doRandomAction("check", "pass", 70);
						}else {
							doRandomAction("check", "pass", 30);
						}
					}
				}else if (handStrength >= 4){ //straight, flush, full house, four of kind
					if (maxCurrentBid == bigBlindValue || maxCurrentBid - currentBids[currentPlayerPosition] == 0 ) {
						makeMove(3*bigBlindValue);
					}else if (maxCurrentBid - currentBids[currentPlayerPosition] < 3*bigBlindValue){
						makeMove(3*bigBlindValue);
					}else {
						makeMove("check");
					}
				}

			}
			
		} else if (aiDifficulty == "hard"){ //AI decides move based on his own hand strength (win probability), bid values, position versus other players, current stage etc. Maybe add some variations (passive, agressive etc).
			
		}
	}
	function doRandomAction(action1, action2, probabilityOfAction1){ //function that does one of 2 actions based on probability (0-100)
		var randomNumber = Math.floor(Math.random() * 101);
		if (randomNumber <= probabilityOfAction1){
			makeMove(action1);
		}else {
			makeMove(action2);
		}
	}
};
var aiTimer = setInterval(aiAction, aiSpeed);

function makeMove(action) { //actions: pass-"pass", wait/check-"check", bid-"number_of_bid - i.e. 500" 
	
	if (action == "pass") {
		currentStatus[currentPlayerPosition] = "pass";
	}else if (action == "check") {
		if (Math.max(...currentBids) - currentBids[currentPlayerPosition] == 0 && soundEnabled == true) {
			document.getElementById('wait-sound').play();
		}else if (soundEnabled == true){
			document.getElementById('bid-sound').play();
		}
			 
		currentStatus[currentPlayerPosition] = "check";
		if (players[currentPlayerPosition].tokens-(Math.max(...currentBids)-currentBids[currentPlayerPosition]) <= 0){
			currentBids[currentPlayerPosition] = players[currentPlayerPosition].tokens+currentBids[currentPlayerPosition];
			players[currentPlayerPosition].tokens = 0;
		} else {
			players[currentPlayerPosition].tokens = players[currentPlayerPosition].tokens-(Math.max(...currentBids)-currentBids[currentPlayerPosition]);
			currentBids[currentPlayerPosition] = Math.max(...currentBids);
		}
	

	}else if (!isNaN(action)) {
		if (soundEnabled == true){
			document.getElementById('bid-sound').play();
		}


		currentStatus[currentPlayerPosition] = "bid";
		
		if (players[currentPlayerPosition].tokens >= parseInt(action) ){
			players[currentPlayerPosition].tokens = players[currentPlayerPosition].tokens- (Math.max(...currentBids)+parseInt(action)-currentBids[currentPlayerPosition]);
			currentBids[currentPlayerPosition] = Math.max(...currentBids)+parseInt(action);
		}else {
			currentBids[currentPlayerPosition] = currentBids[currentPlayerPosition] +players[currentPlayerPosition].tokens;
			players[currentPlayerPosition].tokens = 0;
		}

	}

	var checkPassCounter = 0;
	var bidCounter = 0;
	var passCounter = 0;
	
	for (var i=0; i<currentStatus.length; i++) {
		if (currentStatus[i] === "bid") {
			bidCounter++;
		}
		if (currentStatus[i] == "check" || currentStatus[i] == "pass" || currentStatus[i] == "not playing"){
			checkPassCounter++;
		}
		if (currentStatus[i] == "pass" || currentStatus[i] == "not playing"){
			passCounter++;
		}
	}
	
	var nextPlayerPosition = currentPlayerPosition+1;
	if (nextPlayerPosition >= players.length){
		nextPlayerPosition = 0;
	}
	
	while ((currentStatus[nextPlayerPosition] === "pass") || (currentStatus[nextPlayerPosition] === "not playing")){
		nextPlayerPosition++;
		if (nextPlayerPosition >= players.length){
			nextPlayerPosition = 0;
		}
	}
	
	//CHECKING IF OTHER ALL PLAYERS PASSED
	if (passCounter === players.length-1 && (currentStatus[nextPlayerPosition] !== "pass" && currentStatus[nextPlayerPosition] !== "not playing")){
		var resultIndex = nextPlayerPosition;
		var resultInfo = "Winner after everyone else passed: "+players[nextPlayerPosition].name;
		var result = [resultIndex, resultInfo];;
		addToLog(resultInfo, false);
		
		//SUM BIDS TO POT AND GIVE IT TO WINNER
		sumBidsToPot();
		players[resultIndex].tokens = players[resultIndex].tokens+potValue;
				
		clearInterval(aiTimer);
		setTimeout(function(){ 
			roundStart(); 
			aiTimer = setInterval(aiAction, aiSpeed);
		}, newRoundDelay);
		return;
	}
	
	//CHECKING IF ALL PLAYERS HAS BEEN CHECKED AND PROCEEDING TO NEXT STAGE
	if ((checkPassCounter === currentStatus.length) || (bidCounter === 1 && currentStatus[nextPlayerPosition] == "bid")) {		
		//SUM BIDS TO POT AND RESET STATUSES OF NON PASSED
		sumBidsToPot();
		for (var i=0; i<players.length; i++){
			if ((currentStatus[i] === "pass") || (currentStatus[i] === "not playing")){
				currentStatus[i] = "not playing";
			}else{
				currentStatus[i] = "";
			}
		}
		//POINTING PLAYER TO START (SB or next available)
		nextPlayerPosition = smallBlindPosition;
		while ((currentStatus[nextPlayerPosition] === "pass") || (currentStatus[nextPlayerPosition] === "not playing")){
			nextPlayerPosition++;
			if (nextPlayerPosition >= players.length){
				nextPlayerPosition = 0;
			}
		}
		//SHOWING CARDS ON TABLE
		if (tableCards.length === 0){
			addToLog("--- flop ---", false);
			tableCards.push(deck[deckPointer], deck[deckPointer+1], deck[deckPointer+2]);
			deckPointer = deckPointer+3;
		}else if (tableCards.length === 3){
			addToLog("--- turn ---", false);
			tableCards.push(deck[deckPointer]);
			deckPointer++;
		}else if (tableCards.length === 4){
			addToLog("--- river ---", false);
			tableCards.push(deck[deckPointer]);
			deckPointer++;
		}else {
			addToLog("--- final ---", false);
			checkPlayersHands();
			var result = checkWinner();
			var resultIndex = checkWinner()[0];
			var resultInfo = checkWinner()[1];
			addToLog(resultInfo, true);
			
			if (resultIndex.length === 1){
				addToLog("Player "+players[resultIndex].name+" wins "+potValue+" tokens with "+players[resultIndex].hands.type, false);
				players[resultIndex[0]].tokens = players[resultIndex[0]].tokens +potValue;
			}else if (resultIndex.length > 1){
				//add draw addToLog
				
				var potDivided = Math.floor(potValue/resultIndex.length);
				
				if (potDivided*resultIndex.length != potValue){
					var potDividedRemain = potValue - potDivided*resultIndex.length;
				}else{
					var potDividedRemain = 0;
				}

				for (var i=0; i<resultIndex.length; i++){
					players[resultIndex[i]].tokens = players[resultIndex[i]].tokens+potDivided;
					if (i === 0){
						players[resultIndex[i]].tokens = players[resultIndex[i]].tokens+potDividedRemain;
					}
				}
			}
			for (var i=0; i<players.length; i++){ //show cards
				if (currentStatus[i] != "pass" && currentStatus[i] != "not playing"){
					showCards([i]);
				}
			}

			
			clearInterval(aiTimer);
			setTimeout(function(){ 
				roundStart(); 
				aiTimer = setInterval(aiAction, aiSpeed);
			}, newRoundDelay);
			return;
		}
		checkPlayersHands();
		var winnerInfo = checkWinner()[1];
		addToLog(winnerInfo, true);
		if (currentStatus[humanPlayerId] != "not playing"){
			addToLog("Player highest hand: "+players[humanPlayerId].hands.type, false);
		}
	}
	currentPlayerPosition = nextPlayerPosition;
	if (players[currentPlayerPosition].id === 0){
		playerMove = true;
	}
	displayStatus();
}

function checkPlayersHands(){
	//Function that checks for highest Hands for every player.
	for (var i=0; i<players.length; i++){
		var cards;
		if (tableCards.length != 0){
			cards = (tableCards.concat(players[i].cards));
		}else {
			cards = players[i].cards;
		}
		var hand = checkHand(cards);
		players[i].hands = hand;
	}
}

function checkWinner(){ //Returns [[winnerIndexes], additionalInfo] which are: indexes of winners as array; string of text with info about winning hand and name of winner player
	var highestOrder = 0;
	var highestHandsPlayerIndex = [];
	
	for (var i=0; i<players.length;i++){
		if (currentStatus[i] == "not playing"){
			continue;
		}
		if ((players[i].hands.order > highestOrder) && (currentStatus[i] != "pass" && currentStatus[i] != "not playing")){
			highestOrder = players[i].hands.order;
			highestHandsPlayerIndex = [i];
		} else if ((players[i].hands.order == highestOrder) && (currentStatus[i] != "pass" && currentStatus[i] != "not playing")){
			highestHandsPlayerIndex.push(i);
		}
	}
	if (highestHandsPlayerIndex.length === 1){
		var resultIndex = highestHandsPlayerIndex;
		var resultInfo = "Current Highest: with Highest Hand ("+players[highestHandsPlayerIndex].hands.type+"): " +players[highestHandsPlayerIndex].name;
		var result = [resultIndex, resultInfo];
		
	}else if(highestHandsPlayerIndex.length > 1) { //When 2 or more players have same kind of hand
		var handType = players[highestHandsPlayerIndex[0]].hands.type;
		var cards = [];
		
		for (var i=0; i<highestHandsPlayerIndex.length; i++){
			if (tableCards.length != 0){
				var temp = tableCards.concat(players[highestHandsPlayerIndex[i]].cards);
				cards.push(temp);
			}else {
				var temp = players[highestHandsPlayerIndex[i]].cards;
				temp.sort(function(a, b) {
					return ((a.order > b.order) ? -1 : ((a.order == b.order) ? 0 : 1));
				});
				cards.push(temp);
			}
		}
		
		switch(handType){
			
			case "High Card":
				var winnerArray = checkKickers(cards);
				var winnerIndex = [];

				for (var i=0; i<winnerArray.length; i++){
					winnerIndex.push(highestHandsPlayerIndex[winnerArray[i]]);
				}
	
				if (winnerIndex.length == 1){
					var resultIndex = winnerIndex;
					var resultInfo = "Current Highest: with High Card: "+players[resultIndex].name
					var result = [resultIndex, resultInfo];
				}else {
					var resultIndex = [];
					var resultInfo = "Current Highest: Draw with High Card: ";
					for (var i=0; i<winnerIndex.length; i++){
						resultIndex.push(winnerIndex[i]);
						resultInfo = resultInfo+players[resultIndex[i]].name+" ";
					}
					var result = [resultIndex, resultInfo];
				}

				break;

			case "Pair":
				var highestValue = -1;
				var highestIndex = [];

				for (var i=0; i<highestHandsPlayerIndex.length; i++){
					var cardValue = getValueFromId(players[highestHandsPlayerIndex[i]].hands.cardsArray[0]);
					var cardOrder = nativeValues.indexOf(cardValue);

					if (cardOrder > highestValue){
						highestIndex = [];
						highestIndex.push(i);
						highestValue = cardOrder;
					} else if (cardOrder === highestValue){
						highestIndex.push(i);
					} else {
					}
				}
				if (highestIndex.length === 1){
					var resultIndex = highestHandsPlayerIndex[highestIndex];
					var resultInfo = "Current Highest: with Pair: "+players[resultIndex].name;
					var result = [[resultIndex], resultInfo];
					
				}else if(highestIndex.length > 1){
					var cardsToCheckKickers = [];
					
					for (var i=0; i<highestIndex.length; i++){
						var firstCardOfPair = getCardObjectFromName(players[highestHandsPlayerIndex[highestIndex[i]]].hands.cardsArray[0]);
						var secondCardOfPair = getCardObjectFromName(players[highestHandsPlayerIndex[highestIndex[i]]].hands.cardsArray[1]);

						cardsToCheckKickers.push(cards[highestIndex[i]].filter(function(item) { 
							return item["id"] != firstCardOfPair[0].id && item["id"] != secondCardOfPair[0].id ; 
						}));
					}

					if (cardsToCheckKickers[0].length != 0){
						var winnerArray = checkKickers(cardsToCheckKickers, 3);
					}else {
						var winnerArray = highestIndex;
					}
										
					if (winnerArray.length == 1){
						var resultIndex = highestHandsPlayerIndex[highestIndex[winnerArray]];
						var resultInfo = "Current Highest: with kickers after Pair Draw: "+players[resultIndex].name;
						var result = [[resultIndex], resultInfo];
					} else {
						var resultIndex = [];
						var resultInfo = "Current Highest: Draw after Pair Draw and kickers: ";
						
						for (var i=0; i<winnerArray.length; i++){
							resultIndex.push(highestHandsPlayerIndex[highestIndex[winnerArray[i]]]);
							resultInfo = resultInfo+(players[resultIndex[i]].name)+" ";
						}
						var result = [resultIndex, resultInfo];
					}			
				}
				break;
				
			case "Double Pair":
				//Checking highest pair
				var highestValue = -1;
				var highestIndexHighPair = [];
				
				for (var i=0; i<highestHandsPlayerIndex.length; i++){
					var cardValue1 = getValueFromId(players[highestHandsPlayerIndex[i]].hands.cardsArray[0]);
					var cardValue2 = getValueFromId(players[highestHandsPlayerIndex[i]].hands.cardsArray[2]);
					
					var cardOrder1 = nativeValues.indexOf(cardValue1);
					var cardOrder2 = nativeValues.indexOf(cardValue2);
					
					if (cardOrder1 > cardOrder2){
						cardOrder = cardOrder1;
					}else{
						cardOrder = cardOrder2;
					}

					if (cardOrder > highestValue){
						highestIndexHighPair = [];
						highestIndexHighPair.push(highestHandsPlayerIndex[i]);
						highestValue = cardOrder;
					} else if (cardOrder === highestValue){
						highestIndexHighPair.push(highestHandsPlayerIndex[i]);
					} 
				}
				if (highestIndexHighPair.length === 1){
					var resultIndex = highestIndexHighPair;
					var resultInfo = "Current Highest: with Double Pair: "+players[resultIndex].name;
					var result = [resultIndex, resultInfo];
					
				}else if(highestIndexHighPair.length > 1){
					//Checking lowest pair
					var highestValue = -1;
					var highestIndexLowPair = [];
					
					for (var i=0; i<highestIndexHighPair.length; i++){
						var cardValue1 = getValueFromId(players[highestIndexHighPair[i]].hands.cardsArray[0]);
						var cardValue2 = getValueFromId(players[highestIndexHighPair[i]].hands.cardsArray[2]);
						var cardOrder1 = nativeValues.indexOf(cardValue1);
						var cardOrder2 = nativeValues.indexOf(cardValue2);
						
						if (cardOrder1 < cardOrder2){
							cardOrder = cardOrder1;
						}else{
							cardOrder = cardOrder2;
						}

						if (cardOrder > highestValue){
							highestIndexLowPair = [];
							highestIndexLowPair.push(highestIndexHighPair[i]);
							highestValue = cardOrder;
						} else if (cardOrder === highestValue){
							highestIndexLowPair.push(highestIndexHighPair[i]);
						} 
					}
					
					if (highestIndexLowPair.length === 1){
						var resultIndex = highestIndexLowPair;
						var resultInfo = "Current Highest: with Double Pair: "+players[resultIndex].name;
						var result = [resultIndex, resultInfo];
						
					}else if(highestIndexLowPair.length > 1){
						var cardsToCheckKickersArray = [];
						var cardsToCheckKickersIndexes = [];
						
						for (var i=0; i<highestIndexLowPair.length; i++){
							var playerCards = players[highestIndexLowPair[i]].hands.cardsArray;
							var cardsToRemove = [];
							
							for (var j=0; j<playerCards.length; j++){
								var cardObj = getCardObjectFromName(playerCards[j]);
								cardsToRemove[j] = cardObj[0];
							}
							cardsToCheckKickers = cards[highestHandsPlayerIndex.indexOf(highestIndexLowPair[i])].filter( function( el ) {
								return cardsToRemove.indexOf( el ) < 0;
							});
							cardsToCheckKickersArray.push(cardsToCheckKickers);
							cardsToCheckKickersIndexes.push(highestIndexLowPair[i]);
						}

						var winnerArray = checkKickers(cardsToCheckKickersArray, 1);
						
						if (winnerArray.length == 1){
							var resultIndex = [cardsToCheckKickersIndexes[winnerArray]];
							var resultInfo = "Current Highest: by kickers after Double Pair Draw: "+players[resultIndex].name;
							var result = [resultIndex, resultInfo];
						} else {
							var resultIndex = [];
							var resultInfo = "Current Highest: Draw after Double Pair Draw and kickers: ";
							for (var i=0; i<winnerArray.length; i++){
								resultIndex.push(cardsToCheckKickersIndexes[i]);
								resultInfo = resultInfo+players[cardsToCheckKickersIndexes[i]].name+" ";
							}
							var result = [resultIndex, resultInfo];
						}			
					}
				}
				
				break;
				
			case "Three of Kind":
				var highestValue = -1;
				var highestIndex = [];

				for (var i=0; i<highestHandsPlayerIndex.length; i++){
					var cardValue = getValueFromId(players[highestHandsPlayerIndex[i]].hands.cardsArray[0]);
					var cardOrder = nativeValues.indexOf(cardValue);

					if (cardOrder > highestValue){
						highestIndex = [];
						highestIndex.push(i);
						highestValue = cardOrder;
					} else if (cardOrder === highestValue){
						highestIndex.push(i);
					} 
				}
				if (highestIndex.length === 1){
					var resultIndex = highestHandsPlayerIndex[highestIndex];
					var resultInfo = "Current Highest: with Three of Kind: "+players[resultIndex].name;
					var result = [];
					result.push([resultIndex], resultInfo);
					
				}else if(highestIndex.length > 1){
					var cardsToCheckKickers = [];
					
					for (var i=0; i<highestIndex.length; i++){
						var firstCardOfThree = getCardObjectFromName(players[highestHandsPlayerIndex[highestIndex[i]]].hands.cardsArray[0]);
						var secondCardOfThree = getCardObjectFromName(players[highestHandsPlayerIndex[highestIndex[i]]].hands.cardsArray[1]);
						var thirdCardOfThree = getCardObjectFromName(players[highestHandsPlayerIndex[highestIndex[i]]].hands.cardsArray[2]);
						cardsToCheckKickers.push(cards[highestIndex[i]].filter(function(item) { 
							return item["id"] != firstCardOfThree[0].id && item["id"] != secondCardOfThree[0].id && item["id"] != thirdCardOfThree[0].id ; 
						}));
					}
					
					var winnerArray = checkKickers(cardsToCheckKickers, 2);
					var winnerIndexFinal = [];
					
					if (winnerArray.length == 1){
						var resultIndex = [highestHandsPlayerIndex[highestIndex[winnerArray]]];
						var resultInfo = "Current Highest: with kickers after Three of Kind Draw: "+players[resultIndex].name;
						var result = [resultIndex, resultInfo];
					} else {
						var resultIndex = [];
						var resultInfo = "Current Highest: Draw after Three of Kind Draw and kickers: ";
						for (var i=0; i<winnerArray.length; i++){
							resultIndex.push(highestHandsPlayerIndex[highestIndex[winnerArray[i]]]);
							resultInfo = resultInfo+(players[resultIndex[i]].name)+" ";
						}
						var result = [resultIndex, resultInfo];
					}			
				}

				break;
				
			case "Straight":
			case "Straight Flush":
			case "Royal Flush":
				
				var highestOrder = -1;
				var highestIndex = [];

				for (var i=0; i<highestHandsPlayerIndex.length; i++){
					var cardsArray = players[highestHandsPlayerIndex[i]].hands.cardsArray;
					var highestOrderStraight = -1;
					var lowestOrderStraight = 30;
					
					for (var j=0; j<cardsArray.length; j++){
						var cardValue = getValueFromId(cardsArray[j]);
						var cardOrder = nativeValues.indexOf(cardValue);
						
						if (cardOrder > highestOrderStraight ){
							highestOrderStraight  = cardOrder;
						}
						if (cardOrder < lowestOrderStraight){
							lowestOrderStraight = cardOrder;
						}
					}
					
					if (highestOrderStraight === 12 && lowestOrderStraight === 0){ //Checking if Ace is on the lower end of straight [A, 2, 3, 4, 5]
						highestOrderStraight = 3;
					}
					
					if (highestOrderStraight > highestOrder){
						highestOrder = highestOrderStraight;
						highestIndex = [];
						highestIndex.push(i);
					}else if (highestOrderStraight == highestOrder){
						highestIndex.push(i);
					}
				}
				if (highestIndex.length === 1){
					var resultIndex = highestHandsPlayerIndex[highestIndex];
					var resultInfo = "Current Highest: after Straight Draw: "+players[resultIndex].name;
					var result = [[resultIndex], resultInfo];
					
				} else {
					var resultIndex = [];
					var resultInfo = "Current Highest: draw after Straight Draw: ";
					for (var j=0; j<highestIndex.length; j++){
						resultIndex.push(highestHandsPlayerIndex[highestIndex[j]]);
						resultInfo = resultInfo+players[resultIndex[j]].name+" ";
					}
					var result = [resultIndex, resultInfo];
				}
				break;
				
			case "Flush":
				var cardsArray = [];
				for (var i=0; i<highestHandsPlayerIndex.length; i++){
					var playerCards = players[highestHandsPlayerIndex[i]].hands.cardsArray;
					var playerCardsObjects = [];
					for (var j=0; j<playerCards.length; j++){ //converting cards to objects
						var cardObject = getCardObjectFromName(playerCards[j]);
						playerCardsObjects.push(cardObject[0]);
					}
					cardsArray.push(playerCardsObjects);
				}
				var winnerArray = checkKickers(cardsArray);
				
				if (winnerArray.length === 1){
					var resultIndex = [highestHandsPlayerIndex[winnerArray]];
					var resultInfo = "Current Highest: after Flush Draw: "+players[resultIndex].name;
					var result = [resultIndex, resultInfo];
					
				}else{
					var resultIndex = [];
					var resultInfo = "Current Highest: draw after Flush Draw: ";
					for (var i=0; i<winnerArray.length; i++){
						resultIndex.push(highestHandsPlayerIndex[winnerArray[i]]);
						resultInfo = resultInfo+players[resultIndex[i]].name+" "
					}
					var result = [resultIndex, resultInfo];
				}
				break;
				
			case "Full House":
				//Wyszukac jaki jest value karty z trojki. Sprawdzic jaki ma Order. Porownac. Jak takie same przejsc do par. Jak tez takie same to remis
				var highestThreeCardIndex;
				var highestThreeCardOrder = -1;
				
				for (var i=0; i<highestHandsPlayerIndex.length; i++){
					var playerFiveCards = players[highestHandsPlayerIndex[i]].hands.cardsArray;
					var playerFiveCardsValues = [];
					var threeCardOrder;
					
					for (var j=0; j<playerFiveCards.length; j++){
						playerFiveCardsValues[j] = getValueFromId(playerFiveCards[j]);
					}
					
					loop1:
					for (var j=0; j<playerFiveCardsValues.length; j++){
						if (countInArray(playerFiveCardsValues, playerFiveCardsValues[j]) === 3){
							threeCardOrder = nativeValues.indexOf(playerFiveCardsValues[j]);
							break loop1;
						}
					}
					
					if (threeCardOrder > highestThreeCardOrder){
						highestThreeCardIndex = [];
						highestThreeCardIndex.push(i);
						highestThreeCardOrder = threeCardOrder;
					} else if (threeCardOrder === highestThreeCardOrder){
						highestThreeCardIndex.push(i);
					}
				}
				
				if (highestThreeCardIndex.length === 1){		
					var resultIndex = highestHandsPlayerIndex[highestThreeCardIndex[0]];
					var resultInfo = "Current Highest: after Full House Draw: "+players[resultIndex].name;
					var result = [];
					result.push([resultIndex], resultInfo);
					
				} else {
					var highestPairCardIndex = [];
					var highestPairCardOrder = -1;
					
					for (var i=0; i<highestThreeCardIndex.length; i++){
						var playerFiveCards = players[highestHandsPlayerIndex[i]].hands.cardsArray;
						var playerFiveCardsValues = [];
						var pairCardOrder;

						for (var j=0; j<playerFiveCards.length; j++){
							playerFiveCardsValues[j] = getValueFromId(playerFiveCards[j]);
						}
						
						loop1:
						for (var j=0; j<playerFiveCardsValues.length; j++){
							if (countInArray(playerFiveCardsValues, playerFiveCardsValues[j]) === 2){
								pairCardOrder = nativeValues.indexOf(playerFiveCardsValues[j]);
								break loop1;
							}
						}
						if (pairCardOrder > highestPairCardOrder){
							highestPairCardIndex = [];
							highestPairCardIndex.push(i);
							highestPairCardOrder = pairCardOrder;
						} else if (pairCardOrder == highestPairCardOrder){
							highestPairCardIndex.push(i);
						}
					}
					if (highestPairCardIndex.length === 1){
						var resultIndex = highestHandsPlayerIndex[highestPairCardIndex[0]];
						var resultInfo = "Current Highest: after Full House Draw: "+players[resultIndex].name;
						var result = [];
						result.push([resultIndex], resultInfo);

					} else {
						var resultIndex = [];
						var resultInfo = "Current Highest: Draw after Full House Draw: ";
						for (var i=0; i<highestPairCardIndex.length; i++){
							resultIndex.push(highestHandsPlayerIndex[highestPairCardIndex[i]]);
							resultInfo = resultInfo+players[resultIndex[i]].name+" ";
						}
						var result = [resultIndex, resultInfo];
					}
						
				}
				break;
				
			case "Four of Kind":
				var highestOrder = -1;
				var highestIndex = [];
				
				for (var i=0; i<highestHandsPlayerIndex.length; i++){
					var cardValue = getValueFromId(players[highestHandsPlayerIndex[i]].hands.cardsArray[0]);
					var cardOrder = nativeValues.indexOf(cardValue);
					
					if (cardOrder > highestOrder){
						highestIndex = [];
						highestIndex.push(i);
						highestOrder = cardOrder;
					}else if (cardOrder === highestOrder){
						highestIndex.push(i);
					}
				}
				if (highestIndex.length === 1){
					var resultIndex = highestIndex;
					var resultInfo = "Current Highest: after Four of Kind Draw: "+players[highestIndex[0]].name;
					var result = [resultIndex, resultInfo];

				}else{
					var resultIndex = [];
					var resultInfo = "Current Highest: draw after Four of Kind Draw: ";
					for (var i=0; i<highestIndex.length; i++){
						resultIndex.push(highestHandsPlayerIndex[highestIndex[i]]);
						resultInfo = resultInfo+players[resultIndex[i]].name+" "
					}
					var result = [resultIndex, resultInfo];
				}
				break;
				
		}//switch end
	}
	return result;
	
	function checkKickers(cardsArray, n){ //INPUT: array of arrays(2-6 players) of objects(2-7 cards) ie. [[obj, obj, obj], [obj, obj, obj]]
		var playersInGame = [];
		for (var i=0; i<cardsArray.length; i++){
			playersInGame.push(i)
		}
		
		loop1:
		for (var i=0; i<cardsArray[0].length; i++){
			var highestOrder = -1;
			var highestIndexes = [];
			for (var j=0; j<cardsArray.length; j++){
				if (playersInGame.includes(j)){
					if (cardsArray[j][i].order > highestOrder){
						highestOrder = cardsArray[j][i].order;
						highestIndexes = [];
						highestIndexes.push(j);
					} else if (cardsArray[j][i].order == highestOrder){
						highestIndexes.push(j);
					} else {
					}
				}
			}

			if (highestIndexes.length == 1){
				break loop1;
			} else if (highestIndexes.length > 1){
				if (i >= n){
					break loop1;
				} else {
					playersInGame = highestIndexes;
				}
			}

		}
		return(highestIndexes);
	}
	
}

//DISPLAYING INFORMATIONS ON SCREEN FUNCTIONS
function displayStatus(){
	///update display for every player
	$(".player-seat").css("border-color", "black");
	$("#player"+currentPlayerPosition).css("border-color", "red");
	
	for(var i=0; i<players.length; i++){
		var divId = "player"+i;
		
		if ($("#"+divId+" .player-name").text() !== players[i].name){
			$("#"+divId+" .player-name").html(players[i].name);
		}
		$("#"+divId+" .player-tokens").html(players[i].tokens);
		
		if (players[i].id != humanPlayerId && showAllCards == false){
			if ($('#'+divId+" .player-cards-container .cards-card-back").length == 0){
				var cardDiv = "<div class='card cards-card-back'></div>";
				$('#'+divId+" .player-cards-container").html(cardDiv +cardDiv);
			}
		}else {
			showCards([i]);
		}
	
		$("#"+divId+" .player-status").html("Status: "+currentStatus[i]);
		
		//display bid tokens for every player
		if ($("#"+divId+" .player-bid .tokens-container.tokens-number-"+currentBids[i]).length == 0){
			if (currentBids[i] == 0){
				 if ($("#"+divId+" .player-bid .tokens-container").length != 0){
						$("#"+divId+" .player-bid").empty();					 
				 }
			}else {
				var bidGraphicalDiv = displayGraphicalTokens(currentBids[i], "horizontal");
				$("#"+divId+" .player-bid").html(bidGraphicalDiv);
			}
		}
		
		
		if (currentStatus[i] == "pass" || currentStatus[i] == "not playing" ){
			$("#player"+i).css("border-color", "#ABA");
		}
	}
	
	///update display for main table
	
	//display pot tokens
	if ($(".pot-tokens-container .tokens-container.tokens-number-"+potValue).length == 0){
		if (potValue == 0){
			 if ($(".pot-tokens-container").children().length != 0){
				 $(".pot-tokens-container").empty();	
			 }
		}else {
			var potGraphicalDiv = displayGraphicalTokens(potValue, "horizontal");
			$(".pot-tokens-container").html(potGraphicalDiv);
		}
	}
	//display table cards
	if (tableCards.length !== 0){
		for (var i=0; i<tableCards.length;i++) {
			var fileName = "cards-"+tableCards[i].value+"-of-"+tableCards[i].suit;
			if ($(".center-table-cards ."+fileName).length == 0){
				var cardDiv = "<div class='card "+fileName +"'></div>";
				$(".center-table-cards").append(cardDiv);
			}
		}
	}else {
		$(".center-table-cards").empty();
	}
	//Giving dealer, smallblind and bigblind chips
	var dealerPosition = smallBlindPosition -1;
	if (dealerPosition < 0){
		dealerPosition = players.length-1;
	}
	
	if ($("#player"+dealerPosition+" .player-special-chip .token-dealer").length == 0){
		$(".token-dealer").appendTo($("#player"+dealerPosition+" .player-special-chip"));
		$(".token-sb").appendTo($("#player"+smallBlindPosition+" .player-special-chip"));
		$(".token-bb").appendTo($("#player"+bigBlindPosition+" .player-special-chip"));
	}
		
	//Setting bid limit, button texts and other interface informations
	if (players[currentPlayerPosition].id === 0){

		var playerHand = players[currentPlayerPosition].hands;
		var playerHandString = "Hand: "+players[currentPlayerPosition].hands.type +" ";
		
		
		if (typeof playerHand.cardsArray === 'string'){
			var card = playerHand.cardsArray.slice(0, 1);
			if (card === "1"){ card = "T"; }
			playerHandString = playerHandString + card.toUpperCase();
		}else {
			for (var i=0; i<playerHand.cardsArray.length; i++){
				var card = playerHand.cardsArray[i].slice(0, 1);
				if (card === "1"){ card = "T"; }
				playerHandString = playerHandString + card.toUpperCase();
			}
		}
		$('.right-column .player-hand').text(playerHandString);
		$('.right-column .player-hand').attr("data-cards", playerHand.cardsArray);
		
		var bidLimit = players[currentPlayerPosition].tokens - (Math.max(...currentBids) - currentBids[currentPlayerPosition]);
			
		$('#bid-value').attr("max", bidLimit);
		$('#bid-value').attr("value", bigBlindValue);

		if (bidLimit <= 0){
			$('.bid-button').attr("disabled", "disabled");
			$('#bid-value').attr("disabled", "disabled");
		} else {
			$('.bid-button').attr("disabled", false);
			$('#bid-value').attr("disabled", false);
		}
		
		
		var tokensToCall = Math.max(...currentBids) - currentBids[currentPlayerPosition];
		
		if (tokensToCall == 0){
			$('.check-button').html('Wait');
		}else {
			$('.check-button').html('Call '+tokensToCall);
		}
		
		$(".bid-button").html("Raise by "+$('#bid-value').val());
		
	}
	
	//Disabling pass button when waiting is possible
	if (currentBids[currentPlayerPosition] == Math.max(...currentBids)){
		$('.pass-button').attr("disabled", "disabled");
	} else {
		$('.pass-button').attr("disabled", false);
	}
}


function displayGraphicalTokens(tokens, horizontalOrVertical){
	var numberOfBaseTokens = calculateGraphicalTokens(tokens); // 1000, 500, 100, 25, 10, 5, 1
	var classNames = ["token-1000", "token-500", "token-100", "token-25", "token-10", "token-5", "token-1"];
	var div = "<div class='tokens-container tokens-number-"+tokens +"'>";
	
	if (horizontalOrVertical == "horizontal"){
		for (var i=0; i<numberOfBaseTokens.length; i++){
			var stackDiv = "";
			if (numberOfBaseTokens[i] != 0){
				stackDiv = "<div class='tokens-stack'>";
				for (var j=0; j<numberOfBaseTokens[i]; j++){
					stackDiv = stackDiv+"<div class='token "+classNames[i]+"' style='top: "+j*-4 +"px'></div>";
				}
				stackDiv = stackDiv+"</div>";
			}
			div = div+stackDiv;
		} 
		div = div+"</div>"
		
	}else if (horizontalOrVertical == "vertical"){
		var stackDiv = "<div class='tokens-stack'>";
		var topCounter = 0;

		for (var i=0; i<numberOfBaseTokens.length; i++){
			if (numberOfBaseTokens[i] != 0){
				for (var j=0; j<numberOfBaseTokens[i]; j++){
					topCounter++;
					stackDiv = stackDiv+"<div class='token "+classNames[i]+"' style='top: " +topCounter*-5 +"px'></div>";
				}
			}
		}
		div = stackDiv+"</div>";
	}
	
	
	return div;
	
	function calculateGraphicalTokens(){
		var tokensLeft = tokens;
		var tokensBaseValues = [1000, 500, 100, 25, 10, 5, 1];
		var numberOfBaseTokens = [0, 0, 0, 0, 0, 0, 0];

		for (var i=0; i<tokensBaseValues.length; i++){
			if (tokensLeft >= tokensBaseValues[i]){
				var quantity = Math.floor(tokensLeft/tokensBaseValues[i]);
				tokensLeft = tokensLeft - quantity*tokensBaseValues[i];
				numberOfBaseTokens[i] = quantity;
			}
		}
		return numberOfBaseTokens;
	}
}

function showCards(playersIndexes){//takes array of players index
	for (var i=0; i<playersIndexes.length; i++){
		var divId = "player"+playersIndexes[i];
		if (currentStatus[playersIndexes[i]] != "not playing"){
			
			var fileName1 = "cards-"+players[playersIndexes[i]].cards[0].value+"-of-"+players[playersIndexes[i]].cards[0].suit;
			var fileName2 = "cards-"+players[playersIndexes[i]].cards[1].value+"-of-"+players[playersIndexes[i]].cards[1].suit;

			var cardDiv1 = "<div class='card "+fileName1 +"'></div>";
			var cardDiv2 = "<div class='card "+fileName2 +"'></div>";

			if ($('#'+divId+" .player-cards-container").find('.card').length == 0) {
				$('#'+divId+" .player-cards-container").append(cardDiv1);
				$('#'+divId+" .player-cards-container").append(cardDiv2);
			}else {
				if ( !($('#'+divId+' .card:first').hasClass(fileName1)) && !($('#'+divId+' .card:first').hasClass(fileName2)) ){
					$('#'+divId+' .card:first').replaceWith(cardDiv1);
				}
				if ( !($('#'+divId+' .card:eq(1)').hasClass(fileName1)) && !($('#'+divId+' .card:eq(1)').hasClass(fileName2)) ){
					$('#'+divId+' .card:eq(1)').replaceWith(cardDiv2);
				}
			}
		}else {
			if (players[playersIndexes[i]].tokens < bigBlindValue){
				if ($('#'+divId+" .player-cards-container").find('.cards-card-back').length == 0) {
					var cardDiv = "<div class='card cards-card-back'></div>";
					$('#'+divId+" .player-cards-container").html(cardDiv +cardDiv);
				}
			}
		}
	}
}

function addToLog(string, hide){ //string to add, hide(true, false)\
	if (hide == false || showAllCards == true){
		$(".log-display").append(string+"<br>");
		$(".log-display").scrollTop($(".log-display")[0].scrollHeight);
	}
}
//---------------------

//Function that gives starting pair of cards
function giveTwoCards() {
	for (var i = 0; i < 2; i++) {
		for (var j = 0; j < players.length; j++) {
			if (currentStatus[j] != "not playing"){
				players[j].cards[i] = deck[deckPointer];
				deckPointer++; 
			}
		}
	}
}

function takeBlinds(){
	if (bigBlindIncrease == true){
		bigBlindValue = bigBlindValue*2;
		bigBlindIncrease = false;
	}

	players[smallBlindPosition].tokens = players[smallBlindPosition].tokens-(bigBlindValue/2);
	players[bigBlindPosition].tokens = players[bigBlindPosition].tokens-bigBlindValue;
	currentBids[smallBlindPosition] = bigBlindValue/2;
	currentBids[bigBlindPosition] = bigBlindValue;
	
	currentStatus[smallBlindPosition] = "SB";
	currentStatus[bigBlindPosition] = "BB";
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function sumBidsToPot(){
	for (var i=0; i<players.length; i++){
		potValue = potValue + currentBids[i];
		currentBids[i] = 0;
	}
}


function getCardObjectFromName(value_of_suit){
  var indexValue = value_of_suit.indexOf("_"); 
  var value = value_of_suit.slice(0, indexValue);
	
	var indexSuit = value_of_suit.lastIndexOf("_");
  var suit = value_of_suit.slice(indexSuit+1, value_of_suit.length);
	
	var card = nativeCards.filter(function(item) { return item["value"] == value && item["suit"] == suit; });
	return card;
}
//Function that counts how many times an array element appears
function countInArray(array, what) { 
    return array.filter(item => item == what).length;
}

//FUNCTIONS FOR DEBUGGING:
function changeCards(playerId, cardsIds){
	players[playerId].cards = [];
	
	var card1 = $.grep(deck, function(e){ return e.id == cardsIds[0]; });
	var card2 = $.grep(deck, function(e){ return e.id == cardsIds[1]; });

	players[playerId].cards = [card1[0], card2[0]];
}

function changeTableCards(cardsIds){
	console.log(tableCards);
	tableCards = [];
	
	for (var i=0; i<cardsIds.length; i++){
		var card = $.grep(deck, function(e){ return e.id == cardsIds[i]; });
		console.log(card);
		tableCards.push(card[0]);
		console.log(tableCards);
	}
}

//Tooltip showing number of tokens in tokens-container
 $(document).on("mouseenter", ".tokens-container", function() {
	var tokens = this.className.match(/tokens-number-\d+/)[0].slice(14);	
	$(this).append("<div class='tokens-container-popup'>"+tokens +"</div>");
	tokens = null;
});

$(document).on("mouseleave", ".tokens-container", function() {
	setTimeout(function(){
		$(".tokens-container-popup").empty().remove();
	}, 600);
});

//Highlighting cards when mouseover on playerhand info in interface
$(document).on("mouseenter", ".interface .player-hand", function() {
	var cards = $(this).attr("data-cards");

	if (typeof cards !== typeof undefined && cards !== false) {
		cards = cards.split(",");
		$(".card:not(.cards-card-back)").each(function(){
			$(this).addClass("card-faded");
		})

		if (typeof cards === 'string'){
			var card = "cards-"+cards.replace(/\_/g, "-");
			$("."+card).removeClass("card-faded");
		}else {
			for (var i=0; i<cards.length; i++){
				var card = "cards-"+cards[i].replace(/\_/g, "-");
				$("."+card).removeClass("card-faded");
			}
		}
	}
});

$(document).on("mouseleave", ".interface .player-hand", function() {
	$(".card").each(function(){
		$(this).removeClass("card-faded");
	})
});

$(window).on('resize', switchPlayersMobile);
$(document).ready(switchPlayersMobile);

function switchPlayersMobile(){
	var win = $(window);
	div1 = $('#player2');
	div2 = $('#player5');

	if (win.width() < 600 && div1.hasClass("replaced") == false) { 
		tdiv1 = div1.clone();
		tdiv2 = div2.clone();

		if(!div2.is(':empty')){
			div1.replaceWith(tdiv2);
			div2.replaceWith(tdiv1);
			tdiv1.addClass("replaced");
		}
	}else if (win.width() >= 600 && div1.hasClass("replaced") == true) {
		tdiv1 = div1.clone();
		tdiv2 = div2.clone();

		if(!div2.is(':empty')){
			div1.replaceWith(tdiv2);
			div2.replaceWith(tdiv1);
			tdiv1.removeClass("replaced");
		}
	}
}