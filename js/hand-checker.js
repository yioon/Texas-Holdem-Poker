var cardsValues = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];
var cardsSuits = ["clubs", "diamonds", "spades", "hearts"];
var handsOrder = ["High Card", "Pair", "Double Pair", "Three of Kind", "Straight", "Flush", "Full House", "Four of Kind", "Straight Flush", "Royal Flush"];



function checkHand(cards){ //arg: Object card
	var pickedCards = [];
	for (var i=0; i<cards.length; i++){
		var cardName = cards[i].value+"_of_"+cards[i].suit;
		pickedCards.push(cardName);
	}

  var pickedCardsValues = [];
  var pickedCardsSuits = [];
  var possibleHands = []; 
  
  function Hand(type, cardsArray, order){ //types: pair, double pair, three of kind, straight, flush, full house, four of kind, straight flush, royal flush//
    this.type = type;
    this.cardsArray = cardsArray;
    this.order = order;
  }
    
  for (i=0; i<pickedCards.length; i++){
    var value = getValueFromId(pickedCards[i]);
    pickedCardsValues.push(value);
    var suit = getSuitFromId(pickedCards[i]);
    pickedCardsSuits.push(suit); 
  }

  checkForMultiple();
    
  function checkForMultiple(){
    var multiples = [];
    var used = [];
    
    checkForHighcard();
    checkForPairs();
    checkForThrees();
    checkForFours();
    checkForDoublePairs();
    checkForFull();
    checkForStraight();
    checkForFlush();
    
    sortHandsByOrder();
    
    function checkForHighcard(){
      if (pickedCardsValues.length>0){
        var max = 0;
        var highCard = '';
        
        for (i=0; i<pickedCardsValues.length; i++){
          var order = cardsValues.indexOf(pickedCardsValues[i])+1;
          if (order > max){
            max = order;
            highCard = pickedCardsValues[i] +"_of_" +pickedCardsSuits[i];
          }
        }
        var hand = new Hand("High Card", highCard, 0);
        possibleHands.push(hand);
      }
    }   
    
    //Check for ALL possible pairs
    function checkForPairs(){
      var pairs = [];
      if (pickedCardsValues.length>1){
        for (i=0; i<pickedCardsValues.length-1; i++){
          for (j=i+1; j<pickedCardsValues.length; j++){
            if (pickedCardsValues[i] == pickedCardsValues[j]){
              var temp1 = pickedCardsValues[i]+"_of_"+pickedCardsSuits[i];
              var temp2 = pickedCardsValues[j]+"_of_"+pickedCardsSuits[j];
              var hand = new Hand("Pair", [temp1, temp2], 1);
              possibleHands.push(hand);
            }
          }
        }
      }
      
    }
    //Check for ALL possible threes
    function checkForThrees(){
      
      if (pickedCardsValues.length>2){
        for (i=0; i<pickedCardsValues.length-2; i++){
          for (j=i+1; j<pickedCardsValues.length-1; j++){
            if (pickedCardsValues[i] == pickedCardsValues[j]){
              for (k=j+1; k<pickedCardsValues.length; k++){
                if (pickedCardsValues[j] == pickedCardsValues[k]){
                  var temp1 = pickedCardsValues[i]+"_of_"+pickedCardsSuits[i];
                  var temp2 = pickedCardsValues[j]+"_of_"+pickedCardsSuits[j];
                  var temp3 = pickedCardsValues[k]+"_of_"+pickedCardsSuits[k];
                  var hand = new Hand("Three of Kind", [temp1, temp2, temp3], 3);
                  possibleHands.push(hand);
                }
              }
            }
          }
        }
      }
            
    }
    
    //Check for four
    function checkForFours(){
      
      if (pickedCardsValues.length>3){
        for (i=0; i<pickedCardsValues.length-1; i++){
          var indexes = [i];
          
          for (j=i+1; j<pickedCardsValues.length; j++){
            if (pickedCardsValues[i] == pickedCardsValues[j]){
              indexes.push(j);
            }
          }
          if (indexes.length == 4){
            var cardsArr = [];
            for (i=0; i<indexes.length; i++){
              var temp = pickedCardsValues[indexes[i]]+"_of_"+pickedCardsSuits[indexes[i]];
              cardsArr.push(temp);
            }
            var hand = new Hand("Four of Kind", cardsArr, 7);
            possibleHands.push(hand);
            break;
          }
        }
      }
            
    }
       
    //Function to check for double pairs. Will not check in threes and fours, only strict double pairs
    function checkForDoublePairs(){
      var pairs = [];
      
      for (i=0; i<possibleHands.length; i++){
        if (possibleHands[i].type == "Pair"){
          pairs.push(possibleHands[i].cardsArray);
        }
      }
      
      if (pairs.length >= 2){
        for (i=0; i<pairs.length-1; i++){
          for (j=i+1; j<pairs.length; j++){
            if (pairs[i][0].charAt(0) != pairs[j][0].charAt(0)){
              var temp = pairs[i];
              var temp2 = pairs[j];
              var doublePairCards = temp.concat(temp2);

              var hand = new Hand("Double Pair", doublePairCards, 2);
              possibleHands.push(hand);
            }
          }
        }
      } 
    }
    
    //Function checking for full, only the biggest full is added to possiblehands
    function checkForFull(){
      var pairs = [];
      var threes = [];
      var usedCards = [];
           
      for (i=0; i<possibleHands.length; i++){
        if(possibleHands[i].type == "Three of Kind"){
          threes.push(possibleHands[i].cardsArray); //Add possible three     
        }else if (possibleHands[i].type == "Pair"){
          pairs.push(possibleHands[i].cardsArray);
        }
      }
      
      if (threes.length == 0){
        return;
      }
      
      var biggestThrees = [];
      var max = 0;
      
      for (i=0; i<threes.length; i++){
        var value = getValueFromId(threes[i][0]);
        var order = cardsValues.indexOf(value);
        if (order >= max){
          max = order;
          biggestThrees = threes[i];
        }
      }
      usedCards = biggestThrees;
      
      var biggestPair = [];
      var max = 0;
      
      
      loop1:
      for (i=0; i<pairs.length; i++){
        for (j=0; j<usedCards.length; j++){
          if ((usedCards[j] == pairs[i][0]) || (usedCards[j] == pairs[i][1])){
            continue loop1;
          }
        }

        var value = getValueFromId(pairs[i][0]);
        var order = cardsValues.indexOf(value);
        if (order >= max){
          max = order;
          biggestPair = pairs[i];
        }  
      }
      
      if (biggestThrees.length != 0 && biggestPair.length != 0){
        var hand = new Hand("Full House", biggestThrees.concat(biggestPair), 6);
        possibleHands.push(hand);   
      }  
    }
    
    //Check for highest flush
    function checkForFlush(){
      var list = [];
      var cardsArr = pickedCards;
      
      //creating list of all picked cards
      for (i=0; i<cardsArr.length; i++){
        var suit = getSuitFromId(cardsArr[i]);
        var value = getValueFromId(cardsArr[i]);
        var order = cardsValues.indexOf(value)+1;
        list.push({card: cardsArr[i], suit: suit, order: order});
      }
      //sorting list by suit
      list.sort(function(a, b) {
        return ((a.suit < b.suit) ? -1 : ((a.suit == b.suit) ? 0 : 1));
      });

      loop1:
      for (i=0; i<list.length-4; i++){
        var sameSuitList = [list[i]];
        
        for (j=i+1; j<list.length; j++){
          if (list[i].suit == list[j].suit){
            sameSuitList.push(list[j]);
          }
        }
        
        if (sameSuitList.length >= 5){
          sameSuitList.sort(function(a, b) {
            return ((a.order > b.order) ? -1 : ((a.order == b.order) ? 0 : 1));
          });
          
          var cards = [];
          for (k=0; k<5; k++){
            cards.push(sameSuitList[k].card);
          }

          var hand = new Hand("Flush", cards, 5);
          possibleHands.push(hand);   
          
          break loop1; 
        }
      }
      
    }
    
    //Check for highest straight and for flush straight/royal flush
    function checkForStraight(){
      var values = [];
      var list = [];
      var highestStraightAdded = false;
      var highestStraightFlushAdded = false;
      
      if (pickedCards.length >= 5){
        for (i=0; i<pickedCards.length; i++){
          var value = getValueFromId(pickedCards[i]);
          var order = cardsValues.indexOf(value);
          var suit = getSuitFromId(pickedCards[i]);
          list.push({card: pickedCards[i], order: order+1, suit: suit});
          //Adding additional order for Ace as this card can be last and first in straight
          if (value == "ace"){
            list.push({card: pickedCards[i], order: 0});
          }
        }
      }
      //Sorting by order
      list.sort(function(a, b) {
        return ((a.order > b.order) ? -1 : ((a.order == b.order) ? 0 : 1));
      });
      
      loop2:
      for (i=0; i<list.length-4; i++){
        var orderMove = 1;
        
        for (j=i+1; j<i+5; j++){
          if (list[i].order != list[j].order+orderMove){
            continue loop2;
          }else{
            orderMove = orderMove +1;
          }
        }
        if (orderMove == 5){ //5 Cards found, straight
          var cards = [];
          var suits = [];
          
          for (k=i; k<i+5; k++){
            cards.push(list[k].card);
            suits.push(list[k].suit)
          }
          
          //Checking if highest straight was added. Highest will always be first as list is sorted
          if (highestStraightAdded === false){ 
            var hand = new Hand("Straight", cards, 4);
            possibleHands.push(hand);  
            highestStraightAdded = true;
          }
          
          //Checking if found straight is also flush (straight flush)
          var suitCount = 1;
          var cards2 = [cards[0]];

          for (i=1; i<suits.length; i++){
            if (suits[0] == suits[i]){
              suitCount = suitCount +1;
              cards2.push(cards[i]);
            }
          }
          if (suitCount == 5 && highestStraightFlushAdded === false){
            var name = '';
            var highestCard = getValueFromId(cards2[0]);
            
            if (highestCard == "ace"){
              name = "Royal Flush";
              var order = 9;
            }else{
              name = "Straight Flush";
              var order = 8;
            }
            
            var hand2 = new Hand(name, cards2, order);
            possibleHands.push(hand2);  
            highestStraightFlushAdded = true;
          }
        }
      }

    }
       
    
  }//end of checkForMultiple()
  
  //need to add sorting by value if order is same!
  function sortHandsByOrder(){
		possibleHands.sort(function(a, b) {
			return ((a.order > b.order) ? -1 : ((a.order == b.order) ? 0 : 1));
		});
	}
	return possibleHands[0];
}

function getValueFromId(cardId){ //cardId example: ace_of_spades
  var index = cardId.indexOf("_"); 
  return cardId.slice(0, index);
}
function getSuitFromId(cardId){ //cardId example: ace_of_spades
  var index = cardId.lastIndexOf("_");
  return cardId.slice(index+1, cardId.length);
}