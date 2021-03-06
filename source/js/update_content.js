/*
	This module updates the content on the page when the user navigates through the app
*/

define(['lib/news_special/bootstrap', 'calculator', 'bar_chart', 'process_data'], 
function (news, calculator, BarChart, processData) {

	/* Set $ to jQuery */
	$ = news.$;

	/* The stats text, displayed on each page, as a fact under the inputs */
	var statsTexts = [];
	statsTexts['seasonTicket'] = 'At £{AMOUNT}, the cost of the cheapest season ticket at {TEAM_NAME} has {DIFF} since 2013.';
	statsTexts['individualTicket'] = 'At £{AMOUNT}, the cost of the cheapest match-day ticket at {TEAM_NAME} has {DIFF} since 2011.';
	statsTexts['food'] = 'At £{AMOUNT}, the cost of a pie at {TEAM_NAME} has {DIFF} since 2011.';
	statsTexts['programme'] = 'At £{AMOUNT}, the cost of a programme at {TEAM_NAME} has {DIFF} since 2011.';
	statsTexts['kit'] = 'At £{AMOUNT}, the cost of a {TEAM_NAME} shirt is {DIFF} the average cost of £{AVG_COST} in {THE}{LEAGUE_NAME}.';
	statsTexts['ticketCosts'] = 'The cheapest season ticket at {TEAM_NAME} is <strong>{AMOUNT}%</strong> {UP_DOWN} than the average comparable cost for {THE}{LEAGUE_NAME} of £{AVG_AMOUNT}.';
	statsTexts['europeanTicketCosts'] = 'The cheapest season ticket at {TEAM_NAME} is <strong>{AMOUNT}%</strong> {UP_DOWN} than the average comparable cost of £{AVG_AMOUNT} for other major European teams.';

	/* The text used on the share buttons */
	var shareText = [];
	shareText['myTotal'] = 'This season I will spend £{AMOUNT} following {TEAM_NAME}';
	shareText['facebookTotal'] = 'This season I will spend £{AMOUNT} following {TEAM_NAME}. Try the BBC’s calculator and work out your costs';
	shareText['homeGoal'] = 'Based on last season’s results and prices a home goal cost about £{AMOUNT} at {TEAM_NAME} in 2013-14';
	shareText['facebookHomeGoal'] = 'Based on last season’s results and prices a home goal cost about £{AMOUNT} at {TEAM_NAME} in 2013-14';

	/*	
		Returns the short name of the users team
	*/
	function getSelectedTeamName(){
		var team = calculator.getTeam();
		return team.shortName;
	}

	/*
		Hides the navigation buttons after the selected item. This is called when
		the previous button is pressed to hide the last page
	*/
	function hideProcedingBreadcrumbs(newSelection){
		switch (newSelection){
			case 'nav-item__team':
				$('.nav-item__team').hide();
			/* falls through */
			case 'nav-item__tickets':
				$('.nav-item__tickets').hide();
			/* falls through */
			case 'nav-item__food':
				$('.nav-item__food').hide();
			/* falls through */
			case 'nav-item__programmes':
				$('.nav-item__programmes').hide();
			/* falls through */
			case 'nav-item__kit':
				$('.nav-item__kit').hide();
			/* falls through */
			case 'nav-item__results':
				$('.nav-item__results').hide();
				break;
		}
	}

	/*
		Update the navigation when the user clicks next or previous
	*/
	function updateBreadcrumbs(newSelection) {

		hideProcedingBreadcrumbs(newSelection);

		$('.nav .nav-item').each(function (index){
			$(this).removeClass('nav-item--active');
		});
		var $newSelection = $('.' + newSelection);

		$newSelection.addClass('nav-item--active');
		$newSelection.show();
		
	}

	/*
		@param text the text to be manipulated. {UP_DOWN} will be replaced
			with the actual value of up or down. {AMOUNT} will be replaced with the
			amount of difference between currentvalue and oldValue
		@param upDown contains the up and down text, split by a /. 
			For example "up/down" or "more/less" are valid params
		@param currentValue the latest value to test
		@param oldValue the older value to (Last years data).
		@param pence wether or not to show the pence value
	*/
	function makeStatText(text, currentValue, oldValue, pence){

		var userTeam = calculator.getTeam();

		/* If data is missing return null */
		if(currentValue==null || oldValue==null){
			return null;
		}

		var diff = currentValue - oldValue;
		var diffAamount = (pence) ? Math.abs(diff).toFixed(2) :  Math.round(Math.abs(diff));

		var amount = (pence) ? Math.abs(currentValue).toFixed(2) :  Math.round(Math.abs(currentValue));


		var diffText = (diff>=0) ? 'increased by £{DIFF_AMOUNT}' : 'decreased by £{DIFF_AMOUNT}';
		diffText = (diff===0) ? 'not changed' : diffText;
		diffText = diffText.replace('{DIFF_AMOUNT}', diffAamount);


		text = text.replace('{AMOUNT}', amount);
		text = text.replace('{DIFF}', diffText);
		text = text.replace('{TEAM_NAME}', userTeam.shortName);

		return text;

	}

	/*
		Updates .team-name--text with the teams short name
		Updates .team-name--text__long with the teams short name

		All elements with the class name will have its text set correctly.
	*/
	function updateTeamName(){
		
		var team = calculator.getTeam();

		$('.team-name--text').each(function(){
			$(this).text(team.shortName);
		});
		$('.team-name--text__long').each(function(){
			$(this).text(team.name);
		});
	}

	/*
		Updates the content of the select team page.
	*/
	function updateSelectTeamContent() {
		/* Padding to allow room for the auto suggest options */
		$('.main').css('padding-bottom', '18px');

		/* Hides crest and header */
		$('.team-crest').hide();
		$('.team-header').hide();
		$('.stats-fact--text').hide();

		updateBreadcrumbs('nav-item__team');
	}

	/*
		Updates the content of the select ticket page.
	*/
	function updateSelectTicketContent() {
		news.pubsub.emit('istats', ['page-opened', 'newsspec-interaction', 'tickets']);

		$('.main').css('padding-bottom', '18px');

		/* Update team crest. */
		var teamName = calculator.getTeam().prettyName;
		var imagePage = staticDomainPath + '/img/crests/' + teamName + '.png';
		$('.team-crest').css('background-image','url(' + imagePage + ')');

		/* Show team crest and header */
		$('.team-crest').css('display', 'inline');
		$('.team-header').show();

		updateBreadcrumbs('nav-item__tickets');
		updateTeamName();
			
		$('.team-header').show();

		updateTicketInputs();

	}

	/*
		Updates the content of the food page.
	*/
	function updateFoodPriceContent(){
		news.pubsub.emit('istats', ['page-opened', 'newsspec-interaction', 'food']);

		var userTeam = calculator.getTeam();
		updateBreadcrumbs('nav-item__food');

		var updateText = makeStatText(statsTexts['food'], userTeam['pie'], userTeam['pie2011'], true);

		if(updateText!=null){
			$('.stats-fact--text').text(updateText);
			$('.stats-fact--text').show();
		}else{
			$('.stats-fact--text').hide();
		}
	}

	/*
		Updates the content of the programmes page.
	*/
	function updateProgrammesPriceContent(){
		news.pubsub.emit('istats', ['page-opened', 'newsspec-interaction', 'programme']);

		var userTeam = calculator.getTeam();
		updateBreadcrumbs('nav-item__programmes');

		var updateText = makeStatText(statsTexts['programme'], userTeam['programme'], userTeam['programme2011'], true);

		if(updateText!=null){
			$('.stats-fact--text').text(updateText);
			$('.stats-fact--text').show();
		}else{
			$('.stats-fact--text').hide();
		}

	}


	/*
		Updates the content of the kit page.
	*/
	function updateKitPriceContent(){
		news.pubsub.emit('istats', ['page-opened', 'newsspec-interaction', 'kit']);

		var userTeam = calculator.getTeam();
		var userLeague = calculator.getLeague();

		updateBreadcrumbs('nav-item__kit');

		if(userTeam['adultShirt'] !== null && userLeague['avgKitCost'] !== null){
			var diff = userTeam['adultShirt'] - userLeague['avgKitCost'];
			var diffAamount = Math.abs(diff).toFixed(2);

			var diffText = (diff>=0) ? '£{DIFF_AMOUNT} more than' : '£{DIFF_AMOUNT} less than';
			diffText = (diff===0) ? 'the same as' : diffText;
			diffText = diffText.replace('{DIFF_AMOUNT}', diffAamount);


			var kitCost = Math.abs(userTeam['adultShirt']).toFixed(2);
			var avgKitCost = Math.abs(userLeague['avgKitCost']).toFixed(2);
			var theText = (userLeague.needThe) ? 'the ' : '';

			updateText = statsTexts['kit'];
			updateText = updateText.replace('{AMOUNT}', kitCost);
			updateText = updateText.replace('{AVG_COST}', avgKitCost);
			updateText = updateText.replace('{DIFF}', diffText);
			updateText = updateText.replace('{TEAM_NAME}', userTeam['name']);
			updateText = updateText.replace('{THE}', theText);
			updateText = updateText.replace('{LEAGUE_NAME}', userLeague['name']);

			$('.stats-fact--text').text(updateText);
			$('.stats-fact--text').show();
		}else{
			$('.stats-fact--text').hide();
		}

	}

	/*
		Updates the content of the results page.

		This function gets the results from the calculator module,
		dislays the results in the breakdown element and displays the graphs
	*/
	function updateResultsPageContent(){
		news.pubsub.emit('istats', ['page-opened', 'newsspec-interaction', 'results-page']);


		/* HIDE UNNEEDED THINGS */
		$('.pagination--button').hide();
		$('.stats-fact--text').hide();

		$('.pagination--button__restart').show();
		$('.main').css('padding-bottom', '180px');

		updateBreadcrumbs('nav-item__results');

		updateTeamName();

		/* Display ticket price chart */

        var ticketPriceData = processData.getTicketPriceChartData();
        var ppgChartData = processData.getPPGChartData();

        if(ticketPriceData.length > 0){
            var barChart = new BarChart(ticketPriceData, false);
            barChart.draw($('#ticket-price-graph'));	            	
        }else{
        	/* Hide chart because we have no data */
        	$('#ticket-price-graph').hide();
        }


        if(ppgChartData.length > 0){
            var barChartTwo = new BarChart(ppgChartData, true);
            barChartTwo.draw($('#cost-of-goals-graph'));
            $('.goal-price-graph').show();
        }else{
        	/* Hide chart because we have no data */
        	$('.goal-price-graph').hide();
        }

        updateTicketPriceText();

		if(calculator.shouldShowBreakDown()){
			var breakdown = calculator.getResultsBreakDown();
			showBreakDownResults(breakdown);
			updateShareText(breakdown);
		}else{
			/* Show generic results */
			$('.results-breakdown').hide();
			$('.results-page--total').hide();
			$('#breakDownShare').hide();
		}
	}

	/*
		Updates the text shown above the compartive tickets bar chart.
	*/

	function updateTicketPriceText() {
		var userTeam = calculator.getTeam();
		var userLeague = calculator.getLeague();

		var leagueAvg = (!userLeague.isEuropean) ? userLeague['avgTicketCost'] : processData.getEuopeanAvg();
		var avgText = Math.round(leagueAvg);

		var diff = (userTeam['cheapSeason'] / leagueAvg * 100) - 100;
		var upDownValue = (diff>=0) ? 'more' : 'less';
		var amount = Math.abs(Math.round(diff));
		var theText = (userLeague.needThe) ? 'the ' : '';

		updateText = (userLeague.isEuropean) ? statsTexts['europeanTicketCosts'] : statsTexts['ticketCosts'];
		updateText = updateText.replace('{AMOUNT}', Math.round(amount));
		updateText = updateText.replace('{UP_DOWN}', upDownValue);
		updateText = updateText.replace('{TEAM_NAME}', userTeam['name']);
		updateText = updateText.replace('{AVG_AMOUNT}', avgText);
		updateText = updateText.replace('{THE}', theText);
		updateText = updateText.replace('{LEAGUE_NAME}', userLeague['name']);

		$('#compare-text--tickets').html(updateText);
	}

	/*
		Shows the breakdown of results.
	*/
	function showBreakDownResults(resultsBreakdown){
		var userTeam = calculator.getTeam();

		$('#result-text-total').text('£' + resultsBreakdown.total.toFixed(2));
		$('#result-text-tickets').text('£' + resultsBreakdown.tickets.toFixed(2));
		$('#result-text-food').text('£' + resultsBreakdown.food.toFixed(2));
		$('#result-text-programme').text('£' + resultsBreakdown.programmes.toFixed(2));
		$('#result-text-kit').text('£' + resultsBreakdown.kit.toFixed(2));
		$('#result-text-home-goal').text('£' + parseFloat(userTeam.goalCost).toFixed(2));
	}

	/*
		Sets the share text of both of the buttons to the users text
	*/
	function updateShareText(resultsBreakdown){
		var userTeam = calculator.getTeam();
		
		var totalText = shareText['myTotal'].replace('{AMOUNT}', resultsBreakdown.total.toFixed(2)).replace('{TEAM_NAME}', userTeam.shortName);
		var facebookText = shareText['facebookTotal'].replace('{AMOUNT}', resultsBreakdown.total.toFixed(2)).replace('{TEAM_NAME}', userTeam.shortName);
		$('#totalShare').data('shareText', totalText);
		$('#totalShare').data('facebookText', facebookText);

		var homeGoalText = shareText['homeGoal'].replace('{AMOUNT}', parseFloat(userTeam.goalCost).toFixed(2)).replace('{TEAM_NAME}', userTeam.shortName);
		var facebookHomeGoalText = shareText['facebookHomeGoal'].replace('{AMOUNT}', parseFloat(userTeam.goalCost).toFixed(2)).replace('{TEAM_NAME}', userTeam.shortName);
		$('#homeGoalsShare').data('shareText', homeGoalText);
		$('#homeGoalsShare').data('facebookText', facebookHomeGoalText);
	}

	/*
		Updates the inputs shown on the select ticket page, when the user selects a different ticket type
		a different set of inputs will be shown
	*/
	function updateTicketInputs(){

		var userTeam = calculator.getTeam();
		var updateText = null;
		$('.pagination--error').hide();

		switch ($('input[name="user-ticket"]:checked').val()){
			case 'season':
				$('.ticket-type--text').text('season ticket');
				updateText = makeStatText(statsTexts['seasonTicket'], userTeam['cheapSeason'], userTeam['cheapSeason2013'], true);
				break;
			case 'individual':
				$('.ticket-type--text').text('indivudal tickets');
				updateText = makeStatText(statsTexts['individualTicket'], userTeam['cheapTicket'], userTeam['cheapestMatchdayTicket2011'], true);
				break;
		}

		if(updateText!==null){
			$('.stats-fact--text').text(updateText);
			$('.stats-fact--text').show();
		}else{
			$('.stats-fact--text').hide();
		}

		var checked = $('input[name=user-ticket]:checked', '.select-ticket').val();

		$('.ticket-option').hide();
		$('.ticket-option-' + checked).show();


	}

	$('input[name=user-ticket]').change(
	    function(){
			updateTicketInputs();  
	    }
	);  

	function scrollToTop(){
		try {
	    	var talker_uid = window.location.pathname,
                message = {
                    scrollPosition: -10,
                    hostPageCallback: false
                };
                window.parent.postMessage(talker_uid + '::' + JSON.stringify(message), '*');
	    }catch(err){
	    	// Probably a XSS error
	    }
	}

	/*
		Results all elements when the user clicks start agian.

		This stops the user from seeing the text that they entered the last time
		they ran the calcualtor.
	*/
	function resetAllElms(){
		news.pubsub.emit('istats', ['start-again-clicked', 'newsspec-interaction', true]);

		$('#ticket_season').prop('checked', true);
		updateTicketInputs();

		$('#user-team').val('');
		$('#user-team').data('team', null);

		$('#season-ticket-cost').val('');
		$('#individual-ticket-cost').val('');
		$('#user-game-count').val('');
		$('#food-price').val('');
		$('#programmes-count').val('');
		$('#adult-shirt-count').val('');

		$('.bar-chart').html('');

		$('.pagination--button').show();
		$('.pagination--button__restart').hide();
		$('.pagination--button__previous').hide();

		scrollToTop();
	}


	return {
		update: function (nextPage) {
			if(nextPage!== 'select-team'){
				scrollToTop(); //Scroll user to top of page
			}

			/*
				Determine which page is being shown next and update the content accordingly
			*/
			switch (nextPage) {
				case 'select-team':
					return updateSelectTeamContent();
				case 'select-ticket':
					return updateSelectTicketContent();
				case 'food-price-page':
					return updateFoodPriceContent();
				case 'programmes-price-page':
					return updateProgrammesPriceContent();
				case 'kit-price-page':
					return updateKitPriceContent();
				case 'results-page':
					return updateResultsPageContent();
			}

		},
		resetAllElms: resetAllElms
	};

});