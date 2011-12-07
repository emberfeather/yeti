(function($, goog){
	$.yeti = {
		allowLocalSave: true,
		currency: '$',
		interestOnlyThreshold: 1,
		slideDuration: 380,
		strategyOrder: [
			'interestHighLow',
			'interestLowHigh',
			'balanceLowHigh',
			'balanceHighLow'
		],
		ppy: 12
	};
	
	// Load the Google charts
	var chartDefer = $.Deferred();
	
	goog.load("visualization", "1", {
		packages: [
			"corechart"
		]
	});
	
	goog.setOnLoadCallback(function() {
		chartDefer.resolve();
	});
	
	var buttons = {};
	var containers = {};
	var lastUpdatedOn = new Date();
	var strategies = {};
	
	/**
	 * Define Strategies
	 * 
	 * Strategies are used to determine the order that the extra money from the snowball should be paid.
	 * Adding a new strategy is as simple as reordering the loans in the order desired.
	 */
	
	// Highest Balance First
	strategies.balanceHighLow = function(loans) {
		// Sort the loans by the interest rate, descending
		return loans.sort(function(a, b) {
			var diff = b.principal - a.principal;
			
			// If they have the same interest rate, want the one with the lowest balance first
			if(diff === 0) {
				return b.rate - a.rate;
			}
			
			return diff;
		});
	};
	
	strategies.balanceHighLow.label = 'Highest Balance First';
	
	// Lowest Balance First
	strategies.balanceLowHigh = function(loans) {
		// Sort the loans by the interest rate, descending
		return loans.sort(function(a, b) {
			var diff = a.principal - b.principal;
			
			// If they have the same interest rate, want the one with the lowest balance first
			if(diff === 0) {
				return b.rate - a.rate;
			}
			
			return diff;
		});
	};
	
	strategies.balanceLowHigh.label = 'Lowest Balance First';
	
	// Highest Interest First
	strategies.interestHighLow = function(loans) {
		// Sort the loans by the interest rate, descending
		return loans.sort(function(a, b) {
			var diff = b.rate - a.rate;
			
			// If they have the same interest rate, want the one with the lowest balance first
			if(diff === 0) {
				return a.principal - b.principal;
			}
			
			return diff;
		});
	};
	
	strategies.interestHighLow.label = 'Highest Rate First';
	
	// Lowest Interest First
	strategies.interestLowHigh = function(loans) {
		// Sort the loans by the interest rate, descending
		return loans.sort(function(a, b) {
			var diff = a.rate - b.rate;
			
			// If they have the same interest rate, want the one with the lowest balance first
			if(diff === 0) {
				return a.principal - b.principal;
			}
			
			return diff;
		});
	};
	
	strategies.interestLowHigh.label = 'Lowest Rate First';
	
	// Minimum Payment Only
	strategies.minimumPayment = function(loans) {
		return loans;
	};
	
	strategies.minimumPayment.label = 'Minimum Payment Only';
	strategies.minimumPayment.noExtra = true;
	
	$(function(){
		loadTemplates();
		loadContainers();
		loadData();
		
		checkStatus();
	});
	
	function addStrategy(evnt, strategy, loans, payment) {
		var stats = {
			interest: 0,
			principal: 0,
			payments: 0,
			isInterestOnly: true
		};
		
		$.each(loans, function(i, loan) {
			stats.interest += loan.interest;
			stats.principal += loan.principal;
			stats.payments = (loan.payments > stats.payments ? loan.payments : stats.payments);
			stats.isInterestOnly = stats.isInterestOnly && loan.isInterestOnly;
		});
		
		var listing = $.tmpl((stats.isInterestOnly ? 'strategyInfinity' : 'strategy'), {
			interest: toMoney(stats.interest),
			label: strategies[strategy].label,
			loans: loans,
			principal: toMoney(stats.principal),
			strategy: strategy
		})	.appendTo($('ul', containers.strategies));
		
		listing.on('click', function() {
			showStrategy.apply(this, [strategy, loans, stats, payment]);
		});
		
		showStrategyBest();
	}
	
	function addLoan(principal, rate, minPayment, callback) {
		callback = callback || $.noop;
		
		var loan = $.tmpl('loan', {
			currency: $.yeti.currency,
			principal: principal || 0,
			rate: rate || 0.0,
			minPayment: minPayment || 0
		});
		
		loan.hide().appendTo(containers.loans).slideDown($.yeti.slideDuration, function() {
			$('input.delete', loan).click(function(){
				removeLoan(loan);
			});
			
			callback.apply(this);
		});
	}
	
	function calculateStrategy(evnt, strategy, loans, payment, updatedOn) {
		var schedule = [];
		var hasBalance = true;
		var interestOnlyCount = 0;
		var extraUsed = 0;
		
		// Prime the loan for scheduling
		$.each(loans, function(i, loan) {
			loan.balance = loan.principal;
			loan.interest = 0;
			loan.schedule = [];
			loan.periodRate = (loan.rate / $.yeti.ppy);
		});
		
		while(hasBalance && updatedOn == lastUpdatedOn && interestOnlyCount < $.yeti.interestOnlyThreshold) {
			var extra = payment;
			
			// Handle minimum payments
			$.each(loans, function(i, loan) {
				if(loan.balance > 0) {
					var amount = Math.min(loan.balance, loan.minPayment);
					var interest = toMoney(loan.balance * (loan.periodRate / 100));
					var principal = toMoney(amount - interest);
					
					loan.balance = toMoney(loan.balance - principal);
					loan.interest = toMoney(loan.interest + interest);
					extra = toMoney(extra - amount);
					
					loan.schedule.push({
						amount: toMoney(amount),
						interest: toMoney(interest),
						principal: toMoney(principal),
						balance: toMoney(loan.balance)
					});
				}
			});
			
			// Allow a strategy to not use the snowball
			if(!strategies[strategy].noExtra) {
				// Keep track of how much extra we used
				extraUsed = extra;
				
				// Handle extra money
				$.each(loans, function(i, loan) {
					if(loan.balance > 0) {
						var amount = Math.min(loan.balance, extra);
						
						loan.balance -= amount;
						extra -= amount;
						
						var pos = loan.schedule.length - 1;
						
						loan.schedule[pos].amount = toMoney(loan.schedule[pos].amount + amount);
						loan.schedule[pos].principal = toMoney(loan.schedule[pos].principal + amount);
						loan.schedule[pos].balance = toMoney(loan.balance);
						
						// Check if all the extra money is spent
						if(extra <= 0) {
							return false;
						}
					}
				});
			}
			
			// Determine if all the loans have been repaid
			hasBalance = false;
			isInterestOnly = true;
			
			$.each(loans, function(i, loan) {
				if(loan.balance > 0) {
					hasBalance = true;
					
					// As long as there is at least one loan that it is not interest only we are not stuck
					isInterestOnly = isInterestOnly && loan.schedule[loan.schedule.length - 1].principal == 0;
				}
			});
			
			// If there are only interest-only loans increment the threshold
			if(isInterestOnly && extraUsed == 0) {
				interestOnlyCount++;
			}
		}
		
		if(updatedOn != lastUpdatedOn) {
			return;
		}
		
		// Determine some post-calulation properties
		$.each(loans, function(i, loan) {
			loan.payments = loan.schedule.length;
			loan.isInterestOnly = loan.balance > 0;
		});
		
		containers.content.trigger('snowball.packed', [
					strategy,
					loans,
					payment
				]);
	}
	
	function checkStatus() {
		// Update the timestamp for last data change
		lastUpdatedOn = new Date();
		var updatedOn = lastUpdatedOn;
		
		// Clear any previous calculations
		$('ul', containers.strategies).empty();
		$('.details', containers.strategies).empty();
		containers.strategies.hide();
		containers.details.hide();
		
		// Check for valid loan data
		var isValid = true;
		var totalPeriodInterest = 0.0;
		var totalMinPayment = 0.0;
		var loans = [];
		
		$('.loan', containers.loans).each(function(i, element){
			var loan = {};
			var ele = $(element);
			
			var hasFocus = $(':focus', ele).length > 0;
			var hasError = false;
			
			loan.principal = parseFloat($('input[name="principal"]', element).val()) || 0;
			loan.rate = parseFloat($('input[name="rate"]', element).val()) || 0.0;
			loan.minPayment = parseFloat($('input[name="minPayment"]', element).val()) || 0;
			
			// Only care about loans with principals
			if(loan.principal <= 0) {
				return;
			}
			
			var periodRate = (loan.rate / $.yeti.ppy);
			var periodInterest = toMoney(loan.principal * (periodRate / 100));
			
			// If the loan still has the focus and there is a rate set but not a min payment, calculate the min payment
			if(hasFocus && loan.rate > 0 && loan.minPayment == 0) {
				loan.minPayment = periodInterest;
				
				$('input[name="minPayment"]', ele).val(loan.minPayment);
			}
			
			// Need a minimum payment if there is an interest rate
			if(loan.rate > 0 && loan.minPayment == 0) {
				isValid = false;
				
				if(!hasFocus) {
					setMessage(ele, 'Needs a minimum payment since there is an interest rate');
				}
				
				return;
			}
			
			// Need a minimum payment that pays at least the interest
			if(loan.rate > 0 && loan.minPayment < periodInterest) {
				isValid = false;
				
				if(!hasFocus) {
					setMessage(ele, 'Needs a minimum payment greater than the interest charge: ' + toCurrency(periodInterest));
				}
				
				return;
			}
			
			// Remove any lingering errors
			if(ele.hasClass('error')) {
				removeError(ele);
			}
			
			// Keep a running total
			totalPeriodInterest += periodInterest;
			totalMinPayment += loan.minPayment;
			
			loans.push(loan);
		});
		
		// Check for valid payment data
		var payment = $('input[name="payment"]', containers.payments).val();
		var paymentContainer = $('.payment', containers.payments);
		var hasFocus = $(':focus', paymentContainer).length > 0;
		
		// If the there is not enough repayment, calculate it
		if(payment < totalPeriodInterest || payment < totalMinPayment) {
			if(payment == 0) {
				payment = toMoney(Math.max(totalPeriodInterest * 1.25, totalMinPayment * 1.25));
				
				$('input[name="payment"]', containers.payments).val(payment);
			} else if(payment < totalMinPayment) {
				if(!hasFocus) {
					setMessage(paymentContainer, 'Needs a repayment amount large enough to cover the minimum payment: ' + toCurrency(totalMinPayment));
				}
				
				return;
			} else {
				if(!hasFocus) {
					setMessage(paymentContainer, 'Needs a repayment amount large enough to cover the interest: ' + toCurrency(totalPeriodInterest));
				}
				
				return;
			}
		}
		
		removeError(paymentContainer);
		
		// Only continue if all loans and payment values are valid
		if(!loans.length || !isValid) {
			return;
		}
		
		// Show the strategies
		containers.strategies.show();
		
		// Update the schedule
		updateSchedules(loans, payment, updatedOn);
	}
	
	function loadContainers() {
		containers.content = $('#content')
			.on('snowball.pack', calculateStrategy)
			.on('snowball.packed', addStrategy);
		
		containers.loans = $.tmpl('loans')
			.appendTo(containers.content)
			.on('input change', saveData);
		
		containers.payments = $.tmpl('payments', {
				currency: $.yeti.currency,
				payment: localStorage.payment || 0.00
			})
			.appendTo(containers.content)
			.on('input change', saveData);
		
		containers.strategies = $.tmpl('strategies')
			.appendTo(containers.content);
		
		containers.details = $.tmpl('details')
			.appendTo(containers.content);
	}
	
	function loadData() {
		// Add an add button for loans
		containers.addLoan = $.tmpl('button', {
			value: '+ Add'
		});
		
		containers.addLoan.insertAfter(containers.loans);
		
		buttons.addLoan = $('input', containers.addLoan).click(function() {
			addLoan(0, 0, 0, function() {
				// Auto focus on the new loan
				$('input[type="number"]:first', this).focus();
			});
		});
		
		// Check for previously saved loans
		if(localStorage.loans) {
			var loans = JSON.parse(localStorage.loans);
			
			$.each(loans, function(i, value) {
				addLoan(value.principal, value.rate, value.minPayment);
			});
		} else {
			// Add sample loan
			addLoan(5000, 8.5, 50);
		}
	}
	
	function loadTemplates() {
		$('[data-template]').each(function(i, element){
			var ele = $(element);
			
			ele.template(ele.data('template'));
		});
	}
	
	function removeError(element) {
		if(!element.hasClass('error')) {
			return;
		};
		
		var error = element.data('error');
		
		error.slideUp($.yeti.slideDuration, function(){
			element.removeClass('error');
			element.removeData('error');
			
			error.remove();
		});
	}
	
	function removeLoan(loan) {
		loan.slideUp($.yeti.slideDuration, function(){
			loan.remove();
			
			saveData();
			
			// Ensure there is always at least one loan
			if(!$('.loan', containers.loans).length) {
				addLoan();
			}
		});
	}
	
	function saveData() {
		if(!$.yeti.allowLocalSave) {
			return;
		}
		
		// Recheck the loan data to auto calculate any missing data
		checkStatus();
		
		// Save the loans
		var loans = [];
		
		$('.loan', containers.loans).each(function(i, element){
			var loan = {};
			
			loan.principal = parseFloat($('input[name="principal"]', element).val()) || 0;
			loan.rate = parseFloat($('input[name="rate"]', element).val()) || 0.0;
			loan.minPayment = parseFloat($('input[name="minPayment"]', element).val()) || 0;
			
			if(loan.principal > 0) {
				loans.push(loan);
			}
		});
		
		localStorage.loans = JSON.stringify(loans);
		
		// Save the payment
		localStorage.payment = parseFloat($('input[name="payment"]', containers.payments).val()) || 0.0;
		
	}
	
	function setMessage(element, value, type) {
		var message;
		var isNew = false;
		type = type || 'error';
		
		message = element.data(type);
		
		if(!message) {
			message = $.tmpl('message', {
				className: 'message'
			}).appendTo(element);
			
			element.data(type, message);
			
			isNew = true;
		}
		
		message.text('⇒ ' + value);
		
		element.addClass(type);
	}
	
	function showStrategy(strategy, loans, stats, payment) {
		var element = $(this);
		var container = $('.details', containers.details).empty();
		
		// Mark the selected strategy
		var parentList = element.parent();
		
		if(parentList.data('selected')) {
			parentList.data('selected').removeClass('selected');
		}
		
		element.addClass('selected');
		
		parentList.data('selected', element);
		
		// Change the header text
		var header = $('h2', containers.details);
		
		header.text(strategies[strategy].label);
		
		// Check for 'best' solution
		if(element.hasClass('best')) {
			containers.details.addClass('best');
		} else {
			containers.details.removeClass('best');
		}
		
		var details = $.tmpl((stats.isInterestOnly ? 'strategyDetailInfinity' : 'strategyDetail'), {
			strategy: strategy,
			principal: stats.principal,
			interest: stats.interest,
			payments: stats.payments,
			payment: payment
		});
		
		// Add the loan repayment order
		$.tmpl('strategyOrder', loans).appendTo($('.repayOrder', details));
		
		details.appendTo(container);
		
		chartDefer.then(function() {
			var data = new goog.visualization.DataTable();
			
			data.addColumn('string', 'Payment');
			data.addRows(stats.payments);
			
			// Add the payment numbers
			for(var i = 0; i < stats.payments; i++) {
				data.setValue(i, 0, i + '');
			}
			
			$.each(loans, function(i, loan){
				data.addColumn('number', toCurrency(loan.principal) + ' @ ' + loan.rate + '%');
				
				for(var j = 0; j < loan.schedule.length; j++) {
					data.setValue(j, i + 1, parseFloat(loan.schedule[j].balance.toFixed(2)));
				}
			});
			
			var chart = new goog.visualization.LineChart($('.chart', details).get(0));
			
			chart.draw(data, {
				width: 540,
				height: 300,
				backgroundColor: 'transparent',
				legend: 'bottom',
				vAxis: {
					format: '\u00A4#,###.00'
				},
				chartArea: {
					left: 0,
					top: 0,
					width: "100%",
					height: "90%"
				}
			});
		});
		
		containers.details.show();
	}
	
	function showStrategyBest() {
		var minInterest = 999999999;
		
		// Find the lowest minimum interest
		$('li', containers.strategies).each(function() {
			var ele = $(this);
			var interest = toMoney(ele.data('interest'));
			
			if(interest < minInterest) {
				minInterest = interest;
			}
		}).removeClass('best');
		
		$('li[data-interest="' + minInterest + '"]', containers.strategies)
			.addClass('best')
			.first()
			.trigger('click');
	}
	
	function toMoney(amount) {
		return parseFloat(parseFloat(amount).toFixed(2));
	}
	
	function updateSchedules(loans, payment, updatedOn) {
		// Determine repayment strategies to use based on order of strategies
		var usedStrategies = [];
		var usedLoanOrders = [];
		
		// Determine the strategies to use
		$.each($.yeti.strategyOrder, function(i, strategy) {
			// Use a copy of the loans to let the strategies have their own order
			var loanOrder = strategies[strategy](JSON.parse(JSON.stringify(loans)));
			
			// Check if the loan repayment order is already being used
			var orderCheck = JSON.stringify(loanOrder);
			var isUsed = false;
			
			$.each(usedLoanOrders, function(j, usedLoanOrder) {
				if(orderCheck === usedLoanOrder) {
					isUsed = true;
					
					return false;
				}
			});
			
			// Only want to add strategies that offer a unique repayment order
			if(!isUsed) {
				usedStrategies.push({
					strategy: strategy,
					loans: loanOrder
				});
				
				usedLoanOrders.push(orderCheck);
			}
		});
		
		if(updatedOn != lastUpdatedOn) {
			return;
		}
		
		$.each(usedStrategies, function(i, strategy) {
			// Trigger the schedule calculation for all the strategies
			containers.content.trigger('snowball.pack', [
						strategy.strategy,
						strategy.loans,
						payment,
						updatedOn
					]);
		});
		
		// Trigger the schedule calculation for the minimum payment strategy
		containers.content.trigger('snowball.pack', [
			'minimumPayment',
			loans,
			payment,
			updatedOn
		]);
	}
	
	$.wait = function(time) {
		var defer = $.Deferred();
		
		setTimeout(function() {
			defer.resolve();
		}, time);
		
		return defer;
	};
}(jQuery, google));

// Global so that the templating can use to format data
function convertMonths(value) {
	var years = parseInt(value / 12);
	var months = value % 12;
	
	var output = '';
	
	if(years > 0) {
		output += ' ' + years + ' year' + (years != 1 ? 's' : '');
	}
	
	if(months > 0) {
		output += ' ' + months + ' month' + (months != 1 ? 's' : '');
	}
	
	return output;
}

function toComma(amount) {
	var value = amount + '';
	var parts = value.split('.');
	
	var whole = parts[0];
	var part = parts[1] ? '.' + parts[1] : '';
	
	var regex = /(\d+)(\d{3})/;
	
	while(regex.test(whole)) {
		whole = whole.replace(regex, '$1' + ',' + '$2');
	}
	
	return whole + part;
}

function toCurrency(amount) {
	var value = toComma(parseFloat(amount).toFixed(2));
	
	return $.yeti.currency + value;
}
