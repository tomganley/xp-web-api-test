function createPosApiUrl(fallbackUrl, webCallbackUri, clientId, totalAmount, note, state, locationId, customerId, selectedTenderTypes, currencyCode) {
	var os = getMobileOperatingSystem()
	if (os === 'Android') {
		return createAndroidPosApiUrl(fallbackUrl, webCallbackUri, clientId, totalAmount, note, state, locationId, customerId, selectedTenderTypes, currencyCode)
	} else if (os === 'iOS') {
		return createiOSPosApiUrl(fallbackUrl, webCallbackUri, clientId, totalAmount, note, state, locationId, customerId, selectedTenderTypes, currencyCode)
	} else {
		// TODO What to do on other platforms? Act like app not installed?
		return fallbackUrl
	}
}

function createAndroidPosApiUrl(fallbackUrl, webCallbackUri, clientId, totalAmount, note, state, locationId, customerId, selectedTenderTypes, currencyCode) {	
	// auto return always turned on for PaySdk, there's little value in providing this option.
	var autoReturnTimeoutMs = 2000
	var apiVersion = 'v2.0'
	
	var target = 'intent:#Intent;action=com.squareup.pos.action.CHARGE;';
	
	target += 'package=com.squareup;';

    if(notBlank(fallbackUrl)) {
    	target += 'S.browser_fallback_url=' + fallbackUrl + ';';
    }

    if(notBlank(webCallbackUri)) {
    	target += 'S.com.squareup.pos.WEB_CALLBACK_URI=' + webCallbackUri + ';';
	}

    if(notBlank(clientId)) {
    	target += 'S.com.squareup.pos.CLIENT_ID=' + clientId + ';';
	}

    target += 'S.com.squareup.pos.API_VERSION=' + apiVersion + ';';

    if(notBlank(totalAmount)) {
    	target += 'i.com.squareup.pos.TOTAL_AMOUNT=' + totalAmount + ';';
	}
	
    if(notBlank(currencyCode)) {
    	target += 'S.com.squareup.pos.CURRENCY_CODE=' + currencyCode + ';';
	}

    if(notBlank(note)) {
    	target += 'S.com.squareup.pos.NOTE=' + note + ';';
	}
	
	if (selectedTenderTypes.length > 0) {
		var apiTenderTypes = [];
		for (var i = 0; i < selectedTenderTypes.length; i++) {
			switch(selectedTenderTypes[i]) {
			case 'CARD':
				apiTenderTypes[apiTenderTypes.length] = 'com.squareup.pos.TENDER_CARD'
				break;
			case 'CARD_ON_FILE':
				apiTenderTypes[apiTenderTypes.length] = 'com.squareup.pos.TENDER_CARD_ON_FILE'
				break;
			case 'CASH':
				apiTenderTypes[apiTenderTypes.length] = 'com.squareup.pos.TENDER_CASH'
				break;
			case 'OTHER':
				apiTenderTypes[apiTenderTypes.length] = 'com.squareup.pos.TENDER_OTHER'
				break;
			}
		}
		target += 'S.com.squareup.pos.TENDER_TYPES=' + apiTenderTypes.join() + ';';
	}

   	target += 'S.com.squareup.pos.AUTO_RETURN_TIMEOUT_MS=' + autoReturnTimeoutMs + ';';

    if(notBlank(state)) {
    	target += 'S.com.squareup.pos.REQUEST_METADATA=' + state + ';';
	}

    if(notBlank(locationId)) {
    	target += 'S.com.squareup.pos.LOCATION_ID=' + locationId + ';';
	}

    if(notBlank(customerId)) {
    	target += 'S.com.squareup.pos.CUSTOMER_ID=' + customerId + ';';
	}

	target += 'end';
	return target;
}

function createiOSPosApiUrl(fallbackUrl, webCallbackUri, clientId, totalAmount, note, state, locationId, customerId, selectedTenderTypes, currencyCode) {	
	var target = 'square-commerce-v1://payment/create?data=';
	
	var dataParameter = {};

	if(notBlank(webCallbackUri)) {
		dataParameter.callback_url = webCallbackUri;
	}

	if(notBlank(clientId)) {
		dataParameter.client_id = clientId;
	}

	dataParameter.version = '1.3'

	var amount_money = {}
	if(notBlank(totalAmount)) {
		amount_money.amount = totalAmount;
	}
	
	if(notBlank(currencyCode)) {
		amount_money.currency_code = currencyCode;
	}

	dataParameter.amount_money = amount_money;

	if(notBlank(note)) {
		dataParameter.notes = note;
	}


	options = {};
	
	// auto return always turned on for PaySdk, there's little value in providing this option.
	options['auto_return'] = true
	
	// Feature not available yet in POS API Android
	options['skip_receipt'] = false
	
	// This should just be the default behavior for both Android and iOS (decision made to always clear taxes in PaySDK)
	options['clear_default_fees'] = true
	
	var apiTenderTypes = [];
	if (selectedTenderTypes.length > 0) {
		for (var i = 0; i < selectedTenderTypes.length; i++) {
			switch(selectedTenderTypes[i]) {
			case 'CARD':
				// Android bundles the two. iOS can have card without gift card, but not the other way round.
				apiTenderTypes[apiTenderTypes.length] = 'CREDIT_CARD'
				apiTenderTypes[apiTenderTypes.length] = 'SQUARE_GIFT_CARD'
				break;
			case 'CARD_ON_FILE':
				apiTenderTypes[apiTenderTypes.length] = 'CARD_ON_FILE'
				break;
			case 'CASH':
				apiTenderTypes[apiTenderTypes.length] = 'CASH'
				break;
			case 'OTHER':
				apiTenderTypes[apiTenderTypes.length] = 'OTHER'
				break;
			}
		}
	}

	options.supported_tender_types = apiTenderTypes;

	dataParameter.options = options;

	if(notBlank(state)) {
		dataParameter.state = state;
	}

	if(notBlank(locationId)) {
		dataParameter.location_id = locationId;
	}

	if(notBlank(customerId)) {
		dataParameter.customer_id = customerId;
	}

	target += encodeURIComponent(JSON.stringify(dataParameter));
		
	return target;
}


/**
 * Source: https://stackoverflow.com/a/21742107
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
  
 	// Uncomment these for testing.
	//return 'Android'
	//return 'iOS'
	
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}