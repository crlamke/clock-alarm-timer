$(function(){

	// Cache some selectors

	var clock = $('#clock'),
		alarm = clock.find('.alarm'),
		ampm = clock.find('.ampm'),
		alarmDialog = $('#alarm-dialog').parent(),
		aboutDialog = $('#about-dialog').parent(),
		alarmSet = $('#alarm-set'),
		alarmClear = $('#alarm-clear'),
		alarmTime = $('#time-is-up').parent();

	// This will hold the number of seconds left
	// until the alarm should go off
	var alarmCounter = -1;

	// Map digits to their names (this will be an array)
	var digitToName = 'zero one two three four five six seven eight nine'.split(' ');

	// This object will hold the digit elements
	var digits = {};

	// Positions for the hours, minutes, and seconds
	var positions = [
		'h1', 'h2', ':', 'm1', 'm2', ':', 's1', 's2'
	];

	// Generate the digits with the needed markup,
	// and add them to the clock

	var digitHolder = clock.find('.digits');
	
	// Start with the dark theme. Keep track of current theme.
	var currentTheme = 'light';
	
	$.each(positions, function(){

		if(this == ':'){
			digitHolder.append('<div class="dots">');
		}
		else{

			var pos = $('<div>');

			for(var i=1; i<8; i++){
				pos.append('<span class="d' + i + '">');
			}

			// Set the digits as key:value pairs in the digits object
			digits[this] = pos;

			// Add the digit elements to the page
			digitHolder.append(pos);
		}

	});

	// Add the weekday names

	var weekdayNames = 'MON TUE WED THU FRI SAT SUN'.split(' '),
		weekdayHolder = clock.find('.weekdays');

	$.each(weekdayNames, function(){
		weekdayHolder.append('<span>' + this + '</span>');
	});

	var weekdays = clock.find('.weekdays span');


	// Run a timer every second and update the clock

	(function update_time(){

		// Use moment.js to output the current time as a string
		// hh is for the hours in 12-hour format,
		// mm - minutes, ss-seconds (all with leading zeroes),
		// d is for day of week and A is for AM/PM

		var now = moment().format("hhmmssdA");

		digits.h1.attr('class', digitToName[now[0]]);
		digits.h2.attr('class', digitToName[now[1]]);
		digits.m1.attr('class', digitToName[now[2]]);
		digits.m2.attr('class', digitToName[now[3]]);
		digits.s1.attr('class', digitToName[now[4]]);
		digits.s2.attr('class', digitToName[now[5]]);

		// The library returns Sunday as the first day of the week.
		// Stupid, I know. Lets shift all the days one position down, 
		// and make Sunday last

		var dow = now[6];
		dow--;
		
		// Sunday!
		if(dow < 0){
			// Make it last
			dow = 6;
		}

		// Mark the active day of the week
		weekdays.removeClass('active').eq(dow).addClass('active');

		// Set the am/pm text:
		ampm.text(now[7]+now[8]);


		// Is there an alarm set?

		if(alarmCounter > 0){
			
			// Decrement the counter with one second
			alarmCounter--;

			// Activate the alarm icon
			alarm.addClass('active');
		}
		else if(alarmCounter == 0){

			alarmTime.fadeIn();

			// Play the alarm sound. This will fail
			// in browsers which don't support HTML5 audio

			try{
				$('#alarm-ring')[0].play();
			}
			catch(e){}
			
			alarmCounter--;
			alarm.removeClass('active');
		}
		else{
			// The alarm has been cleared
			alarm.removeClass('active');
		}

		// Schedule this function to be run again in 1 sec
		setTimeout(update_time, 1000);

	})();

		// Switch the theme

	$('#switch-theme').click(function(){
		clock.toggleClass('light dark');
	});
	
	// Change the theme
	$('.theme-button').click(function(){
		clock.toggleClass('light dark green red', false);
		switch(currentTheme) {
			case 'light':
				currentTheme = 'dark';
				break;
			case 'dark':
				currentTheme = 'green';
				break;
			case 'green':
				currentTheme = 'red';
				break;
			case 'red':
				currentTheme = 'light';
				break;
			default:
				currentTheme = 'dark';
		}
		
		clock.addClass(currentTheme);
	});

	// Handle setting and clearing alarms
	$('.alarm-button').click(function(){
		// Show the alarm dialog
		alarmDialog.trigger('show');
	});

	// Handle About Display
	$('.about-button').click(function(){
		// Show the about dialog
		aboutDialog.trigger('show');
	});
	
	alarmDialog.find('.close').click(function(){
		alarmDialog.trigger('hide')
	});

	alarmDialog.click(function(e){

		// When the overlay is clicked, 
		// hide the dialog.

		if($(e.target).is('.overlay')){
			alarmDialog.trigger('hide');
		}
	});


	alarmSet.click(function(){

		var valid = true, after = 0,
			to_seconds = [3600, 60, 1];

		alarmDialog.find('input').each(function(i){

			// Using the validity property in HTML5-enabled browsers:

			if(this.validity && !this.validity.valid){

				// The input field contains something other than a digit,
				// or a number less than the min value

				valid = false;
				this.focus();

				return false;
			}

			after += to_seconds[i] * parseInt(parseInt(this.value));
		});

		if(!valid){
			alert('Please enter a valid number!');
			return;
		}

		if(after < 1){
			alert('Please choose a time in the future!');
			return;	
		}

		alarmCounter = after;
		alarmDialog.trigger('hide');
	});

	alarmClear.click(function(){
		alarmCounter = -1;

		alarmDialog.trigger('hide');
	});

	// Custom events to keep the code clean
	alarmDialog.on('hide',function(){

		alarmDialog.fadeOut();

	}).on('show',function(){

		// Calculate how much time is left for the alarm to go off.

		var hours = 0, minutes = 0, seconds = 0, tmp = 0;

		if(alarmCounter > 0){
			
			// There is an alarm set, calculate the remaining time

			tmp = alarmCounter;

			hours = Math.floor(tmp/3600);
			tmp = tmp%3600;

			minutes = Math.floor(tmp/60);
			tmp = tmp%60;

			seconds = tmp;
		}

		// Update the input fields
		alarmDialog.find('input').eq(0).val(hours).end().eq(1).val(minutes).end().eq(2).val(seconds);

		alarmDialog.fadeIn();

	});

	alarmTime.click(function(){
		alarmTime.fadeOut();
	});

});