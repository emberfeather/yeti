(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD Registration
		define([ 'jquery' ], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($){
	var containers = {};
	var buttons = {};
	var slideDuration = 380;
	var allowLocalSave = true;
	var currency = '$';
	var ppy = 12;
	
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
			currency: currency
		});
		
		loan.hide().appendTo(containers.loans).slideDown(slideDuration, function() {
			$('input.delete', loan).click(function(){
				removeLoan(loan);
			});
			
			// Auto focus on the new loan
			$('input[type="number"]:first', loan).focus();
		});
	}
	
	function checkStatus() {
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
			
			var periodRate = (loan.rate / ppy);
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
				setError(ele, 'Needs a minimum payment greater than the interest charge: ' + currency + periodInterest.toFixed(2));
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
		updateSchedule(loans, payment);
	}
	
	function loadContainers() {
		containers.content = $('#content');
		
		containers.loans = $.tmpl('loans')
			.appendTo(containers.content)
			.on('input', saveData);
		
		containers.payments = $.tmpl('payments', {
				currency: currency,
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
		
		error.slideUp(slideDuration, function(){
			element.removeClass('error');
			element.removeData('error');
			
			error.remove();
		});
	}
	
	function removeLoan(loan) {
		loan.slideUp(slideDuration, function(){
			loan.remove();
			
			saveData();
			
			// Ensure there is always at least one loan
			if(!$('.loan', containers.loans).length) {
				addLoan();
			}
		});
	}
	
	function saveData() {
		if(!allowLocalSave) {
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
			error.hide().appendTo(element).slideDown(slideDuration);
		}
		
		error.text('⇒ ' + message);
		element.addClass('error');
	}
	
	function updateSchedule(loans, payment) {
		var schedule = {};
		
		$.each(loans, function(i, loan) {
			return;
		});
		
		var amort = $.tmpl('amortization', {
			schedule: schedule
		});
		
		if(!containers.amortization) {
			containers.content.append(amort);
		} else {
			containsers.amortization.replaceWith(amort);
		}
		
		containers.amortization = amort;
	}
}));
