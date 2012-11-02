/* Snakes on a Grid
 *
 * @Author:	Ken Stowell
 * @Date:		
 *
 */


/**********************************************************************************************************************************************************
 *	Snake
 **********************************************************************************************************************************************************
 *
 * @desc: Main scripting resource for the Snake
 *
 *
 *
 *
 */
(function ($) {
	/**
	 * -------------------------------
	 * Snake CONSTRUCTOR
	 * -------------------------------
	 */
	var Snake = function () {
		var self = this;
		
		// Launch object methods on doc ready
		$(window).load(function() {
			self.init();
		});
	};

	/**
	 * --------------------
	 * Snake OBJECT METHODS
	 * --------------------
	 */
	Snake.fn = Snake.prototype = {
		/**
		 * ----
		 * INIT
		 * ----
		 */
		init:function () {
			var self = this;
			

			// DOM Members
			this.site_content = $('#site-content'); // Wrapper element for grid game

			// Bind DOM events
			this.bind_events();

			// Launch the game manager
			this._game.init(this);

			// Build the grid
			this._grid.init(this);

			// Snaaaake
			this._snake.init(this);

			// Events
			this._events.init(this);
		},
		/**
		 * -----
		 * UTILS
		 * -----
		 * @desc: public object to modularize reptitive code/utilities
		 */
		_utils: {
			/**
			 * -------------
			 * GET GRID SIZE
			 * -------------
			 * @desc: generates a random number to build the grid
			 */
			get_grid_size: function() {
				var min = 10, max = 100;

				// Return a whole number between 10 and 100
				return Math.floor(Math.random()*(max)+min);
			}
		},
		/**
		 * ----
		 * GAME
		 * ----
		 *@ desc: Consulting module for game playability
		 */
		_game: {
			/**
			 * ----
			 * INIT
			 * ----
			 * @desc: game manager constructor
			 */
			init: function(root) {

				// Members
				this.snake = Snake.fn; // Root snake object

				// State members
				this.is_launched = false; // Determines what action to do on init
				this.is_paused = true; // Determines what action the spacebar does
				this.ticker; // setInterval value.
				this.fail_count = 0; // Tracks fail conditions
				this.max_fail = 3; // Maximum number of fails allowed before game resets
				this.pause_on_fail = true; // Eventual game setting  - set to true by default for phase one
				this.fail_display = $('#fails'); // jQuery object for DOM display of total fails
				this.fruit_count; // Tracks the number of fruits on the level
				this.maximum_level = 25; // Beat the game top out
				this.current_level = 1; // Current level
			},
			/**
			 * ------------
			 * PROCESS FAIL
			 * ------------
			 * @desc: 
			 */
			process_fail: function() {
				var self = this;

				/*
					increment fail
					check total fails
					clear timer or reset game based on number of fails
					update DOM
				*/
				// First stop the timer to avoid any needless memory usages
				if(this.pause_on_fail) {
					clearInterval(this.ticker);
					// Set the paused flag
					this.is_paused = true;
				}

				// Check new fail count against max fail
				if (this.fail_count+1 == this.max_fail) {
					this.reset_game();
				} else {
					this.fail_count++;
					// Update DOM
					this.fail_display.text('Fails: ' + this.fail_count);
				}
			},
			/**
			 * ------
			 * ON/OFF
			 * ------
			 * @desc: pauses/resues game based on current status,
			 */
			on_off: function() {
				var self = Snake.fn;

				if(this.is_paused) {
					self._snake.move_snake();
					this.is_paused = false;
				} else {
					clearInterval(this.ticker);
					this.is_paused = true;
				}
			},
			/**
			 * ----------
			 * RESET GAME
			 * ----------
			 * @desc: 
			 */
			reset_game: function() {
				/*
					remove snake
					inject at original position
					reset level
					update essential DOM components
				*/
			
				// Remove snake
				var snake = $('.snake');

				for (var i=0; i<snake.length; i++) {
					$(snake[i]).removeClass('snake').removeAttr('data-segment');
				}

				// Reset level
				this.current_level = 1;

				// Reinsert snake at original point
				this.snake._snake.init(this.snake);

				// Reset fail counter
				this.fail_count = 0;

				// Update DOM
				this.fail_display.text('Fails: ' + this.fail_count);
			}
		},
		/**
		 * ----
		 * GRID
		 * ----
		 * @desc: all methods pertaining to grid construction/manipulation
		 */
		_grid: {
			/**
			 * ----
			 * INIT
			 * ----
			 */
			init: function(root) {
				var self = this;

				// Members
				this.snake = root; // Root object
				this.grid_wrapper = $('#grid-wrapper'); // Grid parent element
				this.grid;
				this.max_level = this.snake._game.maximum_level;
				this.level = this.snake._game.current_level; // Current level

				// grid properties
				this.grid_size = this.get_grid_size();

				// Build the grid
				this.build_grid();
			},
			/**
			 * -------------
			 * GET GRID SIZE
			 * -------------
			 * @desc: determine what size the grid needs to be based on level and options
			 */
			get_grid_size: function() {
				var self = this;

				// Size parameters
				var size; // Size of the grid
				var origin_size = 30; // Default size if random disabled
				var minimum_size = 10; // Minimum size
				var maximum_size = 100; // Maximum size, used only for random grid generation
				var reduction = (this.level == 1)? 0 : this.level * .10; // Amount to reduce grid by

				// TODO: check for random controls

				// TODO: make the grid reduction a non-linear regression,
				// 			 for PHASE ONE: just take 10% to a max of 90% of original grid size off
				// 			 the top

				// return a result that linearly shrinks the grid based on the current level
				size = (origin_size - (origin_size*reduction) <= minimum_size)? minimum_size : (origin_size - (origin_size*reduction));
				return size;
			},
			/**
			 * ----------
			 * BUILD GRID
			 * ----------
			 */
			build_grid: function() {
				var self = this;

				var grid_root = '<table id="grid" class="snake-table"></table>';
				var row;

				// This is a singleton operation so i don't think checking for the existence
				// of the wrapper elements is necessary, only check to see if the append worked.
				this.grid_wrapper.append(grid_root);
				// Now that the table has been injected, 
				// assign it to the constructor and start building teh rows and cells
				this.grid = $('#grid');

				// Build the rows and cells
				for (var rows=0; rows<this.grid_size; rows++) {
					// Row template
					var tr = '<tr id="row_'+(rows+1)+'" class="snake-row">';
					// Cells
					for (var cells = 0; cells<this.grid_size; cells++) {
						tr += '<td id="cell_'+(cells+1)+'" class="snake-cell"></td>';
					}
					tr += '</tr>';
					// Append each row to the table
					this.grid.append(tr);
				}
			}
		},
		/**
		 * -----
		 * SNAKE
		 * -----
		 * @desc; main scripting module for snake mechanics
		 */
		_snake: {
			/**
			 * ----
			 * INIT
			 * ----
			 * @desc: _snake constructor.
			 *
			 */
			init: function(root) {

				// Members
				this.snake = root; // Root Snake object

				// State members
				this.level = this.snake._game.current_level; // Current level
				this.$snake; // jquery object for accessing the snake
				this.size; // Size of the snake
				this.head; // current head cell
				this.tail; // current tail cell
				this.tick = 100; // Milisecond value for updating position
				this.grid_size = this.snake._grid.grid_size; // Grid size

				// Coordinate Members
				this.plane = 'x'; // x/y plane
				this.delta = 1; // Default change amount, change this value to increase difficulty
				this.active_delta = this.delta; // Change amount used by movement mechanism, updated by keyboard movement
				this.head_x; // Placeholder for current head cell
				this.head_y; // Placeholder for current head row
				this.tail_x; // Placeholsder for current tail cell
				this.tail_y; // Placeholder for current tail row
				this.next_x; // Placeholder for next x coord
				this.next_y; // Placeholder for next y coord

				// First, inject the snake into the grid - if it's a new game, 
				(this.level == 1)? this.inject_snake() : '';
			},
			/**
			 * ------------
			 * INJECT SNAKE
			 * ------------
			 * @desc: load the snake into the grid
			 */
			inject_snake: function() {
				var self = this;

				// Snake injection points
				var inject_x, inject_y, offset_x, offset_y;

				// Set the snake size to new-game value
				this.size = 5;

				// X offset
				offset_x = this.size*2;

				// determine injection point
				// TODO: 	account for a 'random injection' option in later phases 
				// 			 	also need to account for random grid sizes
				// 				get grid size, inject at a certain point
				for (var i=this.size; i>0; i--){
					
					// what cell gets what class name
					inject_x = '#cell_'+(offset_x);
					inject_y = '#row_'+(this.grid_size-this.size);

					// inject snake head
					$(inject_y).children(inject_x).addClass('snake').attr('data-segment', i);

					// Decrement the offset
					offset_x--;
				}

				// Now that the snake is in the DOM gran the constructor
				// access
				this.$snake = $('.snake');
			},
			/**
			 * -------
			 * SET DIR
			 * -------
			 * @sets direction of the snake from keyboard input
			 */
			set_dir: function(e, dir) {
				var self  = this;

				// Arrow key codes
				var keymap = {
					37: { // Left
						plane: 'x',
						delta: -(this.delta),
						txt: 'left'
					},
					38: { // Top
						plane: 'y',
						delta: -(this.delta),
						txt: 'up'
					},
					39: { // Right
						plane: 'x',
						delta: (this.delta),
						txt: 'right'
					},
					40: { // Bottom
						plane: 'y',
						delta: (this.delta),
						txt: 'down'
					}
 				};

 				// change constructor values based on input
 				if (keymap.hasOwnProperty(dir)) {
 					// Prevent it from scrolling the page
 					e.preventDefault();
 					// x or y
 					this.plane = keymap[dir].plane;
 					// incrementor
 					this.active_delta = keymap[dir].delta;
 					// Update DOM
 					$('#dir').text('Direction: '+keymap[dir].txt);
 				} else {
 					// Do seomthing.
 				}
			},
			/**
			 * ----------
			 * MOVE SNAKE
			 * ----------
			 * @desc: primary motility processor
			 */
			move_snake: function() {
				var self = this;

				// Wrap the processor in a ticker
				this.snake._game.ticker = setInterval(function() {

					var segments = [], head, tail;

					$('.snake[data-segment]').each(function() {
						segments.push(parseInt($(this).attr('data-segment')));
					}); // TODO: find a way to not use 'each' here

					head = $('.snake[data-segment='+Math.max.apply(Math, segments)+']');
					tail = $('.snake[data-segment='+Math.min.apply(Math, segments)+']');

					// First, we need to get the x,y position of the snake head and tail
					self.head_x = parseInt(head.attr('id').split('_')[1]);
					self.head_y = parseInt(head.parent('tr').attr('id').split('_')[1]);

					// Next head values
					var head_next_x = (self.plane == 'x')? '#cell_'+(self.head_x + self.active_delta) : '#cell_'+self.head_x;
					var head_next_y = (self.plane == 'y')? '#row_'+(self.head_y + self.active_delta) : '#row_'+self.head_y;

					// Fail/Fruit checker
					if (self.check_square(head_next_x, head_next_y)) {
						// Next head processing
						$(head_next_y).find(head_next_x).addClass('snake').attr('data-segment', (Math.max.apply(Math, segments))+1);

						// Remove tail
						tail.removeClass('snake').removeAttr('data-segment');
					} else {
						self.snake._game.process_fail();
					}
				}, self.tick);
			},
			stop_snake: function() {
				var self = this;

				// Simple pausing method
				clearInterval(this.snake._game.ticker);
			},
			/**
			 * ------------
			 * CHECK SQUARE
			 * ------------
			 * @desc: 
			 */
			check_square: function(x, y) {
				var self = this;

				var cell = $(y).find('td[id='+$(x).attr('id')+']');
				var row = $('tr[id='+$(y).attr('id')+']');

				if (cell.length != 0 && row.length != 0) {
					if (cell.is('.snake')) {
						return false;
					} else {
						return true;
					}
				} else {
					return false;
				}
			}
		},
		/**
		 * ------
		 * EVENTS
		 * ------
		 * @desc: 
		 */
		_events: {
			/**
			 * ----
			 * INIT
			 * ----
			 * @desc: 
			 */
			init: function() {
				var self = this;

				this.root = Snake.fn;
		
				// Game events
				this._game();

				// Grid events
				this._grid();

				// Snake events
				this._snake();
			},
			_game: function() {
				var self = this;
				
				// Game launcher
				$(document).on('click', "#launch", function(e) {
					self.root._snake.move_snake();
				});

				// Game Stopper
				$(document).on('click', "#stop", function(e) {
					self.root._snake.stop_snake();
				});
			},
			_grid: function() {
				var self = this;
				console.log(this);
			},
			_snake: function() {
				var self = this;
				console.log(this);
			}
		},
		/**
		 * -----------
		 * BIND EVENTS
		 * -----------
		 * @desc: Object to house event bindings.
		 */
		bind_events: function() {
			var self = Snake.fn;

			// Directional binding
			$(document).on('keydown', function(e){
				self._snake.set_dir(e, e.keyCode);
			});

			$(document).on('keyup', function(e) {
				if(e.keyCode === 32) {
					self._game.on_off();
				}
			});
		}
	};
	// Instantiate the local object and push it to the window object
	window.Snake = new Snake();
})(jQuery);


/************************************************************* END ***************************************************************************************/ 

