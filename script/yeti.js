(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD Registration
		define([ 'jquery' ], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($){
	$.yeti = {
		allowLocalSave: true,
		currency: '$',
		slideDuration: 380,
		strategyOrder: [
			'interestHighLow'
		],
		ppy: 12
	};
	
	var buttons = {};
	var containers = {};
	var lastUpdated = new Date();
	
	var strategies = {
		// Highest Interest First
		interestHighLow: function(loans) {
			// Sort the loans by the interest rate, descending
			return loans.sort(function(a, b) {
				var diff = b.rate - a.rate
				
				// If they have the same interest rate, want the one with the lowest balance first
				if(diff === 0) {
					return a.principal - b.principal;
				}
				
				return diff;
			});
		}
	};
	
	$(function(){
		loadTemplates();
		loadContainers();
		loadData();
		
		checkStatus();
	});
	
	function addLoan(principal, rate, minPayment) {
		var loan = $.tmpl('loan', {
			principal: principal || 0,
			rate: rate || 0.0,
			minPayment: minPayment || 0,
			currency: $.yeti.currency
		});
		
		loan.hide().appendTo(containers.loans).slideDown($.yeti.slideDuration, function() {
			$('input.delete', loan).click(function(){
				removeLoan(loan);
			});
			
			// Auto focus on the new loan
			$('input[type="number"]:first', loan).focus();
		});
	}
	
	function checkStatus() {
		// Update the timestamp for last data change
		lastUpdated = new Date();
		
		// Check for valid loan data
		var isValid = true;
		var totalPeriodInterest = 0.0;
		var loans = [];
		
		$('.loan', containers.loans).each(function(i, element){
			var loan = {};
			var ele = $(element);
			
			var hasFocus = $(':focus', ele).length > 0;
			
			loan.principal = parseFloat($('input[name="principal"]', element).val()) || 0;
			loan.rate = parseFloat($('input[name="rate"]', element).val()) || 0.0;
			loan.minPayment = parseFloat($('input[name="minPayment"]', element).val()) || 0;
			
			// Only care about loans with principals
			if(loan.principal <= 0) {
				return;
			}
			
			var periodRate = (loan.rate / $.yeti.ppy);
			var periodInterest = parseFloat((loan.principal * (periodRate / 100)).toFixed(2));
			
			// If the loan still has the focus and there is a rate set but not a min payment, calculate the min payment
			if(hasFocus && loan.rate > 0 && loan.minPayment == 0) {
				loan.minPayment = periodInterest;
				
				$('input[name="minPayment"]', ele).val(loan.minPayment);
			}
			
			// Need a minimum payment if there is an interest rate
			if(loan.rate > 0 && loan.minPayment == 0) {
				setError(ele, 'Needs a minimum payment since there is an interest rate');
				isValid = false;
				
				return;
			}
			
			// Need a minimum payment that pays at least the interest
			if(loan.rate > 0 && loan.minPayment < periodInterest) {
				setError(ele, 'Needs a minimum payment greater than the interest charge: ' + $.yeti.currency + periodInterest.toFixed(2));
				isValid = false;
				
				return;
			}
			
			// Remove any lingering errors
			if(ele.hasClass('error')) {
				removeError(ele);
			}
			
			// Keep a running sum of the interest amount
			totalPeriodInterest += periodInterest;
			
			loans.push(loan);
		});
		
		// Check for valid payment data
		var payment = $('input[name="payment"]', containers.payments).val();
		var paymentContainer = $('.payment', containers.payments);
		
		// If the there is not enough repayment, calculate it
		if(payment < totalPeriodInterest) {
			payment = payment == 0 ? parseFloat((totalPeriodInterest * 1.25).toFixed(2)) : totalPeriodInterest;
			
			$('input[name="payment"]', containers.payments).val(payment);
		} else {
			removeError(paymentContainer);
		}
		
		// Only continue if all loans and payment values are valid
		if(!loans.length || !isValid) {
			return;
		}
		
		// TODO Check if the schedule has already been calculated
		
		// Update the schedule
		updateSchedules(loans, payment);
	}
	
	function loadContainers() {
		containers.content = $('#content');
		
		containers.loans = $.tmpl('loans')
			.appendTo(containers.content)
			.on('input', saveData);
		
		containers.payments = $.tmpl('payments', {
				currency: $.yeti.currency,
				payment: localStorage.payment || 0.00
			})
			.appendTo(containers.content)
			.on('input', saveData);
	}
	
	function loadData() {
		// Add an add button for loans
		containers.addLoan = $.tmpl('button', {
			value: '+ Add'
		});
		
		containers.addLoan.insertAfter(containers.loans);
		
		buttons.addLoan = $('input', containers.addLoan).click(function() {
			addLoan();
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
	
	function setError(element, message) {
		var error;
		
		error = element.data('error');
		
		if(!error) {
			error = $.tmpl('error', {
				className: 'message'
			});
			
			element.data('error', error);
			error.hide().appendTo(element).slideDown($.yeti.slideDuration);
		}
		
		error.text('⇒ ' + message);
		element.addClass('error');
	}
	
	function updateSchedules(loans, payment) {
		// Determine repayment strategies to use based on order of strategies
		var usedStrategies = [];
		var usedLoanOrders = [];
		
		$.each($.yeti.strategyOrder, function(i, strategy) {
			// Use a copy of the loans to let the strategies have their own order
			var loanOrder = strategies[strategy](JSON.parse(JSON.stringify(loans)));
			
			console.log(i, strategy, loanOrder);
		});
	}
}));
