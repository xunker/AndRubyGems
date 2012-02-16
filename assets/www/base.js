function h2s(hash) {
  var str = [];
  $.each(hash, function(k,v){ str.push(k + ':' + v) });
  return "{ " + str.join(', ') + " }";
}

function seriousError(msg) {
  alert(msg);
  console.log(msg);
}

function basePath() {
  return [apiHost(), apiBasePath()].join('');
}

function apiPath(method) {
  return [basePath(method), method, "?", cacheBuster()].join('');
}

function clientIdentifier() {
  if (typeof device != "undefined") {
    return device.uuid;
  } else {
    return "desktop_testing";
  }
}

function cacheBuster() {
  return ["cache=", (new Date().getTime())].join('');
}

function apiBasePath() { return api_base_path; }
function apiHost() { return api_host; }
function applicationKey() { return application_key; }

function authToken(auth_token) {
  if (isBlank(auth_token)) {
    var auth_token = $.jStorage.get("auth_token");
    if (isBlank(auth_token)) {
      console.log("No auth token found, redirecting to login page");
      sendClientToLoginPage();
    } else {
      console.log("using previously stored auth token " + auth_token);
      return auth_token;
    }
  } else {
    console.log("storing auth_token as " + auth_token);
    return $.jStorage.set("auth_token", auth_token);
  }
}

function userId(user_id) {
  if (isBlank(user_id)) {
    var user_id = $.jStorage.get("user_id");
    if (isBlank(user_id)) {
      console.log("No user_id, redirecting to login page");
      sendClientToLoginPage();
    } else {
      console.log("using previously stored user id " + user_id);
      return user_id;
    }
  } else {
    console.log("storing user_id as " + user_id);
    return $.jStorage.set("user_id", user_id);
  }
}

function userName(user_name) {
  if (isBlank(user_name)) {
    var user_name = $.jStorage.get("user_name");
    if (isBlank(user_name)) {
      console.log("No user_name, redirecting to login page");
      sendClientToLoginPage();
    } else {
      console.log("using previously stored user name " + user_name);
      return user_name;
    }
  } else {
    console.log("storing user_name as " + user_name);
    return $.jStorage.set("user_name", user_name);
  }
}

function userToken(user_token) {
  if (isBlank(user_token)) {
    var user_token = $.jStorage.get("user_token");
    if (isBlank(user_token)) {
      console.log("No user_token, redirecting to login page");
      sendClientToLoginPage();
    } else {
      console.log("using previously stored user token " + user_token);
      return user_token;
    }
  } else {
    console.log("storing user_token as " + user_token);
    return $.jStorage.set("user_token", user_token);
  }
}

function hasUserToken() {
  return !(isBlank($.jStorage.get('user_token')));
}

function clearUserToken() {
  console.log("clearing local storage of user token (if there was one)");
  $.jStorage.deleteKey("user_token");
}

function getNewUserToken(pin) {
  console.log("Requesting new user token for pin");
  apiPost(apiPath('credential/usertoken'), {Pin:pin, ClientIdentifier: clientIdentifier()}, function(json) {
    userToken(json.Token);
  });
}

function isBlank(string) {
  if ((string === null) || (string === undefined) || (string.toString().replace(/ /g,'').length < 1)) {
    return true;
  } else {
    return false;
  }
}

function lastLocation() {
  last_location = $.jStorage.get("last_location");
  if (isBlank(last_location)) {
    return defaultLocation;
  } else {
    return last_location;
  }
}

function setLastLocation(last_location) {
  $.jStorage.set("last_location", last_location);
}

function clearAuthToken() {
  console.log("clearing auth_token (if there was one)");
  $.jStorage.deleteKey('auth_token');
}

function clearLocalStorage() {
  $.jStorage.flush();
}

function sendClientToLoginPage() {
  window.location.href = 'login.html';
}

function apiGet(api_path, get_params, callback_function) {
  console.log("apiGet: path:" + api_path + ' get_params:' + h2s(get_params));
  $.ajax({
    "async" : (typeof(ajax_async) === 'undefined' ? true : ajax_async ),
    "type": "GET",
    "dataType": "json",
    "accepts": "json",
    "url": api_path,
    "data": get_params,
    "success": function(jqXHR, textStatus, errorThrown) {
      console.log("apiGet Success, calling success callback function");
       parseApiCallSuccess(callback_function, jqXHR, textStatus, errorThrown)
     },
    "error": parseApiCallError
  });
}

function apiPost(api_path, post_params, callback_function, method) {
  if (method === undefined) {
    method = "POST";
  }
  console.log("apiPost: " + method + " path:" + api_path + ' post_params:' + h2s(post_params));
  console.log(JSON.stringify( post_params ));
  $.ajax({
    "async" : (typeof(ajax_async) === 'undefined' ? true : ajax_async ),
    "type": method,
    "dataType": "json",
    "contentType": "application/json; charset=utf-8",
    "accepts": "json",
    "traditional": true,
    "url": api_path,
    "data": JSON.stringify( post_params ),
    "success": function(jqXHR, textStatus, errorThrown) {
        console.log("apiPost Success, calling success callback function");
       parseApiCallSuccess(callback_function, jqXHR, textStatus, errorThrown)
     },
    "error": parseApiCallError
  });
}

function parseApiCallSuccess(callback_function, jqXHR, textStatus, errorThrown) {
  console.log("parseApiCallSuccess: " + textStatus);
  console.log(jqXHR);
  // if (jqXHR["ErrorCode"].toString() == "0") {
    callback_function(jqXHR);
  // } else {
    // console.log("Server response indicated an error");
    // console.log(jqXHR);
    // seriousError("Error " + jqXHR["ErrorCode"] + ": " + jqXHR["ErrorMessage"]);
  // }
}

function parseApiCallError(jqXHR, textStatus, errorThrown) {
  console.log("parseApiCallError: " + jqXHR + textStatus + errorThrown);
  console.log(jqXHR);
  console.log(jqXHR.responseText);

  navigator.notification.alert("ERROR:"+textStatus+errorThrown);
}

function handleBackButton() {
  console.log("Handling Back Button");
  if (($($.mobile.activePage).attr('data-previous-page') !== undefined) || ($($.mobile.activePage).attr('data-previous-page') == "")) {
    console.log("going back to " + $($.mobile.activePage).attr('data-previous-page'));
    window.location.href=$($.mobile.activePage).attr('data-previous-page');
  } else {
    console.log('Using default back button behaviour');
    history.back();
  }
}

function handleSearchButton() {
  console.log("Handling Search Button.");
  if (($($.mobile.activePage).attr('data-search-page') !== undefined) || ($($.mobile.activePage).attr('data-search-page') == "")) {
    console.log("going back to " + $($.mobile.activePage).attr('data-search-page'));
    window.location.href=$($.mobile.activePage).attr('data-search-page');
  } else if ($('#default-search-page').length > 0) {
    console.log('sending client to #default-search-page.');
    window.location.href="#default-search-page";
  } else {
    console.log('No search page defined.');
    return false;
  }
}

function currentMenu() {
if (($($.mobile.activePage).attr('data-android-menu') !== undefined) || ($($.mobile.activePage).attr('data-android-menu') == "")) {
    console.log("using specific menu " + $($.mobile.activePage).attr('data-android-menu'));
    return $('#'+$($.mobile.activePage).attr('data-android-menu'));
  } else if ($('#default-android-menu').length > 0) {
    return $('#default-android-menu');
  } else {
    console.log("no menu defined.");
    return undefined;
  }
}

function hideAndroidMenu() {
  var footer = $($.mobile.activePage).find('div[data-role=footer]').first();
  var header = $($.mobile.activePage).find('div[data-role=header]').first();
  var menu = currentMenu();

  if ((menu == undefined) || (menu.is(":hidden"))) { return false; }

  console.log('hiding android menu');
  menu.find('.box').first().show(500,function(){
    menu.fadeOut('fast');
  });
  if (footer !== undefined) {
    console.log('showing footer');
    footer.show();
  } else {
    console.log('no footer to show');
  }

  if (header !== undefined) {
    console.log('showing header');
    header.slideDown();
  } else {
    console.log('no header to show');
  }
}

function showAndroidMenu() {
  var footer = $($.mobile.activePage).find('div[data-role=footer]').first();
  var header = $($.mobile.activePage).find('div[data-role=header]').first();
  var menu = currentMenu();

  if ((menu == undefined) || (!menu.is(":hidden"))) { return false; }

  if (footer !== undefined) {
    console.log('hiding footer');
    footer.hide();
  } else {
    console.log('no footer to hide');
  }

  if (header !== undefined) {
    console.log('hiding header');
    header.slideUp();
  } else {
    console.log('no header to hide');
  }

  console.log('showing android menu');
  menu.fadeIn('fast',function(){
    menu.find('.box').first().show();
  });
}

function handleMenuButton () {
  console.log('Handling Menu Button');
  var menu = currentMenu();

  if (menu == undefined) { return false; };


  if (menu.is(":hidden")) {
    showAndroidMenu();
  } else {
    hideAndroidMenu();
  }

}

function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}


// replaced onBodyLoad
function assimilate () {
  document.addEventListener("deviceready", onDeviceReady, false);
}

var phoneGapLoaded = false;
var phoneGapAvailable = true;
setTimeout("if (phoneGapLoaded == false) { phoneGapAvailable = false; onDeviceReady(); }", 3000);

function onDeviceReady() {

  if (phoneGapAvailable == true) {
    document.addEventListener("backbutton", handleBackButton, false);
    document.addEventListener("searchbutton", handleSearchButton, false);
    document.addEventListener("menubutton", handleMenuButton, false);
  }

  phoneGapLoaded = true;

  if(typeof onPageReady == 'function') {
    onPageReady();
  }

}
