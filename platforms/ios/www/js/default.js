Date.prototype.apidate = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

angular.module('ngView', ['ngRoute','ngResource','LocalStorageModule'], function($routeProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {
	
	// mark content from bibles.org as safe
	$sceDelegateProvider.resourceUrlWhitelist([
	    // Allow same origin resource loads.
	    'self',
	    // Allow loading from our assets domain.
	    'https://bibles.org/v2/**'
	]);
	
	document.addEventListener('deviceready', function() {
		console.log('device ready');
		
	}, false);
	
  // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
   
   var encoded = window.btoa('zJLXRg3SXOgE8QIG1wXXv3Tau809mljWy1vmOtpo:X');
   $httpProvider.defaults.headers.common['Authorization'] = 'Basic ' + encoded
   
    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data)
    {
      return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
    
  $routeProvider
	.when('/', {
		templateUrl: 'verses.html',
		controller: VersesCntl
	})
	.when('/Verses/:passageId', {
		templateUrl: 'verse_learn.html',
		controller: VerseLearnCntl
	})
	.when('/Add', {
		templateUrl: 'add_books.html',
		controller: AddBooksCntl
	})
	.when('/Add/:bookName', {
		templateUrl: 'add_chapters.html',
		controller: AddChaptersCntl
	})
	.when('/Add/:bookName/:chapNum', {
		templateUrl: 'add_verses.html',
		controller: AddVersesCntl
	})
	.when('/Review', {
		templateUrl: 'review.html',
		controller: ReviewCntl
	})
	.when('/Profile', {
		templateUrl: 'profile.html',
		controller: ProfileCntl
	})
	.otherwise({
	  redirectTo:'/'
	});

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
  //$locationProvider.hashPrefix('!');

})
.factory('Versions',function($resource){
    var resource = $resource('https://bibles.org/v2/versions.js', {
		get: {
			method: "GET",
			/*headers: {
			    "Authorization": 'Basic ' + encoded
			}*/
		}
    });

    return resource;
})
.factory('Verses',function($resource){
    var resource = $resource('https://bibles.org/v2/passages.js?version=eng-ESV&q[]=:search', {
		get: {
			method: "GET",
			/*headers: {
			    "Authorization": 'Basic ' + encoded
			}*/
		}
    });

    return resource;
})
.factory('Books', function($resource){
  //return $resource('../data/ages.json', {}, {});
  return {
  	query: function() {
  		return BOOKS;
  	},
  	get: function(name) {
  		var selectedBook;
  		angular.forEach(BOOKS, function(group) {
  			angular.forEach(group.books, function(book) {
  				if (name == book.name) {
  					selectedBook = book;
  				}
  			});
  		});
  		return selectedBook;
  	}
  }
})
/*.factory('cordovaReady', function() {
  return function(fn) {
  
    var queue = [];

    var impl = function () {
      queue.push(Array.prototype.slice.call(arguments));
    };

    document.addEventListener('deviceready', function () {
      //console.log('device ready');
      queue.forEach(function (args) {
        fn.apply(this, args);
      });
      impl = fn;
    }, false);

    return function () {
      return impl.apply(this, arguments);
    };
  };
})*/
.directive('lvTap', function() {
  return function(scope, element, attrs) {
  	if ('ontouchstart' in document.documentElement) {
  		var tapping = false;
  		element.bind('touchstart', function() {
  			tapping = true;
  		})
  		.bind('touchmove', function() {
  			tapping = false;
  		})
  		.bind('touchend', function() {
  			if (tapping) {
  				scope.$apply(attrs['lvTap']);
  			}
  		});
  	} else {
  		element.bind('click', function() {
  		  scope.$apply(attrs['lvTap']);
  		});
  	}
    
  };
});

MONTHS = [
	'Jan.',
	'Feb.',
	'Mar.',
	'April',
	'May',
	'June',
	'July',
	'Aug.',
	'Sept.',
	'Oct.',
	'Nov.',
	'Dec.',
];

var PHRASE_LENGTH = 7,	// ideal phrase length
	RANK_FALLOFF = 4,	// how many characters it takes for the rank boost to falloff
	MIN_LENGTH = 3,		// minimum phrase length
	MAX_LENGTH = 11,	// maximum phrase length
	POSITION_WEIGHT = 0.3;	// max amount position can boost rank
	
var CONJ_BOOST = 0.4,	// uses word list from CONJ1
	CONJ2_BOOST = 0.2,	// uses word list from CONJ2
	PUNC_BOOST = 0.5,	// uses punctuation from PUNC_REGEX
	PUNC2_BOOST = 1.0;	// uses punctuation from PUNC2_REGEX
	
var PUNC_REGEX = /[,:“”‘’()]/;
var PUNC2_REGEX = /[\.?!;]/;

var CONJ1 = [
	// coordinating conjunctions
	'and',
	'but',
	'or',
	'yet',
	'nor',
	'so',
	'that',
];

var CONJ2 = [
	// subordinating conjunctions
	'after',
	'although',
	'as',
	'for',
	'because',
	'before',
	'even',
	'if',
	'in',
	'once',
	'rather',
	'since',
	'so',
	'than',
	'though',
	'till',
	'unless',
	'until',
	'when',
	'whenever',
	'where',
	'whereas',
	'wherever',
	'while',
	
	// prepositions
	'with',
	/*'aboard',
	'about',
	'above',
	'across',
	'after',
	'against',
	'along',
	'amid',
	'among',
	'anti',
	'around',
	'as',
	'at',
	'before',
	'behind',
	'below',
	'beneath',
	'beside',
	'besides',
	'between',
	'beyond',
	'by',
	'concerning',
	'considering',
	'despite',
	'down',
	'during',
	'except',
	'excepting',
	'excluding',
	'following',
	'for',
	'from',
	'inside',
	'into',
	'like',
	'minus',
	'near',
	'of',
	'off',
	'on',
	'onto',
	'opposite',
	'outside',
	'over',
	'past',
	'per',
	'plus',
	'regarding',
	'round',
	'since',
	'than',
	'through',
	'to',
	'toward',
	'towards',
	'under',
	'underneath',
	'unlike',
	'until',
	'up',
	'upon',
	'versus',
	'via',
	'with',
	'within',
	'without'*/
];

function cleanArray(actual){
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
    var txt = $.trim(actual[i])
    if (txt){
        newArray.push(txt);
    }
  }
  return newArray;
}

// attach the .equals method to Array's prototype to call it on any array
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
        else if (this[i].toLowerCase() != array[i].toLowerCase()) { 	// modified to be string specific
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}   


Category = function(name) {
	this.name = name,
	this.verses = [];
};
Category.prototype = {
	addVerse: function(verse) {
		// check for dups
		// sort by biblical order
		this.verses.push(verse);
	},
};

Passage = function(obj, id) {	// assumes json passage object from bibles.org api
	this.copyright = obj.copyright,
    //this.text = obj.text,
    this.end_verse_id = obj.end_verse_id,
    this.version = obj.version,
    this.path = obj.path,
    this.version_abbreviation = obj.version_abbreviation,
    this.start_verse_id = obj.start_verse_id,
    this.display = obj.display;
    this.id = id;
    this.strength = 0;
    this.lastStrength = 0;
    this.lastReviewed;
    
    this.verses = [];
    if (obj.verses != undefined) {
    	this.verses = obj.verses;
    }
    if (obj.text != undefined) {
    	this.parseText(obj.text);
    }
};
Passage.prototype = {
	name: function() {
		// ref for first verse
		// plus ref for last verse
		console.log('called name method');
	},
	addVerse: function(verse) {
		// check if sequential
		// add verses in between?
		this.verses.push(verse);
	},
	parseText: function(text) {
		text = text.replace(/\n/, '');
		text = text.replace(/\r/, '');
		var $text = $('<div>'+text+'</div>');
		$text.find('h1,h2,h3,h4,h5').remove();
		var verseMarkerText = '####';
		var $verseMarkers = $text.find('sup').replaceWith(verseMarkerText);
		var verses = $text.text().split(verseMarkerText);
		verses.shift();	// first item is empty
		for (var i=0, len=verses.length; i<len; i++) {
			var verse = new Verse(verses[i], $($verseMarkers[i]).text(), this.display);
			this.verses.push(verse);
		}
	},
};

Verse = function(text, number, passageDisplay) {
	this.display = passageDisplay.split(':')[0] + ':' + number;
	this.number = number;
	this.text = text;
	this.strength = 0;
	this.lastStrength = 0;
	this.lastReviewed;
	this.phrases = this.parsePhrases(this.text);
	this.parts = this.parseWords(this.text);
};
Verse.prototype = {
	getLevel: function() {
		if (this.reviewDate == undefined) {
			return 0;
		} else {
			var today = new Date();
			var daysSince = Math.abs(this.reviewDate - today) / (24 * 60 * 60 * 1000);
			return 1 / daysSince;
		}
	},
	
	parseWords: function(text) {
		var SPACE = 0,
			WORD = 1,
			PUNCTUATION = 2;
		var parts = [];
		var curPart = {
			text: ''
		};
		
		for (var i=0, len=text.length; i<len; i++) {
			var char = text[i];
			
			if (char.match(/[-'’a-zA-Z]/)) {
				if (curPart.type != undefined && curPart.type != WORD) {
					parts.push(curPart);
					curPart = {
						text: ''
					};
				}
				curPart.text += char;
				curPart.type = WORD;
				
			} else if (char.match(/[\s]/)) {
				if (curPart.type != undefined && curPart.type != SPACE) {
					parts.push(curPart);
					curPart = {
						text: ''
					};
				}
				curPart.text += char;
				curPart.type = SPACE;
				
			} else {
				if (curPart.type != undefined && curPart.type != PUNCTUATION) {
					parts.push(curPart);
					curPart = {
						text: ''
					};
				}
				curPart.text += char;
				curPart.type = PUNCTUATION;
				
			}
		}
		
		return parts;
	},
	
	parsePhrases: function(text) {
		text = text.trim();
		var bestSplitPos = 0,
			bestSplitRank = 0,
			bestSplitWord = '',
			splits = [],
			phrases = [],
			curWord = '',
			curWordStartPos = 0,
			curWordCount = 0,
			prevWord = '',
			prevWordStartPos = 0,
			prevWordRank = 0,
			rank = 0;
		
		for (var i=0, len=text.length; i<len; i++) {
			// current character
			var char = text[i];
			var isEndOfVerse = i==text.length-1;
			//console.log('i: '+i+' out of '+(text.length-1)+':'+text[i]);
			
			// is part of a word
			if (char.match(/[-'’a-zA-Z]/)) {
				// beginning of a word
				if (curWord == '') {
					curWordStartPos = i;
				}
				
				// building current word
				curWord += char;
				
			// is a space or punctuation
			} else {
				if (curWord) {
					curWordCount++;
					
					// rank current word based on position
					rank = 1.0 - Math.abs(curWordCount - PHRASE_LENGTH) / RANK_FALLOFF;
					rank *= POSITION_WEIGHT;
					
					// rank boost for previous word if coordinating conjunction
					if (CONJ1.indexOf(curWord) > -1) {
						prevWordRank += CONJ_BOOST;
						
					// rank boost for previous word if subordinating conjunction
					} else if (CONJ2.indexOf(curWord) > -1) {
						prevWordRank += CONJ2_BOOST;
					}
					
					// try to end phrase at the end of the verse
					if (isEndOfVerse) {
						rank += 1.0;
					}
					
					// smaller rank boost for weak punctuation
					if (char.match(PUNC_REGEX)) {
						rank += PUNC_BOOST;
						
					// rank boost for strong punctuation
					} else if (char.match(PUNC2_REGEX)) {
						rank += PUNC2_BOOST;
					}
					
					// kill rank if less than minimum phrase length
					if (curWordCount < MIN_LENGTH) {
						rank = 0.0;
					}
					
					//console.log(rank + '=' + curWord + '('+curWordCount+')');
					
					// save rank for current and previous word
					if (rank > bestSplitRank || prevWordRank > bestSplitRank) {
						if (rank > prevWordRank) {
							bestSplitRank = rank;
							bestSplitPos = i;
							bestSplitWord = curWord;
						} else {
							bestSplitRank = prevWordRank;
							bestSplitPos = prevWordPos;
							bestSplitWord = prevWord;
						}
						//console.log('save rank: '+bestSplitRank+'='+bestSplitWord+'('+bestSplitPos+')');
						//console.log('bestSpitPos: '+bestSplitPos);
					}
					
					// if at word limit, choose split point
					if (curWordCount == MAX_LENGTH || isEndOfVerse) {
						//console.log('-----MAX WORD LENGTH-----');
						if (bestSplitPos > 0) {
							// use highest split point
							splits.push(bestSplitPos);
							//console.log('------SPLIT: '+bestSplitPos+' - '+bestSplitWord);
							
							// jump back to end of last phrase
							if (!isEndOfVerse) {
								i = bestSplitPos-1;
							}
							curWordCount = 0;
							bestSplitPos = 0;
							bestSplitRank = 0;
							bestSplitWord = '';
							prevWordRank = 0;
							prevWordStartPos = 0;
							prevWord = '';
						}
						
					// assign previous word info
					} else {
						prevWord = curWord;
						prevWordRank = rank;
						prevWordPos = i;
					}
				}
				
				// allow for quotes, parentheticals at the end of a verse
				if (text.length-i > 3) {
					curWord = '';
				}
			}
		}
		//console.log(text);
		for (var i=0, len=splits.length; i<len; i++) {
			var endPos = splits[i]+1;
			var startPos = 0;
			if (i > 0) {
				startPos = splits[i-1]+1;
			}
			var phrase = text.slice(startPos, endPos);
			phrases.push(new Phrase(phrase));
			//console.log('--- ' + phrase.trim());
		}
		return phrases;
	},
};

Phrase = function(text) {
	this.text = text;
	this.strength = 0;
	this.words = this.parseWords(text);
};

Phrase.prototype = {
	parseWords: function(text) {
		var that = this;
		var words = text.trim()
					.replace(/[\.,-\/"“#!$%\^&\*;:{}=\-_`~()]/g,"")
					.split(' ');
					
		this.words = [];
		angular.forEach(words, function(wordText) {
			that.words.push(new Word(wordText));
		});
		return this.words;
	}
};

Word = function(text) {
	this.text = text;
	this.strength = 0;
	this.hidden = false;
};

function VersesCntl($scope, $rootScope, localStorageService) {
	console.log('VersesCntl');
	
	var that = this;
	$scope.displayPassage = function(passage) {
		$scope.curPassage = passage;
	};
}

function AddBooksCntl($scope, Books) {
	$scope.groups = Books.query();
}

function AddChaptersCntl($scope, Books, $routeParams) {
	var book = Books.get($routeParams.bookName);
	$scope.book = book;
	var chapters = [];
	for (var i=0, len=book.count; i<len; i++) {
		var num = i+1;
		chapters.push({
			name: book.name + ' ' + num,
			link: "#Add/"+book.name+'/'+num,
			number: num
		});
	}
	$scope.chapters = chapters;
}

function AddVersesCntl($scope, $rootScope, $routeParams, localStorageService, Verses, Books, $location, Versions) {
	$scope.activeVerses = [];
	$scope.loading = true;
	$scope.displayName = '';
	$scope.chapterName = $routeParams.bookName + ' ' + $routeParams.chapNum;
	
	/* this is quite ridiculous. If this ajax call is included the following
	ajax call works. Otherwise it hangs in phonegap.
	*/
	$.ajax({
		url: 'https://bibles.org/v2/versions.js',
		method: 'OPTIONS',
		dataType: 'json',
		complete: function(xhr, status) {
			console.log(status);
		},
		username: 'zJLXRg3SXOgE8QIG1wXXv3Tau809mljWy1vmOtpo',
		password: 'x'
	});
	var data = Verses.get({
		search: $scope.chapterName,
		
	}, function() {
		console.log('AJAX verses loaded');
		var passageData = data.response.search.result.passages[0];
		$scope.passage = new Passage(passageData);
		$scope.loading = false;
	});
	
	$scope.selectVerse = function(verse) {
		verse.active = !verse.active;
		
		var verseNum,
			lastTextNum,
			nextPart = '',
			displayName = $routeParams.bookName + ' ' + $routeParams.chapNum;
			
		$scope.activeVerses = [];
		angular.forEach($scope.passage.verses, function(verse, i) {
			if (verse.active) {
				if (verseNum == undefined) {
					displayName += ':';
					displayName += verse.number;
					lastTextNum = verse.number;
				} else {
					if (verseNum != verse.number-1) {
						if (verseNum != lastTextNum) {
							displayName += '-' + verseNum;
						}
						displayName += ', ' + verse.number;
						lastTextNum = verse.number;
					}
				}
				verseNum = verse.number;
				$scope.activeVerses.push(verse);
			}
			if (verseNum != lastTextNum && i == $scope.passage.verses.length-1 && $scope.activeVerses.length > 1) {
				displayName += '-' + verseNum;
			}
		});
		if ($scope.activeVerses.length > 0) {
			$scope.displayName = displayName;
		} else {
			$scope.displayName = '';
		}
		
	};
	
	var that = this;
	$scope.addPassage = function() {
		$scope.passage.text = undefined;	// don't need to store the whole chapter
		var passage = $scope.passage;
		passage.verses = $scope.activeVerses;
		passage.display = $scope.displayName;
		passage.id = $rootScope.passages.length;
		$rootScope.passages.push(passage);
		savePassages();
		
		$location.path('Verses/'+passage.id);
	};
	
	function savePassages() {
		var flat_passages = JSON.stringify($rootScope.passages);
		localStorageService.add('passages', flat_passages);
	}
	
}

function ReviewCntl($scope) {
	console.log('ReviewCntl');
}

function VerseLearnCntl($scope, $rootScope, $routeParams, localStorageService) {
	console.log('VerseLearnCntl');
	var that = this;
	
	$scope.wordIndices = [0,1,2,3,4,5];
	
	$scope.strengthMax = 3;
	$scope.heartsMax = 3;
	$scope.hearts = 3;
	$scope.canContinue = false;
	$scope.lessonType = 3;
	
	var lessonTypes = [
		
		// type first letter of each word in the phrase
		{
			number: 1,
			init: function() {
				console.log('init');
				$scope.canContinue = false;
			},
			checkable: true,
			check: function() {
				console.log('check');
				var parts = $scope.typedPhrase.trim()
								.replace(/[\.,-\/"“#!$%\^&\*;:{}=\-_`~()]/g,"")
								.split(' ');
				console.log(parts);
				console.log($scope.curStep.phraseParts);
				if (parts.equals($scope.curStep.phraseParts)) {
					$scope.correct = true;
				} else {
					$scope.correct = false;
					$scope.hearts--;
				}
				$scope.canContinue = true;
			},
		},
		
		// recite the phrase aloud
		{
			number: 2,
			init: function() {
				console.log('init');
				$scope.canContinue = false;
			},
			listen: function() {
				$scope.canContinue = true;
			},
			checkable: false
		},
		
		// choose all words from list of words
		{
			number: 3,
			init: function() {
				console.log('init');
				$scope.canContinue = false;
			},
			checkable: true,
			check: function() {
				console.log('check');
				if ($scope.curStep.phrase.equals($scope.curStep.phraseParts)) {
					$scope.correct = true;
				} else {
					$scope.correct = false;
					$scope.hearts--;
				}
				$scope.canContinue = true;
			},
		}
	];
	
	function savePassages() {
		var flat_passages = JSON.stringify($rootScope.passages)
		localStorageService.add('passages', flat_passages);
	}
	
	$scope.selectVerse = function(verse) {
		if (verse != $scope.activeVerse) {
			$scope.reviewVerse(verse);
		}
	};
	
	this.hideRandomWords = function() {
		angular.forEach($scope.activeVerse.parts, function(word) {
			word.used = false;
		});
		$scope.hiddenWords = [];
		var verse = $scope.activeVerse;
		
		var words = [];
		angular.forEach(verse.parts, function(word, index) {
			if (word.type == 1) {	// word type
				words.push(word);
			}
		});
		
		var count = words.length;
		var needed = count;	// hide all words
		if (verse.strength == 0) {
			needed = Math.round(count * 0.33);	//hide 1/3 of the words
		} else if (verse.strength == 1) {
			needed = Math.round(count * 0.66);	//hide 2/3 of the words
		}
		var wordsUsed = [];
		
		angular.forEach(words, function(word, index) {
			var probability = needed / (count-index);
			if (Math.random() <= probability && wordsUsed.indexOf(word.text) == -1) {
				$scope.hiddenWords.push(word);
				wordsUsed.push(word.text);
				word.hidden = true;
				needed--;
			} else {
				word.hidden = false;
			}
		});
		
		$scope.hiddenWords[0].active = true;
		var end = $scope.hiddenWords.length;
		if (end > 6) end = 6;
		$scope.hiddenWordsShuffled = $scope.hiddenWords.slice(0, end);
		$scope.hiddenWordsLeft = [];
		if ($scope.hiddenWords.length > 6) {
			$scope.hiddenWordsLeft = $scope.hiddenWords.slice(end);
		}
		shuffleArray($scope.hiddenWordsShuffled);
		//shuffleArray($scope.hiddenWordsLeft);	// not sure if this is needed yet, could cause problems with long verses
	};
	
	$scope.reviewVerse = function(verse) {
		// hide dialog
		$scope.canContinue = false;
		$scope.activeVerse = verse;
		$scope.hearts = 3;
		that.hideRandomWords();
		var verseIndex = $scope.passage.verses.indexOf(verse);
		if ($scope.passage.verses[verseIndex+1] != undefined) {
			$scope.nextVerse = $scope.passage.verses[verseIndex+1];
		}
		var $activeVerse = $('.verseRef:eq('+verseIndex+')');
		if ($activeVerse.length != 0) {
			$('body').animate({
				scrollTop: $activeVerse.offset().top - 40
			}, 1500);
		}
	};
	
	// get selected passage
	angular.forEach($rootScope.passages, function(passage) {
		if (passage.id == $routeParams.passageId) {
			$scope.passage = passage;
			$scope.reviewVerse(passage.verses[0]);
		}
	});
	
	this.verseComplete = function() {
		var complete = true;
		angular.forEach($scope.activeVerse.parts, function(word) {
			if (word.hidden && !word.used) {
				complete = false;
			}
		});
		
		return complete;
	};
	
	function updatePassageStrength() {
		var verses = $scope.passage.verses;
		var verseCount = verses.length;
		var total = 0;
		angular.forEach($scope.passage.verses, function(verse) {
			total += verse.strength;
			console.log(verse.strength);
		});
		$scope.passage.strength = Math.round(total / verseCount);
		console.log($scope.passage.strength);
	}
	
	$scope.chooseWord = function(index) {
		var word = $scope.hiddenWordsShuffled[index];
		if (word != undefined) {
			var nextWord = $scope.hiddenWords[0];
			if (word.text == nextWord.text) {
				nextWord.used = true;
				
				if (word != nextWord) { // handle same-word lookups by swapping words
					var nextWordIndex = $scope.hiddenWordsShuffled.indexOf(nextWord);
					$scope.hiddenWordsShuffled[index] = $scope.hiddenWordsShuffled[nextWordIndex];
					$scope.hiddenWordsShuffled[nextWordIndex] = word;
				}
				
				$scope.hiddenWords[0].active = false;
				$scope.hiddenWords.shift();
				if (that.verseComplete()) {
					// delay to make time for animation
					setTimeout(function() {
						// check if done with this verse
						if ($scope.activeVerse.strength < $scope.strengthMax) {
							$scope.activeVerse.strength++;
							updatePassageStrength();
							savePassages();
						}
						// reset starting values
						if ($scope.activeVerse.strength < $scope.strengthMax) {
							$scope.reviewVerse($scope.activeVerse);
						} else {
							$scope.reviewVerse($scope.nextVerse);
						}
						$scope.$apply();
					}, 500);
					
					return;
					
				} else {
					$scope.hiddenWords[0].active = true;
				}
				var replaceWord = {};
				if ($scope.hiddenWordsLeft.length > 0) {
					replaceWord = $scope.hiddenWordsLeft[0];
					$scope.hiddenWordsLeft.shift();
				}
				$scope.hiddenWordsShuffled.splice(index, 1, replaceWord);
				
			} else {
				$scope.hearts--;
				alert('Sorry, try again');
			}
		}
	};
	
	// check lesson to see if answers are correct
	$scope.check = function() {
		if ($scope.curStep.type.checkable) {
			$scope.curStep.type.check.call($scope.curStep);
		}
	};
	
	// progress to next step in lesson
	$scope.continue = function() {
		curStepNum++;
		$scope.curStep = $scope.steps[curStepNum];
		$scope.lessonType = $scope.curStep.type.number;
		$scope.curStep.type.init.call($scope.curStep);
		console.log('continue');
		//$scope.continue = false;
	};
	
}

function ProfileCntl($scope) {
	console.log('ProfileCntl');
}

function MainCntl($scope, $rootScope, $route, $routeParams, $location, $http, Verses, Versions, localStorageService) {
	// function init
	$scope.hasPrefs = false;
	$scope.selectedLanguage = localStorageService.get('language');
	$scope.selectedVersion = localStorageService.get('version');
	if ($scope.selectedLanguage != null && $scope.selectedVersion != null) {
		$scope.hasPrefs = true;
	}
	
	$scope.savePrefs = function() {
		localStorageService.add('language', $scope.selectedLanguage);
		localStorageService.add('version', $scope.selectedVersion);
		$scope.hasPrefs = true;
	};
	
	this.parseObjects = function(jsonstr, Passage) {
		var newObjs = [];
		var objs = JSON.parse(jsonstr);
		angular.forEach(objs, function(obj, i) {
			var passage = new Passage(obj);
			passage.id = i;
			newObjs.push(passage);
		});
		return newObjs;
	};
	
	var passagestr = localStorageService.get('passages');
	if (passagestr == null) {
		$rootScope.passages = [];
	} else {
		$rootScope.passages = this.parseObjects(passagestr, Passage);
	}
	
	this.xp = 0,
	this.verseCount = 0,
	this.streak = 0;
	$scope.strengthMax = 3;
	
	this.level = function() {
		return Math.floor(xp / 100)+1;
	};
	
	$scope.loadingVersions = true;
	var that = this;
	this.versionsResponse = Versions.get(function() {
		//$scope.selectedLanguage = 90;
		var languages = [];
		var languageDict = {};
		var versions = that.versionsResponse.response.versions;
		angular.forEach(versions, function(version) {
			var lang = languageDict[version.lang];
			if (lang == undefined) {
				lang = {
					id: version.lang,
					name: version.lang_name,
					versions: [version]
				};
				languageDict[version.lang] = lang;
				languages.push(lang);
				
			} else {
				lang.versions.push(version);
			}
		});
		$scope.languages = languages;
		$scope.loadingVersions = false;
	});
	
	console.log('MainCntl');
}

// listen to verse
// read entire verse aloud
// ----- randomly choose from the following for each phrase
// read first phrase aloud (always done before lesson when learning verse)
// reorder words
// choose all words
// choose word for the blank
// word typing (first letter of each word visible with spaces for words)
// phrase typing (type entire phrase in empty text box w/ "I need a hint" feature that displays first word and spaces for other words)
// ------ review whole verse aloud
// read entire verse aloud
// display experience gained & level up
// display progress compared to friends for current week


/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function param(obj) {
  var query = '';
  var name, value, fullSubName, subName, subValue, innerObj, i;
  
  for(name in obj)
  {
    value = obj[name];
    
    if(value instanceof Array)
    {
      for(i=0; i<value.length; ++i)
      {
        subValue = value[i];
        fullSubName = name + '[' + i + ']';
        innerObj = {};
        innerObj[fullSubName] = subValue;
        query += param(innerObj) + '&';
      }
    }
    else if(value instanceof Object)
    {
      for(subName in value)
      {
        subValue = value[subName];
        fullSubName = name + '[' + subName + ']';
        innerObj = {};
        innerObj[fullSubName] = subValue;
        query += param(innerObj) + '&';
      }
    }
    else if(value !== undefined && value !== null)
    {
      query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
  }
  
  return query.length ? query.substr(0, query.length - 1) : query;
}
