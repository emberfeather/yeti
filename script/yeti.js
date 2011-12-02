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
		containers.loan = $('#loans');
		containers.payment = $('#payment');
		containers.details = $('#details');
		containers.extraDetails = $('#extraDetails');
		
		$('#buttonTemplate').template('button');
		$('#errorTemplate').template('error');
		$('#loanTemplate').template('loan');
		$('#paymentTemplate').template('payment');
		
		// Add an add button for loans
		containers.addLoan = $.tmpl('button', {
			value: '+ Add'
		});
		
		containers.addLoan.insertAfter(containers.loan);
		
		buttons.addLoan = $('input', containers.addLoan).click(function() {
			addLoan();
		});
		
		// Add a calculation button
		containers.calculate = $.tmpl('button', {
			className: 'status',
			value: 'Waiting For Snow&hellip;'
		});
		
		containers.calculate.insertAfter(containers.payment);
		
		buttons.calculate = $('input', containers.calculate);
		
		buttons.calculate.click(function() {
			console.log('Calculate clicked.');
		});
		
		// Bind to the changes to save the form data
		containers.loan.on('input', saveData);
		containers.payment.on('input', saveData);
		
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
		
		// Add the payment information
		$.tmpl('payment', {
			currency: currency,
			payment: localStorage.payment || 0.00
		}).appendTo(containers.payment);
		
		// Trigger the check for valid data
		checkStatus();
	});
	
	function addLoan(principal, rate, minPayment) {
		var loan = $.tmpl('loan', {
			principal: principal || 0,
			rate: rate || 0.0,
			minPayment: minPayment || 0,
			currency: currency
		});
		
		loan.hide().appendTo(containers.loan).slideDown(slideDuration, function() {
			$('input.delete', loan).click(function(){
				removeLoan(loan);
			});
			
			// Auto focus on the new loan
			$('input[type="number"]:first', loan).focus();
		});
	}
	
	function checkStatus() {
		// Start off with the button disabled
		buttons.calculate.attr('disabled', 'disabled');
		buttons.calculate.va;('Checking for Snow…');
		
		// Check for valid loan data
		var isValid = true;
		var totalPeriodInterest = 0.0;
		var loans = [];
		
		$('.loan', containers.loan).each(function(i, element){
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
		var payment = $('input[name="payment"]', containers.payment).val();
		var paymentContainer = $('.payment', containers.payment);
		
		// If the there is not enough repayment, calculate it
		if(payment < totalPeriodInterest) {
			payment = payment == 0 ? parseFloat((totalPeriodInterest * 1.25).toFixed(2)) : totalPeriodInterest;
			
			$('input[name="payment"]', containers.payment).val(payment);
		} else {
			removeError(paymentContainer);
		}
		
		// Only continue if all loans and payment values are valid
		if(!loans.length || !isValid) {
			buttons.calculate.val('Waiting for Snow…');
			
			return;
		}
		
		buttons.calculate.val('Pack Snowballs!');
		buttons.calculate.removeAttr('disabled');
		
		// Check if the schedule has already been calculated
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
			if(!$('.loan', containers.loan).length) {
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
		
		$('.loan', containers.loan).each(function(i, element){
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
		localStorage.payment = parseFloat($('input[name="payment"]', containers.payment).val()) || 0.0;
		
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
}));
