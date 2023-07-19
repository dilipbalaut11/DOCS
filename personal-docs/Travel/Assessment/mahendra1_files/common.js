function processKeyDown(theEventData) {
    var preventKeyPress;
    if (theEventData.keyCode == 8) {
        var theSender = theEventData.srcElement || theEventData.target;
        switch (theSender.tagName.toUpperCase()) {
            case 'TEXTAREA':
                preventKeyPress = theSender.readOnly || theSender.disabled;
                break;
            case 'INPUT':
                preventKeyPress = theSender.readOnly || theSender.disabled ||
                    (theSender.attributes["type"] && $.inArray(theSender.attributes["type"].value.toLowerCase(), ["radio", "checkbox", "submit", "button"]) >= 0);
                break;
            case 'DIV':
                preventKeyPress = theSender.readOnly || theSender.disabled || !(theSender.attributes["contentEditable"] && theSender.attributes["contentEditable"].value == "true");
                break;
            default:
                preventKeyPress = true;
                break;
        }
    } else {
        preventKeyPress = false;
    }

    if (preventKeyPress) {
        theEventData.preventDefault();
    }
}

var _topWin = null, _mainWin = null;

function OpenWindow(url, target, features) {
    if (target && features) {
        window.open(url, target, features);
    } else if (target) {
        window.open(url, target);
    }
    else {
        window.open(url);
    }
}

function windowTop() {
    var CurrentTopWindow = null;

    if (_topWin != null) {
        CurrentTopWindow = _topWin;
    }
    else {
        var ParentWindow = window;
        while (true) {
            if (ParentWindow != null) {
                if (ParentWindow.frames != null && ParentWindow.frames.length > 0) {
                    if (checkMetaTags(ParentWindow)) {
                        CurrentTopWindow = ParentWindow;
                    }
                }
                if (ParentWindow == window.top) {
                    if (checkMetaTags(ParentWindow)) {
                        CurrentTopWindow = ParentWindow;
                    }
                    break;
                }

                ParentWindow = ParentWindow.parent;
            }
            else {
                ParentWindow = window.parent;
            }
        }
    }
    return CurrentTopWindow;
}
function windowMain() {
    var win, winTop;
    if (!isSameOrigin(_mainWin)) _mainWin = null;
    if (_mainWin != null)
        win = _mainWin;
    else {
        winTop = windowTop();
        if (winTop)
            win = winTop;
        else
            win = window.parent;

        var attempts = 0;
        while (win && attempts < 20) {
            attempts++;
            try {
                if (win.name == 'Default.aspx' && checkMetaTags(win))
                    break;
            }
            catch (e) { }
            if (win.opener && win.opener != win)
                win = win.opener;
            else if (win.parent && (win.parent != win))
                win = win.parent;
            else
                break;
        }
    }
    if (!_mainWin) _mainWin = win;
    return win;
}
function isSameOrigin(obj) {
    if (!(obj instanceof Window)) return false;
    var result;
    try {
        result = obj.location.href !== undefined;
    } catch (e) {
        result = false;
    }
    return result;
}
_topWin = windowTop();
_mainWin = windowMain();

var _eeid;
var _coid;
var _role;
var _prodKey;
var _pageName;
var _childWindow;

var keepAliveIntervalId, keepAliveInterval = 60 * 1000;

function launchChildWindow(pageName, prodKey, eeid, coid, role) {
    _eeid = eeid;
    _coid = coid;
    _role = role;
    _prodKey = prodKey;
    _pageName = pageName;
    _childWindow = null;
    var _rootVD = GlobalVars["RootVD"];
    if (!_rootVD)
        log.add('Application virtual root variable not found.');
    else
        _childWindow = open(_rootVD + '/DefaultChild.aspx?pageName=' + _pageName + '&prodKey=' + _prodKey);
}

//  Given a select element and text, will select that item of text 
//  If the text is not found, the prior selection will remain
function setSelectByText(selectElem, text) {
    for (var ii = 0; ii < selectElem.options.length; ii++) {
        if (selectElem.options[ii].text == text) {
            selectElem.selectedIndex = ii;
            break;
        }
    }
}

var PageVars = {};
var _numParams = 0;

// Retrieves a hidden field _USPARAMS, delimited as key=value!key1=value1!...
// and stores pairs in associative array PageVars
function buildParametersArrayFromUSParams() {
    var uniquePrefix = GlobalVars["ClientID"] + "_";
    var rawParams = document.getElementById(uniquePrefix + "_USPARAMS");
    var keyVals = rawParams.value.split("!");
    _numParams = keyVals.length;

    for (var ii = 0; ii < keyVals.length; ii++) {
        var indx = keyVals[ii].indexOf("=");
        var key = keyVals[ii].substring(0, indx);
        if (key == "") {
            _numParams--;
            continue;
        }
        var value = keyVals[ii].substr(indx + 1);
        // temp hack for help system for aug release.
        try {
            if ((key == "PK" || key == "pk") && WindowManager)
                WindowManager.productKey = value;
        }
        catch (err) { }
        var ppp = new String();
        PageVars[key] = value;
    }
    if (typeof WindowManager != 'undefined' && WindowManager != 'undefined' && WindowManager) {
        if (typeof PageVars["country"] != 'undefined' && PageVars["country"] != 'undefined' && PageVars["country"] != null) {
            WindowManager.country = PageVars["country"];
        }
        else {
            var countryHidden = document.getElementById(uniquePrefix + "_countryHidden");
            WindowManager.country = countryHidden.value;
        }
    }
}

// Retrieves the querystring and
// and stores pairs in associative array PageVars
function buildParametersArray() {
    var query = window.location.search;
    query = query.replace("?", "");
    var keyVals = query.split("&");
    _numParams = keyVals.length;
    for (var ii = 0; ii < keyVals.length; ii++) {
        var indx = keyVals[ii].indexOf("=");
        var key = keyVals[ii].substring(0, indx);
        if (key == "") {
            _numParams--;
            continue;
        }
        var value = keyVals[ii].substr(indx + 1);
        PageVars[key] = value;
    }
}

function insertParameterToQueryString(queryString, key, value) {
    key = encodeURIComponent(key); value = encodeURIComponent(value);

    var kvp = queryString.split('&');

    var i = kvp.length; var x; while (i--) {
        x = kvp[i].split('=');

        if (x[0] == key) {
            x[1] = value;
            kvp[i] = x.join('=');
            break;
        }
    }

    if (i < 0) { kvp[kvp.length] = [key, value].join('='); }

    return kvp.join('&');
}

// Before page exits, invoke this method to flatten PageVars and pass 
// it through the query-string
function buildQueryString() {
    var queryString = "?USParams=";
    queryString = queryString + buildQueryStringParams();
    return queryString;
}

function buildQueryStringParams(keysToIgnoreArray) {
    var params = "";
    for (var i = 0; keysToIgnoreArray && i < keysToIgnoreArray.length; i++) {
        delete PageVars[keysToIgnoreArray[i]];
    }

    for (key in PageVars) {
        if (key == "") continue;
        params = params + key + "=" + PageVars[key] + "!";
    }

    return params;
}

// Call this function from a link in the popup to link to another page with USParams.
function pageLink(pageName, pageType) {
    var query = buildQueryString();
    var url = GlobalVars['RootVD'] + '/pages/' + pageType + '/' + pageName + '.aspx' + query;
    //document.write(url);
    document.location = url;
}

// Call this function from a link in the popup to link to another page with USParams.
// Works without pageType param, but user must provide path of desired page
function pageLink(pageName) {
    var query = buildQueryString();
    // Only append a forward slash if the pageName 
    // doesn't have a leading slash
    var slash = pageName && pageName.charAt(0) == '/' ? "" : "/";
    var url = GlobalVars['RootVD'] + slash + pageName + query;
    document.location = url;
}

// Call this function from a link in the popup to link to another page with USParams.
// paramString is of format: "param1=val1&param2=val2&..." or "param1=val!param1=
function pageLinkWithParamString(pageName, pageType, paramString) {
    // First, replace '&' with '!' (gives option of passing more traditional delimiter)
    var re = new RegExp(/&/g);
    paramString = paramString.replace(re, '!');
    var query = buildQueryString();
    if (query != '?USParams=')
        query += '!';
    query += paramString;
    var url = GlobalVars['RootVD'] + '/pages/' + pageType + '/' + pageName + '.aspx' + query;
    document.location = url;
}

// Call this function from a link in the popup to link to another page with USParams.
// Works without pageType param, but user must provide relative path of desired page
// paramString is of format: "param1=val1&param2=val2&..." or "param1=val!param1=
// Passing in the optional 3rd parameter tells method if
// Master.Parameters should be sent along
function pageLinkWithParams(pageName, paramString, useMasterParams, label, remember) {
    // First, replace '&' with '!' (gives option of passing more traditional delimiter)
    var re = new RegExp(/&/g);
    paramString = paramString.replace(re, '!');

    // LP New code to break master params cycle
    var useMParams = (useMasterParams == null ? true : useMasterParams);
    var query = "";
    if (useMParams) {
        query = buildQueryString();
        if (query != '?USParams=')
            query += '!';
        query += paramString;
    } else {
        query = "?USParams=" + paramString;
    }

    var encBackSlash = '&#47;';
    pageName = replaceAll(pageName, encBackSlash, '/');

    // Only append a forward slash if the pageName 
    // doesn't have a leading slash
    var slash = pageName && pageName.charAt(0) == '/' ? "" : "/";
    var url = GlobalVars['RootVD'] + slash + pageName + query;

    if (windowTop().globalMenu) {
        setTimeout(function () {
            document.location = url;
        }, 0) // Execute at end of node cycle as Univied nav function is async, to assure proper load
    } else {
        document.location = url;
    }

    if (remember)
        rememberLink(label, pageName + query);
}

function rememberLink(label, url, divId, menuId, tabId) {
    if (url.indexOf("pageName=DefaultChild.aspx") == -1) {
        $.ajax({
            url: GlobalVars['RootVD'] + "/services/JsonService.asmx/CurrentUserRecentlyVisitedThisLink",
            data: "{ url: '" + url + "', label: '" + label + "', divId: '" + divId + "', menuId: '" + menuId + "', tabId: '" + tabId + "' }",
            dataType: "json",
            type: "POST",
            contentType: "application/json; charset=utf-8"
        });
    }
}

function recentlyVisitedSelect(url, divId, menuId, tabId, hideDivider, isExternalUrl, label, remember) {

    if (url.indexOf('eeDirectoryDetail') > -1 && divId == '' && menuId == '' && tabId == '') {
        windowTop().showMenu(url, 62, 150, undefined, hideDivider, isExternalUrl, label, remember);
    }
    else {
        windowTop().showMenu(url, divId, menuId, tabId, hideDivider, isExternalUrl, label, remember);
    }
}

function replaceAll(txt, replace, with_this) {
    return txt.replace(new RegExp(replace, 'g'), with_this);
}

/*
* CHILD/MODAL WINDOW CALLBACK FUNCTIONS
*/
function notePopupCallBack(returnVal) {
    document.getElementById(globalHiddenID).value = returnVal.Notes;
    if (returnVal.Notes != '') {
        document.getElementById('img_' + globalHiddenID).src = '/WebTestHarness/images/opennote.gif';
    }
    else {
        document.getElementById('img_' + globalHiddenID).src = '/WebTestHarness/images/notes.gif';
    }
}

// TODO:  LP is this safe for localization?
function stripTime(date) {
    return new Date(date.toDateString());
}

// helper function
function postOrNot(returnVal) {
    $('#aspnetForm').submit(function (evt) {
        if (!returnVal) {
            evt.stopPropagation();
            evt.preventDefault();
        }
    });
}

function getControl(SpanID) {
    var ctrl = GlobalVars["ClientID"] + "_" + SpanID;
    var x = document.getElementById(ctrl);
    if (x != null && x.tagname == "SPAN") {
        return x.children[0];
    } else if (x != null) {
        return x;
    }
}

function showHide(checkID, trID, defaultState, isNamedControl) {
    postOrNot(false);
    var identity = null;
    var checker = null;
    if (isNamedControl == true) {
        identity = document.getElementById(trID);
        checker = document.getElementById(checkID);
    }
    else {
        identity = getControl(trID);
        checker = getControl(checkID);
    }
    var defaultString = null;
    if (defaultState == true) {
        defaultString == true;
    }
    else {
        defaultString == false;
    }
    if (defaultState == true) {
        if (checker.checked == true) {
            identity.className = '';
        }
        else {
            identity.className = 'hide';
        }
    }
    else {
        if (checker.checked == false) {
            identity.className = '';
        }
        else {
            identity.className = 'hide';
        }
    }
    postOrNot(true);
}

function toggleHideInput(elemID) {
    postOrNot(false);
    var elem = document.getElementById(elemID);
    elem.className = elem.className == "hide" ? "" : "hide";
}

// By assigning this method to the onkeypress method of 
// a text field, you can restrict the entry to digit fields only
function allowDigitsOnly(e) {
    var evt = e || window.event;
    var key = typeof evt.which !== 'undefined' ? evt.which : evt.keyCode;
    var str = String.fromCharCode(key);
    if (str.match(/\D/)) {
        cancelEvent(evt);
    }
}

// Object to encapsulate common functions
var USGCommon = new Object();

USGCommon.allowDigitsOnly = function (evt) {
    var key = typeof evt.which !== 'undefined' ? evt.which : evt.keyCode;
    var str = String.fromCharCode(key);
    if (str.match(/\D/) && !str.match(/[\b]/)) {
        cancelEvent(evt);
    }
}

USGCommon.prohibitNegativeInput = function (evt) {
    var key = typeof evt.which !== 'undefined' ? evt.which : evt.keyCode;
    var str = String.fromCharCode(key);
    if (str == "-" || str == '(' || str == ')') {
        cancelEvent(evt);
    }
}

// Global Functions
function IsNullOrEmpty(string) {
    return string == null || string == "";
}

function cancelEvent(evt) {
    var ev = new USGEvent(evt)
    ev.cancelBubble();
}

USGCommon.isNullOrEmpty = IsNullOrEmpty;

USGCommon.format = function (msg, paramsArray) {
    for (var ii = 0; ii < paramsArray.length; ++ii) {
        var str = '{' + ii + '}';
        msg = msg.replace(str, paramsArray[ii]);
    }
    return msg;
}

USGCommon.nullFunction = function () { }

// Globally used object types:
function Style() {
    this.Mask;
    this.Alias;
    this.Symbol;
    this.PositivePattern;
    this.NegativePattern;
    this.DecimalSeparator;
    this.GroupSeparator;
}

Style.prototype.IsNumeric = function () {
    return (this.Type == "decimal" ||
        this.Type == "numeric" ||
        this.Type == "currency" ||
        this.Type == "percent");
};

String.prototype.padLeft = function (totalLen, paddingChar) {
    /// <summary>
    /// Right-aligns the characters in this instance, padding on the left with a specific Unicode character for a specific total length.
    /// </summary>
    /// <param name="totalLen">The total length after padding.</param>
    /// <param name="paddingChar">The character used to pad with.</param>
    var padChar = paddingChar.split('')[0], pad = [];
    for (var i = 0; i < totalLen; i++) {
        pad[i] = padChar;
    }
    return (pad.join('') + this).slice(-totalLen);
};

String.prototype.padRight = function (totalLen, paddingChar) {
    /// <summary>
    /// Left-align the characters in this string, padding on the right with a specific Unicode character, for a specified total length.
    /// </summary>
    /// <param name="totalLen">The total length after padding.</param>
    /// <param name="paddingChar">The character used to pad with.</param>
    var padChar = paddingChar.split('')[0], pad = [];
    for (var i = 0; i < totalLen - this.length; i++) {
        pad[i] = padChar;
    }
    return this + pad.join('');
};

var US_DECIMAL = ".";

// Performs Banker's rounding algorith.
function UltiMath_GaussianRound(number) {
    var absolute = Math.abs(number);
    absolute = absolute.toFixed(10); // Fixes issue where numbers 8 and greater were coming back with js floating point bug (8.005 rounded to 8.01 instead of 8.00)
    var sign = number == 0 ? 0 : (number < 0 ? -1 : 1);
    var floored = Math.floor(absolute);
    if (absolute - floored != 0.5) {
        return Math.round(absolute) * sign;
    }
    if (floored % 2 == 1) {
        // Closest even is up.
        return Math.ceil(absolute) * sign;
    }
    // Closest even is down.
    return floored * sign;
}

// Takes a number and the number of decimal places to round to
function UltiMath_Round(number, decimalPlaces, decimalChar) {
    var strnum = number + ""; // number in string context

    // Pad the decimal so it formats to the right value
    var decPos = strnum.lastIndexOf(decimalChar);
    var rhs = strnum.substring(decPos + 1);

    for (var ii = rhs.length; ii < decimalPlaces; ++ii) {
        rhs += "0";
    }

    var newnum = (0 + number) * Math.pow(10, decimalPlaces);

    strnum = newnum + "";
    newnum = UltiMath_GaussianRound(strnum);
    newnum = newnum / Math.pow(10, decimalPlaces);

    //pad decimal after
    var lhs = (newnum >= 0) ? Math.floor(newnum) : Math.ceil(number);
    strnum = newnum + "";
    decPos = strnum.lastIndexOf(decimalChar)
    rhs = decPos == -1 ? "" : strnum.substring(decPos + 1);

    for (var ii = rhs.length; ii < decimalPlaces; ++ii) {
        rhs += "0";
    }

    strnum = Math.abs(lhs) + decimalChar + rhs;
    if (number < 0 && parseFloat(strnum) != 0)
        strnum = "-" + strnum;

    return strnum;
}

// Encapsulate into UltiMath object
function UltiMath() { }
UltiMath.Round = UltiMath_Round;

/*********************************
*   BEGIN OF LIGHTBOX CODE        *
*********************************/
function addEvent(obj, evType, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evType, fn, false);
        return true;
    } else if (obj.attachEvent) {
        var r = obj.attachEvent("on" + evType, fn);
        return r;
    } else {
        return false;
    }
}
function removeEvent(obj, evType, fn, useCapture) {
    if (obj.removeEventListener) {
        obj.removeEventListener(evType, fn, useCapture);
        return true;
    } else if (obj.detachEvent) {
        var r = obj.detachEvent("on" + evType, fn);
        return r;
    } else {
        alert("Handler could not be removed");
    }
}

function getViewportHeight() {
    if (window.innerHeight != window.undefined) return window.innerHeight;
    if (document.compatMode == 'CSS1Compat') return document.documentElement.clientHeight;
    if (document.body) return document.body.clientHeight;
    return window.undefined;
}
function getViewportWidth() {
    if (window.innerWidth != window.undefined) return window.innerWidth;
    if (document.compatMode == 'CSS1Compat') return document.documentElement.clientWidth;
    if (document.body) return document.body.clientWidth;
    return window.undefined;
}

/*********************************
*   END OF LIGHTBOX CODE        *
*********************************/

/** copyright with current date function*/
function fnCopyright() {
    var dt = new Date();
    var strYear = dt.getYear();
    window.status = "Copyright 1997-" + strYear + ". The Ultimate Software Group, Inc. All rights reserved.";
}


/** Method to turn an editable page into a readonly page.
Note* -Does not remove any of the top buttons, just modifies the form controls
-Some controls may remain in the DOM but are hidden from view.
-Has been tested in IE6 and FireFox 1.5
-Has not been tested on radio buttons yet
            
-Now added a parameter so that the user can input an array of controls that they want protected
-Use Example
var ArrayOfProtected = new Array();
ArrayOfProtected[getControl("FormView1_cbEmployeeCandDeclinePlan").id] = "true";
makeAllFormElementsReadOnly(ArrayOfProtected);

**/
function makeAllFormElementsReadOnly(ArrayOfProtected) {
    //Loop incase the page has multiple forms
    for (var numForms = 0; numForms < document.forms.length; numForms++) {
        if (ArrayOfProtected == null)
            ArrayOfProtected = new Array();
        //debugger;
        var el = document.forms[numForms].elements;
        //check all inputs
        el = document.forms[numForms].getElementsByTagName('input');
        for (var i = 0; i < el.length; i++) {
            if (ArrayOfProtected[el[i].id] == null) {
                switch (el[i].type.toUpperCase()) {
                    case "HIDDEN":
                        break;
                    case "TEXT":   //For text hides the current TB and creates a new node with text only
                        var oTextNode = document.createTextNode(el[i].value);
                        el[i].parentNode.insertBefore(oTextNode, el[i]);
                        el[i].className = "hide";
                        break;
                    case "CHECKBOX":
                        $(el[i]).unbind('click mousedown change');
                        el[i].className = "disabled";
                        break;
                    case "RADIO":
                        el[i].className = "disabled";
                        break;
                    case "IMAGE":
                        if (el[i].src.indexOf('calendar') > -1 || el[i].src.indexOf('localizeShow') > -1)
                            el[i].className = "hide";
                        break;
                    default:
                        break;
                }
            }
        }

        //Check All selects
        el = document.forms[numForms].getElementsByTagName('select');
        for (var i = 0; i < el.length; i++) {
            if (ArrayOfProtected[el[i].id] == null) {
                if (el[i].size && el[i].size > 1) {
                    el[i].className = "hide";
                    var newSelectBox = "";

                    for (var x = 0; x < el[i].options.length; x++) {
                        newSelectBox += el[i].options[x].text + ",";
                    }
                    newSelectBox = newSelectBox.substring(0, newSelectBox.length - 1);

                    el[i].parentNode.innerHTML = newSelectBox;
                    el[i].className = "hide";
                }
                else {
                    if (el[i].selectedIndex != -1)
                        el[i].parentNode.innerHTML = "<div class=\"hide\">" + el[i].parentNode.innerHTML + "</div>" + el[i].options[el[i].selectedIndex].text;
                    else
                        el[i].parentNode.innerHTML == "<div class=\"hide\">" + el[i].parentNode.innerHTML + "</div>";
                }
            }
        }

        //Check All Textareas
        el = document.forms[numForms].getElementsByTagName('textarea');
        for (var i = 0; i < el.length; i++) {
            if (ArrayOfProtected[el[i].id] == null) {
                var oTextNode = document.createTextNode(el[i].value);
                el[i].parentNode.insertBefore(oTextNode, el[i]);
                el[i].className = "hide";
                break;
            }
        }

        //Replace all required gifs
        el = document.forms[numForms].getElementsByTagName('td');
        for (var i = 0; i < el.length; i++) {
            if (el[i].className == "required" && ArrayOfProtected[el[i].id] == null)
                el[i].className = "";
        }


        el = document.forms[numForms].getElementsByTagName('img');
        for (var i = 0; i < el.length; i++) {
            if (el[i].src.indexOf('resetlargeList') != -1 && ArrayOfProtected[el[i].id] == null)
                el[i].className = "hide";
        }

        el = document.forms[numForms].getElementsByTagName('span');
        for (var i = 0; i < el.length; i++) {
            if (el[i].className == 'dateContainer' && ArrayOfProtected[el[i].id] == null)
                el[i].className = "";
        }

    }

    $.each(USGDates, function (prop, date) {
        date.disable(true);
    });

    if (window.fCustomReadOnly)
        window.fCustomReadOnly();
}


/** method to resize content iframe to content of page**/
function iFrameHeight() {
    if (document.getElementById && !(document.all)) {
        iHeight = document.getElementById('ContentFrame').contentDocument.body.scrollHeight;
        document.getElementById('ContentFrame').style.height = iHeight + "px";
    }
    else if (document.all) {
        iHeight = document.frames('ContentFrame').document.body.scrollHeight;
        document.all.ContentFrame.style.height = iHeight + "px";
    }
}

/** function for trimming leading and trailing spaces from strings **/
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

/** function for removing whitespace from a string **/
function removeWhitespace(str) {
    str = str.replace(/\r/g, " ");
    str = str.replace(/[^ A-Za-z0-9`~!@#\$%\^&\*\(\)-_=\+\\\|\]\[\}\{'";:\?\/\.>,<]/g, "");
    str = str.replace(/'/g, "");
    str = str.replace(/ +/g, " ");
    str = str.replace(/^\s/g, "");
    str = str.replace(/\s$/g, "");
    if (str == ' ') { str = '' };

    return str;
}

/** function that returns a string Array of keys and values (Array[key] = value) for
a passed string delimited as key=value!key1=value1!... **/
function buildArrayFromKeyValueString(rawParams) {
    if (!rawParams || rawParams == "") return null;

    var paramArray = {};
    var keyVals = rawParams.split("!");
    _numParams = keyVals.length;

    for (var ii = 0; ii < keyVals.length; ii++) {
        var indx = keyVals[ii].indexOf("=");
        var key = keyVals[ii].substring(0, indx);
        if (key == "") {
            _numParams--;
            continue;
        }
        var value = keyVals[ii].substr(indx + 1);

        paramArray[key] = value;
    }

    return paramArray;
}


/* function to toggle CSS classes on an item */
function toggleClass(id, classOne, classTwo) {
    identity = document.getElementById(id);
    if (identity.className == classTwo) {
        identity.className = classOne;
    }
    else {
        identity.className = classTwo;
    }
}

function toggleClassNew(id, classOne, classTwo, tagType) {
    identity = $(tagType + "[id$='" + id + "']");

    identity.toggleClass(classOne);
    identity.toggleClass(classTwo);
}


function keypressInputCapitalLettersAndNumbers(e, ctrl) {
    keydownInputCapitalLettersAndNumbers(e, ctrl);
}

/* 
Depricated - keydownInputCapitalLettersAndNumbers only be called with the keypress event regardless of the methods actual name
Instead call keypressInputCapitalLettersAndNumbers with keypress
*/
function keydownInputCapitalLettersAndNumbers(e, ctrl) {
    var evt = e || window.event;
    var key = (typeof evt.which !== 'undefined') ? evt.which : evt.keyCode;
    var sft = evt.shiftKey;


    if (((key > 47 && key < 58) || key == 8 || key == 9 || key == 127 || key == 0) && !sft) {
        return true;
    }
    else if ((key > 64 && key < 91) || (key >= 97 && key <= 122)) {
        if (key >= 97 && key <= 122) {
            if (e) {
                e.preventDefault();
                var pos = e.currentTarget.selectionStart;
                var code = e.charCode - 32;
                var str = ctrl.value;

                ctrl.value = (str.substring(0, pos) + String.fromCharCode(code) + str.substring(pos, str.length));
                ctrl.selectionStart = pos + 1;
                ctrl.selectionEnd = pos + 1;
            }
            else {
                window.event.keyCode -= 32;
            }
        }
        return true;
    }
    else {
        if (e) {
            evt.stopPropagation();
            evt.preventDefault();
        }
        else {
            evt.cancelBubble = true;
            evt.returnValue = false;
            return false;
        }
    }
}

function keypressInputNumbersOnly(e) {
    keydownInputNumbersOnly(e)
}

/* 
Depricated - keydownInputNumbersOnly only be called with the keypress event regardless of the methods actual name
Instead call keypressInputNumbersOnly with keypress
*/
function keydownInputNumbersOnly(e) {
    var evt = e || window.event;
    var key = (typeof evt.which !== 'undefined') ? evt.which : evt.keyCode;
    var sft = evt.shiftKey;


    if (((key > 47 && key < 58) || key == 8 || key == 9 || key == 127 || key == 0) && !sft) {
        return true;
    }
    else {
        if (e) {
            evt.stopPropagation();
            evt.preventDefault();
        }
        else {
            evt.cancelBubble = true;
            evt.returnValue = false;
            return false;
        }
    }
}

function hoverText(id) {
    identity = document.getElementById(id);

    if (identity.className == "hide")
        identity.className = "hoverMenu";
    else
        identity.className = "hide";
}

function setIFrameSizeToContentSize(frameId) {
    var frame = document.getElementById(frameId);
    var getFFVersion = navigator.userAgent.substring(navigator.userAgent.indexOf("Firefox")).split("/")[1];
    var FFextraHeight = parseFloat(getFFVersion) >= 0.1 ? 16 : 0; //extra height in px to add to iframe in FireFox 1.0+ browser

    var height = 0;
    if (frame.contentDocument && frame.contentDocument.body.offsetHeight) { //ns6 syntax
        height = frame.contentDocument.body.offsetHeight + FFextraHeight;
    } else if (frame.Document && frame.Document.body.scrollHeight) {//ie5+ syntax
        height = frame.Document.body.scrollHeight;
    }
    //sometimes in IE, the height comes back as 0. This appears to be a timing issue.
    //if it comes back as 0, then don't condense the box.
    if (height > 0 && height < 200) {
        frame.style.height = height + 'px';
    }
}

function updateParentShowInbox(inboxNumber) {
    var frames;
    var contentFrame;
    var inboxType;

    switch (inboxNumber) {
        case 1:
            inboxType = 'todo';
            break;
        case 2:
            inboxType = 'pending';
            break;
        case 3:
            inboxType = 'inprogress';
            break;
        default:
            inboxType = 'todo';
            break;
    }

    if (top.opener) {
        do {
            topmostopener = top.opener;
        } while (topmostopener.opener);

        frames = top.opener.document.getElementsByName("ContentFrame");
        if (frames.length > 0) {
            contentFrame = frames[0];
            contentFrame.src = 'pages/VIEW/EeRequestInbox.aspx?USParams=PK=CORE!MenuID=74!Type=' + inboxType;
            top.opener.focus();
        }
    }
    else {
        frames = this.parent.document.getElementsByName("ContentFrame");
        if (frames.length > 0) {
            contentFrame = frames[0];
            contentFrame.src = 'pages/VIEW/EeRequestInbox.aspx?USParams=PK=CORE!MenuID=74!Type=' + inboxType;
        }
    }
}

function upperCase(x) {
    var y = document.getElementById(x).value;
    document.getElementById(x).value = y.toUpperCase();
}

function upperCaseAndAlphaNumeric(x) {
    var fmt = new AlphaNumericFormatter();
    var y = document.getElementById(x).value;
    document.getElementById(x).value = fmt.UnFormat(y.toUpperCase());
}

function attachToLinks() {
    $("a").each(function (i) {
        if (!$(this).hasClass("noTimer") &&
            $(this).parents("#newMegaMenu").size() === 0 &&
            !$(this).hasClass("ui-dialog-titlebar-close") &&
            $(this).parent().html().indexOf("javascript:showExternalPage") == -1 &&
            $(this).prop("href").indexOf("javascript:hoverMenu") == -1) {
            $(this).click(windowTop().showTimer);
        }
    });
}
function checkMetaTags(ParentWindow) {
    try {
        var MetaTags = ParentWindow.document.getElementsByTagName("Meta");

        if (MetaTags.length > 0) {
            for (var i = 0; i < MetaTags.length; i++) {
                if (MetaTags[i].name == 'uswindow');
                return true;
            }
            return false;
        }
        else {
            return false;
        }
    } catch (e) { return false; }
}

function findMainFrame(ParentWindow) {
    for (var i = 0; i < ParentWindow.frames.length; i++) {
        if (ParentWindow.frames[i].body != null) {
            if (checkMetaTags(ParentWindow.frames[i]))
                return ParentWindow.frames[i];
        }
    }
    return ParentWindow;
}


/* code for TextDescriptionControl*/

// Description: Will allow maxlength limits for textboxes that are designated as multiline
// Usage:
//     *.aspx file: <asp:TextBox ID="txtID" onkeypress = "isMaxLength(event)" onmousemove = "isMaxLength(event)" onbeforepaste = "doBeforeMaxLengthPaste(this)" onpaste       = "doMaxLengthPaste(this)" ... 
//     Process XML: <MaxLength>255</MaxLength>  
function isMaxLength(e) {
    // Rationalize IE vs. Firefox
    var evt = e || window.event;
    var targ = evt.target || evt.srcElement;
    var key = (typeof evt.which !== 'undefined') ? evt.which : evt.keyCode;
    if (key == 0) key = evt.keyCode;
    var selectionLength;
    var currentFieldLength;
    var maximumFieldLength;

    if (targ.nodeType == 3) // defeat Safari bug
    {
        targ = targ.parentNode;
    }

    selectionLength = GetSelectionLength(targ);
    currentFieldLength = (targ.value && targ.value.length ? targ.value.length : 0);
    maximumFieldLength = targ.getAttribute('maxlength') || targ.maxlength;

    if (maximumFieldLength != null) {
        if (!isAllowedCharForMaxLength(key)) {
            if ((currentFieldLength - selectionLength) > (maximumFieldLength - 1)) {
                cancelEvent(e);
            }
        }

        if (currentFieldLength > maximumFieldLength) {
            targ.value = targ.value.substring(0, maximumFieldLength);
        }
    }
}

function isAllowedCharForMaxLength(keyCode) {
    // Allow non-printing, arrow and delete keys
    return ((keyCode < 32)
        || (keyCode >= 33 && keyCode <= 40)
        || (keyCode == 46));
}

//
// Returns the number of selected characters in 
// the specified element
//
function GetSelectionLength(targetField) {
    // IE >= 9 with html5 doctype or non-IE
    if (targetField.selectionStart) {
        return (targetField.selectionEnd - targetField.selectionStart);
    } else {
        try {
            return document.selection.createRange().text.length;
        } catch (e) {
            return 0;
        }
    }
}

// Will cancel the event for a text area that has maxlength defined
function doBeforeMaxLengthPaste(e) {
    // Rationalize IE vs. Firefox
    var evt = e || window.event;
    var targ = evt.target || evt.srcElement;

    if (targ.getAttribute('maxlength')) {
        cancelEvent(e);
    }
}

// Will paste only the correct number of characters from the clipboard
function doMaxLengthPaste(e) {
    // Rationalize IE vs. Firefox
    //    var evt = (window.event ? window.event : e);
    //    var targ = (window.event ? evt.srcElement : evt.target);
    //    var key = (window.event ? evt.keyCode : evt.which);
    //    maxLength = targ.getAttribute('maxlength');
    //    value = targ.value;
    //    if (maxLength) {
    //        maxLength = parseInt(maxLength);
    //        var o = targ.document.selection.createRange(); // Subtract any currently selected text
    //        var iInsertLength = maxLength - value.length + o.text.length; // max - current text + selected chars
    //        var sData = window.clipboardData.getData("Text").substr(0, iInsertLength);
    //        o.text = sData; // update the text in the control
    //        cancelEvent(e);
    //    }
}

function limitTextLengthOn(selector) {
    //    if (US.common.featureDetection.textarea.supportsMaxLength) {
    //        return;
    //    }

    //    $(selector).filter('textarea')
    //               .keypress(isMaxLength)
    //               .change(isMaxLength)
    //               .mousemove(isMaxLength)
    //               .bind("beforepaste", doBeforeMaxLengthPaste)
    //               .bind("paste", doMaxLengthPaste);
}

function sessionKeepAliveCallback(response) {
    var topWindow = windowTop();
    if (response == "success") {
        topWindow.USSessionTimeout.TimeRemaining = USSessionTimeout.OriginalDuration;
    } else {
        topWindow.USSessionTimeout.KeepSessionAlive = false;
        topWindow.clearInterval(keepAliveIntervalId);
    }
}
function pingSessionForKeepAlive() {
    var ajax = new AjaxRequest();
    ajax.Service = "CommonService";
    ajax.Method = "IntKeepSessionAlive";
    ajax.CallBackMethod = sessionKeepAliveCallback;
    ajax.send();
}
function startKeepSessionAliveTimer(topWindow) {
    if (topWindow) {
        topWindow.USSessionTimeout.HasComplementaryPageInSession = true;
        topWindow.USSessionTimeout.KeepSessionAlive = true;
        keepAliveIntervalId = topWindow.setInterval(pingSessionForKeepAlive, keepAliveInterval);
    }
}
function stopKeepSessionAliveTimer(topWindow) {
    if (topWindow) {
        topWindow.USSessionTimeout.HasComplementaryPageInSession = false;
        topWindow.USSessionTimeout.KeepSessionAlive = false;
        if (keepAliveIntervalId != null && keepAliveIntervalId != '' && keepAliveIntervalId != 'undefined') {
            topWindow.clearInterval(keepAliveIntervalId);
        }
    }
}
function checkComplementaryPage() {
    var doc, metas;
    try {
        doc = windowTop().document.getElementById("ContentFrame").contentWindow.document;
        metas = doc.getElementsByName("uswindow");
        if (metas.length == 0) {
            windowMain().USSessionTimeout.HasComplementaryPageInSession = true;
            //startKeepSessionAliveTimer(topWindow);
        } else {
            //topWindow.thirdParty = false;
            windowMain().USSessionTimeout.HasComplementaryPageInSession = false;
            //stopKeepSessionAliveTimer(topWindow);
        }
    } catch (e) {
        if (windowMain().USSessionTimeout) {
            windowMain().USSessionTimeout.HasComplementaryPageInSession = true;
        }
        //if(topWindow.USSessionTimeout){
        //  startKeepSessionAliveTimer(topWindow);
        //}
    }
}

//
// log user out in response to session max age exceeded 
//
USGCommon.logout = function () {
    windowMain().USSessionTimeout.shutDown();
}


/*****************************
-This code was added to replace a missing function that is no longer available in firefox 3.6
-Function is used by the infragistics grid and is critical to its functionality
*****************************/

if (!document.getBoxObjectFor) {
    document.getBoxObjectFor = function (el) {
        var pos = {};

        pos.x = el.offsetLeft;
        pos.y = el.offsetTop;
        parent = el.offsetParent;
        if (parent != el) {
            while (parent) {
                pos.x += parent.offsetLeft;
                pos.y += parent.offsetTop;
                parent = parent.offsetParent;
            }
        }

        parent = el.offsetParent;
        while (parent && parent != document.body) {
            pos.x -= parent.scrollLeft;
            if (parent.tagName != 'TR') {
                pos.y -= parent.scrollTop;
            }
            parent = parent.offsetParent;
        }

        return pos;
    };
}

var moreButtonClicked = false;

function SingleContentBoxMode(contentDivToExpandID, frameToExpandID, contentBoxId) {
    var contentDivToExpand = document.getElementById(contentDivToExpandID);
    var frameToExpand = document.getElementById(frameToExpandID);

    moreButtonClicked = true;

    if (typeof contentDivToExpand != 'undefined' && contentDivToExpand != null) {
        contentDivToExpand.style.width = '98%';
    }

    // hide toolbar
    document.getElementById("ctl00_pnlToolBar").style.display = 'none';

    if (typeof frameToExpand != 'undefined' && frameToExpand != 'undefined' && frameToExpand != null) {
        var containerInnerDiv = document.getElementById('containerInner');
        var contentExpandedBar = document.createElement("div");
        var boxTitle = document.getElementById('boxTitle' + contentBoxId);

        moreButtonFrameID = frameToExpandID;
        var html = "<div id=\"ctl00_pnlToolBar\" class=\"toolbar\"><div id=\"buttonbar\" class=\"buttonbar\"><div class=\"buttonContainer\"><input style=\"border: 0px;\" id=\"ctl00_btnPrev\" title=\"" + lstrBackBtn + "\" tabIndex=\"4001\" onclick=\"javascript:fBasePrev();\" alt=\"" + lstrBackBtn + "\" src='" + GlobalVars['RootVD'] + "/images/ButtonPrevious.gif' type=\"image\" name=\"ctl00$btnPrev\"/><label id=\"lblBackBtn\">" + lstrBack.toLowerCase() + "</label></div><IMG style=\"border: 0px\" id=ctl00_navdivider src='" + GlobalVars['RootVD'] + "/images/icon_toolbar_divider.gif'> <div class=\"buttonContainer\"><input style=\"border: 0px\" id=\"ctl00_btnPrint\" title=\"" + lstrPrintBtn + "\" tabIndex=\"4011\" onclick=\"javascript:PrintIFrameContent('" + frameToExpandID + "');\" alt=\"" + lstrPrintBtn + "\" src='" + GlobalVars['RootVD'] + "/images/ButtonPrint.gif' type=\"image\" name=\"ctl00$btnPrint\"/><label id=\"lblPrintBtn\">" + lstrPrint.toLowerCase() + "</label></div><div class=\"buttonContainer\"></div></div>";
        html += "<h1><em id=\"ctl00_lblSuperHeader\"></em><label id=\"ctl00_lblPageHeader\">" + boxTitle.childNodes[0].data + "</h1></div>";
        contentExpandedBar.innerHTML = html;
        containerInnerDiv.parentNode.insertBefore(contentExpandedBar, containerInnerDiv.parentNode.firstChild);
        boxTitle.style.display = 'none';

        containerInnerDiv.scrollTop = 0;
    }

    //hides connect with us
    if (document.getElementById("blogbanner") != null) {
        document.getElementById("blogbanner").style.display = 'none';
    }

    //adjusts main content height when expanded
    sizeInnerContainer();
}

function ExpandThisWindow(Sender, contentBoxId, pageName) {
    var currentContentDiv;
    var contentDivToExpandID = Sender.parentNode.parentNode.parentNode.parentNode.id;
    var contentDivToExpand = document.getElementById(contentDivToExpandID);
    var frameToExpand;
    var frameToExpandID = Sender.parentNode.previousSibling.firstChild.id;
    var ContentDivIDs = new Array();
    var i = 0, j = 0;
    var currentNode;

    moreButtonClicked = true;

    for (j = 0; j < contentDivToExpand.childNodes.length; j++) {
        currentNode = contentDivToExpand.childNodes[j];
        if (currentNode.id) {
            if (currentNode.id.length > 0 && currentNode.id != Sender.parentNode.parentNode.parentNode.id) {
                contentDivToExpand.childNodes[j].style.display = 'none';
            }
        }
    }

    ContentDivIDs[0] = 'leftHome';
    ContentDivIDs[1] = 'rightHome';
    ContentDivIDs[2] = 'middleHome';

    for (i = 0; i < ContentDivIDs.length; i++) {
        if (ContentDivIDs[i] != contentDivToExpandID) {
            currentContentDiv = document.getElementById(ContentDivIDs[i]);
            if (typeof currentContentDiv != 'undefined' && currentContentDiv != 'undefined' && currentContentDiv != null) {
                currentContentDiv.style.display = 'none';
            }
        }
    }

    contentDivToExpand.style.width = '98%';
    frameToExpand = document.getElementById(frameToExpandID);
    if (typeof frameToExpand != 'undefined' && frameToExpand != 'undefined' && frameToExpand != null) {
        var containerInnerDiv = document.getElementById('containerInner');
        var contentExpandedBar = document.createElement("div");
        var boxTitle = document.getElementById('boxTitle' + contentBoxId);

        moreButtonFrameID = frameToExpandID;
        contentExpandedBar.innerHTML = "<div id=\"ctl00_pnlToolBar\" class=\"toolbar\"><div id=\"buttonbar\" class=\"buttonbar\"><div class=\"buttonContainer\"><input style=\"border: 0px;\" id=\"ctl00_btnPrev\" title=\"" + lstrBackBtn + "\" tabIndex=\"4001\" onclick=\"javascript:fBasePrev();\" alt=\"" + lstrBackBtn + "\" src='" + GlobalVars['RootVD'] + "/images/ButtonPrevious.gif' type=\"image\" name=\"ctl00$btnPrev\"/><label id=\"lblBackBtn\">" + lstrBack.toLowerCase() + "</label></div><IMG style=\"border: 0px\" id=ctl00_navdivider src='" + GlobalVars['RootVD'] + "/images/icon_toolbar_divider.gif'> <div class=\"buttonContainer\"><input style=\"border: 0px\" id=\"ctl00_btnPrint\" title=\"" + lstrPrintBtn + "\" tabIndex=\"4011\" onclick=\"javascript:PrintIFrameContent('" + frameToExpandID + "');\" alt=\"" + lstrPrintBtn + "\" src='" + GlobalVars['RootVD'] + "/images/ButtonPrint.gif' type=\"image\" name=\"ctl00$btnPrint\"/><label id=\"lblPrintBtn\">" + lstrPrint.toLowerCase() + "</label></div><div class=\"buttonContainer\"></div></div><h1><em id=\"ctl00_lblSuperHeader\"></em><label id=\"ctl00_lblPageHeader\">" + boxTitle.childNodes[0].data + "</h1></div>";
        containerInnerDiv.parentNode.insertBefore(contentExpandedBar, containerInnerDiv.parentNode.firstChild);
        boxTitle.style.display = 'none';
        //connectWithUsResize();

        containerInnerDiv.scrollTop = 0;
    }
    Sender.style.display = 'none';
    //hides connect with us
    if (document.getElementById("blogbanner") != null) {
        document.getElementById("blogbanner").style.display = 'none';
    }
    //adjusts main content height when expanded
    sizeInnerContainer();
}

function PrintIFrameContent(theFrameID) {
    // Updated to use jqPrint. ULTI-42300
    postOrNot(false);
    jqPrint.SetupPrintPreview(theFrameID);
}

function USPrintPreview2(theFrameID) {
    var root = parent.GlobalVars["RootVD"];
    var pageTitle = parent.document.getElementsByTagName('title')[0].innerHTML;
    var HeadBlock = '';

    if (!document.all) {
        var headBlockObj = document.getElementsByTagName('Head');
        for (var i = 0; i < headBlockObj.length; i++) {
            HeadBlock += headBlockObj[i].innerHTML;
        }
    }


    if (document.getElementById('ctl00_lblPageHeader')) {
        var pageHeader = document.getElementById('ctl00_lblPageHeader').innerHTML;
    }

    if (document.getElementById(theFrameID)) {
        //var mainContent = HeadBlock;
        var mainContent = "";
        mainContent += document.getElementById(theFrameID).contentWindow.document.body.innerHTML;

        mainContent = mainContent.replace(/onmouseover/gim, "");
        mainContent = mainContent.replace(/onclick/gim, "");
        mainContent = mainContent.replace(/alt\s*=\s*\"?(\w|\s)+\"?/gim, "alt=\"\"");
        mainContent = mainContent.replace(/onload/gim, "");
        mainContent = mainContent.replace(/onchange/gim, "");
        mainContent = mainContent.replace(/onsubmit/gim, "");
        mainContent = mainContent.replace(/onblur/gim, "");
        mainContent = mainContent.replace(/onprerender/gim, "");
        mainContent = mainContent.replace(/onkeypress/gim, "");
        mainContent = mainContent.replace(/btnClearDate.gif/gi, "blank.gif");
        mainContent = mainContent.replace(/calendar.gif/gi, "blank.gif");
        mainContent = mainContent.replace(/<script.*?>/ig, "<!-- ");
        mainContent = mainContent.replace(/<\/script.*?>/ig, " --> ");
        mainContent = mainContent.replace(/\/\/-->/ig, "");
        mainContent = mainContent.replace(/<option.*?selected.*?>/ig, "<span class='dropDownReplaced'>");
        mainContent = mainContent.replace(/<option.*?<\/option>/ig, "");
        mainContent = mainContent.replace(/<\/option>/ig, "</span>");
        mainContent = mainContent.replace(/<select.*?[^%]>/ig, "");
        mainContent = mainContent.replace(/<\/select>/ig, "");
        mainContent = mainContent.replace(/resetlargeList.gif/ig, "blank.gif");
        mainContent = mainContent.replace(/<input.*type=(.r|r)radio/ig, "<input type=\"radio\" disabled=\"true\" ");
        mainContent = mainContent.replace(/<input(.|type=.*checkbox.*>)/ig, "<input disabled=\"true\" ");
        mainContent = mainContent.replace(/<div class=\"?gridToolbar\"?/ig, "<div class=\"hide\"");


        win = windowTop().WindowManager.popupPrintPreview('toolbar = no, status = no, resizable = yes, scrollbars = yes');

        win.document.writeln("<html><head><title>Print Preview</title>");

        var USPrintPreviewJS = '';
        USPrintPreviewJS = USPrintPreviewJS + "<script type=\"text/javascript\">\n";
        USPrintPreviewJS = USPrintPreviewJS + "function shrinkPage(documentObject)\n";
        USPrintPreviewJS = USPrintPreviewJS + "{\n";
        USPrintPreviewJS = USPrintPreviewJS + "//fix input controls\n";
        USPrintPreviewJS = USPrintPreviewJS + "  var pageElements = documentObject.getElementsByTagName('input');\n";
        USPrintPreviewJS = USPrintPreviewJS + "  for (var i=0; i<pageElements.length; i++)\n";
        USPrintPreviewJS = USPrintPreviewJS + "  {\n";
        USPrintPreviewJS = USPrintPreviewJS + "      var thisType = (pageElements[i].type != null && pageElements[i].type != undefined) ? pageElements[i].type.toLowerCase() : pageElements[i].type;\n";
        USPrintPreviewJS = USPrintPreviewJS + "      var thisClasses = pageElements[i].className;\n";
        USPrintPreviewJS = USPrintPreviewJS + "      if (thisType == 'text' && thisClasses.indexOf('hide') == -1)\n";
        USPrintPreviewJS = USPrintPreviewJS + "      {\n";
        USPrintPreviewJS = USPrintPreviewJS + "        replaceElement(documentObject, pageElements[i]);\n";
        USPrintPreviewJS = USPrintPreviewJS + "        i--\n";
        USPrintPreviewJS = USPrintPreviewJS + "      }\n";
        USPrintPreviewJS = USPrintPreviewJS + "  }\n";
        USPrintPreviewJS = USPrintPreviewJS + "\n";
        USPrintPreviewJS = USPrintPreviewJS + "  //fix textareas\n";
        USPrintPreviewJS = USPrintPreviewJS + "  var pageElements = documentObject.getElementsByTagName('textarea');\n";
        USPrintPreviewJS = USPrintPreviewJS + "  for (var i=0; i<pageElements.length; i++)\n";
        USPrintPreviewJS = USPrintPreviewJS + "  {\n";
        USPrintPreviewJS = USPrintPreviewJS + "    var thisClasses = pageElements[i].className;\n";
        USPrintPreviewJS = USPrintPreviewJS + "    if (thisClasses != undefined && thisClasses.indexOf('hide') == -1){\n";
        USPrintPreviewJS = USPrintPreviewJS + "      replaceElement(documentObject, pageElements[i]);\n";
        USPrintPreviewJS = USPrintPreviewJS + "      i--;\n";
        USPrintPreviewJS = USPrintPreviewJS + "    }\n";
        USPrintPreviewJS = USPrintPreviewJS + "  }\n";
        USPrintPreviewJS = USPrintPreviewJS + "}\n";
        USPrintPreviewJS = USPrintPreviewJS + "\n";
        USPrintPreviewJS = USPrintPreviewJS + "function replaceElement(documentObject, documentElement)\n";
        USPrintPreviewJS = USPrintPreviewJS + "{\n";
        USPrintPreviewJS = USPrintPreviewJS + "    var replacementElement = documentObject.createElement('span');\n";
        USPrintPreviewJS = USPrintPreviewJS + "    if (documentElement.value)\n";
        USPrintPreviewJS = USPrintPreviewJS + "      replacementElement.innerHTML = documentElement.value;\n";
        USPrintPreviewJS = USPrintPreviewJS + "\n";
        USPrintPreviewJS = USPrintPreviewJS + "    documentElement.parentNode.replaceChild(replacementElement,documentElement);\n";
        USPrintPreviewJS = USPrintPreviewJS + "}\n"
        USPrintPreviewJS = USPrintPreviewJS + "</script>";

        win.document.writeln(USPrintPreviewJS);

        win.document.writeln("<link rel=\"stylesheet\" href=\"" + root + "/stylesheets/USContentBoxStyles.css\" media=\"all\" />");
        win.document.writeln("<style type='text/css' media='all'>body{position: static; overflow: auto;height: auto; width: auto;} </style>");
        win.document.writeln("<style type='text/css' media='print'>body {margin: 0 0 10px 0;} .printButton {display: none;}</style>");
        win.document.writeln("<META HTTP-EQUIV=\"CACHE-CONTROL\" CONTENT=\"NO-STORE\"><META HTTP-EQUIV=\"CACHE-CONTROL\" CONTENT=\"NO-CACHE\"><META HTTP-EQUIV=\"PRAGMA\" CONTENT=\"NO-CACHE\"><META HTTP-EQUIV=\"EXPIRES\" CONTENT=\"0\"></head><body onload=\"shrinkPage(this.document);\">");
        win.document.writeln("<div style=\"float:right;\" class=\"floatR\"><input type=\"button\" class=\"printButton\" value=\"print\" onclick=\"javascript: print();window.close();\" title=\"print page\" /><input type=\"button\" class=\"printButton\" value=\"close\" onclick=\"javascript: window.close();\" title=\"close page\" /></div>");

        if (printTitleBar)
            win.document.writeln("<h3>" + pageTitle + "</h3>");

        if (printPageHeader)
            win.document.writeln("<h1>" + pageHeader + "</h1>");

        win.document.writeln(mainContent);

        win.document.writeln("</body></html>");

        win.document.close();

    }
    else {
        window.print();
    }
}

var ddl_blockPostBack = false;
var ddl_onChange = false;

function ddlBlockPost_onMouseDownHandler() {
    ddl_blockPostBack = false;
}

function ddlBlockPost_onKeyDownHandler(event) {
    if (event.keyCode == 13)
        __doPostBack();
    else
        ddl_blockPostBack = true;
}

function ddlBlockPost_onChangeHandler() {
    if (ddl_blockPostBack == false) {
        __doPostBack();
    }

    ddl_onChange = true;
}

function ddlBlockPost_onBlurHandler() {
    if (ddl_onChange) {
        __doPostBack();
    }
}

//If we're on a Connect ASP page, we don't want to cause errors related to jQuery use.
try {
    $(document).ready(function () {
        var loc = document.location.toString();
        if (loc.toLowerCase().indexOf('default.aspx') != -1) {
            $(document).find("input:visible,a:visible").eq(0).focus();
        } else if (loc.indexOf('Home.aspx') === -1 && loc.indexOf('Dashboard.aspx') === -1 && loc.indexOf('HomeContainer.aspx') === -1 && loc.indexOf('DisplayContent.aspx') === -1 && loc.indexOf('GadgetView') === -1) {
            var elements = $(document).find("input:visible:enabled:first, a:visible:first").eq(0).focus();
        }
        document.body.scrollLeft = 0;
    });
} catch (err) {
}

function isExactKey(event, key) {
    var code = (event.keyCode ? event.keyCode : event.which);
    return (!event.shiftKey && !event.altKey && !event.ctrlKey && code == key);
}


//If we're on a Connect ASP page, we don't want to cause errors related to jQuery use.
try {
    $(document).ready(function () {
        //This check is necessary because this will run everywhere common.js is included and may not have certain variables defined for windowTop to work
        //If in default.aspx, don't do anything
        var currentLocation = window.location.href.toLowerCase();
        if (currentLocation.indexOf("default.aspx") == -1 &&
            currentLocation.indexOf("updatesdialog.aspx") == -1 &&
            windowTop() != null &&
            typeof GlobalVars != "undefined" &&
            GlobalVars != null) {
            getInboxCount();
            getAlerts();
        }

        //Toggle quick tour help menu
        $('#ctl00_quickToursHelpCmd, #ctl00_tourContextHelpDiv').click(function () {
            toggleClass('ctl00_tourContextHelpDiv', 'hide', 'contextualHelpContainer');
            return false;
        });
    });
} catch (err) {
}

/* begin - Top Nav links */

// Check if the inbox count link exists or if cu menu is enabled
function getInboxCount() {
    // Check if the inbox count link exists or if cu menu is enabled
    if ($("a[id$=lnkInboxCount], span[data-id=hdr_inbox]", windowTop().document).size() === 1) {
        $.ajax({
            url: GlobalVars["RootVD"] + "/services/JsonService.asmx/GetInboxCount",
            dataType: "json",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                windowTop().unifiedUI.setInboxCount(data.d);
            }
        });
    }
    else if ($("usg-nav-item[data-id=74]", windowTop().document).size() === 1
        || $("usg-nav-item[data-id=4482]", windowTop().document).size() === 1) {
        $.ajax({
            url: GlobalVars["RootVD"] + "/services/JsonService.asmx/GetInboxCount",
            dataType: "json",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                windowTop().globalMenu.inbox.toDoCount = data.d;
                windowTop().updateMenuCount && windowTop().updateMenuCount();
            }
        });
    }
}

function getAlerts() {
    var topDocument = windowTop().document;
    var lnkAlerts = $("#" + GlobalVars["ClientID"] + "_lnkAlerts", topDocument);
    if (lnkAlerts.size() == 1) {

        $.ajax({
            url: GlobalVars["RootVD"] + "/services/JsonService.asmx/GetSystemAlerts",
            dataType: "json",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                var alerts = data.d;
                var listItems = "";

                if (alerts.length == 0) {
                    $("#alertsDialog", topDocument).empty();
                    lnkAlerts.hide();
                    return;
                }

                for (var i = 0; i < alerts.length; i++) {
                    if (i == alerts.length - 1) {
                        listItems += '<li class="lastAlert">';
                    } else {
                        listItems += '<li>';
                    }
                    listItems += '<time>' + alerts[i].EventStartDate + ' - ' + alerts[i].EventEndDate + '</time>';
                    listItems += '<p>' + alerts[i].Message + '</p>';
                    listItems += '</li>';
                }

                $("#alertsDialog", topDocument).html('<div class="alertMessages"><ul class="systemAlerts">' + listItems + '</ul></div>');
                $("#alertsDialog", topDocument).append('<div class="alertFooter">* ' + lstrAlertWillBecomeAvailEST + '</div>');
                lnkAlerts.show();
            }
        });
    }
}

function showAlerts() {
    $("#alertsDialog", windowTop().document).dialog({
        resizable: false,
        draggable: false,
        width: 400,
        height: 230,
        modal: true,
        title: lstrSystemAlerts,
        dialogClass: "alertsDialog"
    });
}
/* end - Top Nav links */

//Function that builds toolbar based on toolbar options.
function buildToolbar(toolbarOptions) {
    var toolbarHtml = '<div id="buttonbar" class="buttonbar">';
    var imageDir = GlobalVars['RootVD'] + "/images";

    for (id in toolbarOptions) {
        var option = toolbarOptions[id].toLowerCase();

        switch (option) {
            case "save":
                toolbarHtml += '<div class="buttonContainer"><input type="image" id="' + id + '" style="border-width:0px;" src="' + imageDir + '/ButtonSave.gif"><label id="lblSaveBtn">' + lstrSave + '</label></div>';
                break;

            case "reset":
                toolbarHtml += '<div class="buttonContainer"><input type="image" id="' + id + '" alias="refresh" style="border-width:0px;" src="' + imageDir + '/ButtonReset.gif"><label id="lblResetBtn">' + lstrReset + '</label></div>';
                break;

            case "cancel":
                toolbarHtml += '<div class="buttonContainer"><input type="image" id="' + id + '" src="' + imageDir + '/ButtonCancel.gif" style="border-width:0px;"><label id="lblCancelBtn">' + lstrCancel + '</label></div>';
                break;

            case "help":
                toolbarHtml += '<div class="buttonContainer"><input type="image" id="' + id + '" src="' + imageDir + '/ButtonHelp.gif" onclick="javascript:fBaseHelp();" style="border-width:0px;"><label id="lblHelpBtn">' + lstrHelp + '</label></div>';
                break;

            case "div":
                toolbarHtml += '<img id="' + id + '" src="' + imageDir + '/icon_toolbar_divider.gif" style="border-width:0px;">';
                break;
        }
    }

    toolbarHtml += '</div>';

    return toolbarHtml;
}

// Define namespace for common functions
(function (global) {
    global.US = global.US || {};
    global.US.common = global.US.common || {};



    global.US.common.getPageName = function () {
        var queryString = window.location.href;
        var regex = new RegExp('pages*\\w\\/\\w*\\/', 'g');
        var startPattern = regex.exec(queryString);

        return queryString.slice((queryString.indexOf(startPattern) + startPattern.toString().length), queryString.indexOf('.aspx'));
    };

    global.US.common.isSelectedLanguage = function (currentLanguage) {
        var allLanguages = window.GlobalVars.SelectedLanguages || [],
            currentLanguage = currentLanguage || 'en';

        var result = false;
        $.each(allLanguages, function () {
            result = (this.toLowerCase() == currentLanguage.toLowerCase());

            return !result;
        });

        return result;
    };

    global.US.common.getFrameIndexByName = function (framesArray, frameName) {
        if (framesArray !== undefined && framesArray !== null && framesArray.length > 0 && frameName !== undefined && frameName !== null) {
            for (var i = 0; i < framesArray.length - 1; i++) {
                if (framesArray[i].name.toString().toLowerCase().indexOf(frameName.toLowerCase()) > -1) {
                    return i;
                }
            }
            return -1;
        } else {
            return -1;
        }
    };

})(window);

// US.common.effectiveDating
(function (global, $) {
    global.US.common.effectiveDating = global.US.common.effectiveDating || {};

    /// <summary>
    /// Gets the effective date from the effective dating banner if present, today otherwise.
    /// </summary>
    global.US.common.effectiveDating.getEffectiveDate = function () {
        var picker = USGDates['effectiveDatingDate'],
            effDate = null;
        if (picker && picker.getDatePicker && picker.getDatePicker()) {
            effDate = picker.getDatePicker().GetDate();
        }
        return effDate ? effDate : global.US.common.effectiveDating.today();
    };

    global.US.common.effectiveDating.today = function () {
        return new Date();
    };

    /// <summary>
    /// Defaults dates on date pickers with the ability to conditionally default based on a test function or boolean parameter.
    /// </summary>
    /// <param name="arrayOfCalControlIds">A string array of calendar control ids. e.g. ['calBenStartDate','calStartDate']. The calendar control ids are the ids of USCalendar controls on the aspx markup.</param>
    /// <param name="test">This parameter could be a function that evaluates to a boolean result or a boolean value itself. If either the function evaluates to true or a boolean value of true are passed as this parameter, then the calendar controls will be defaulted. If this parameter is not passed in, it is a function that evaluates to something other than a boolean value of true, null, undefined, or any other non-boolean, non-function type, then no defaulting of dates will take place.</param>
    /// <example>Defaulting effective date of 2 calendar controls if the page is in add mode: US.common.effectiveDating.defaultDatePickers(['calBenStartDate','calStartDate'], function() { return PageVars["mode"] === "ADD"; });</example>
    global.US.common.effectiveDating.defaultDatePickers = function (arrayOfCalControlIds, test) {
        if ((typeof test == 'function' && test() === true) || (typeof test == 'boolean' && test) || typeof test == 'undefined') {
            var effDate = US.common.effectiveDating.getEffectiveDate();
            $.each(arrayOfCalControlIds, function (i, val) {
                var usgDate = USGDates[val];
                if (typeof (usgDate) != 'undefined') {
                    usgDate.getDatePicker().SetDate(effDate);
                }
            });
        }
    };
})(window, window.jQuery);

// US.common.dates
(function (global, $) {
    global.US.common.dates = global.US.common.dates || {};

    var separatorChars = ['/', '-', '.', ' ', ':'];

    global.US.common.dates.getSeparators = function () {
        return separatorChars;
    };

    function getFormat() {
        var formatMasks = global.FormatMasks ? global.FormatMasks : global.opener.parent.FormatMasks;
        return formatMasks.DATE.Mask;
    }

    function getSeparator() {
        var separator;
        var dateFormat = getFormat();
        $.each(separatorChars, function (index, s) {
            if (dateFormat.indexOf(s) >= 0) {
                separator = s;
                return false;
            }
        });

        return separator;
    }

    global.US.common.dates.getMaskIndexes = function (separator) {
        separator = separator || getSeparator();
        var dateFormat = getFormat();

        var indexes = {};
        $(dateFormat.split(separator)).each(function (index, s) {
            if (s.toLowerCase().indexOf('m') >= 0)
                indexes.month = index;
            else if (s.toLowerCase().indexOf('d') >= 0)
                indexes.day = index;
            else
                indexes.year = index;
        });

        return indexes;
    };

    global.US.common.dates.formatDate = function (date) {
        var separator = getSeparator();
        var indexes = this.getMaskIndexes(separator);
        var day = pad(date.getDate());
        var month = pad(date.getMonth() + 1);
        var year = date.getFullYear();

        return $.map([[indexes.month, month], [indexes.day, day], [indexes.year, year]]
            .sort(function (a, b) { return a[0] - b[0]; }), function (pair) { return pair[1]; })
            .join(separator);
    };

    function pad(number) {
        return (number < 10 ? '0' : '') + number;
    }

    global.US.common.dates.formatTime = function (date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var ampm = hours >= 12 ? 'pm' : 'am';
        var hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return hours + ':' + pad(minutes) + ':' + pad(seconds) + ' ' + ampm;
    }

    global.US.common.dates.format = function (date) {
        return this.formatDate(date) + ' ' + this.formatTime(date);
    }

})(window, window.jQuery);

US.common.featureDetection = (function (featureDetection) {
    featureDetection.textarea = featureDetection.textarea || {};

    featureDetection.textarea.supportsMaxLength = (function () {
        return ('maxLength' in document.createElement('textarea'));
    })();

    // This method should not be called, it is only public for testing purposes
    // It is called once below to officially apply the max length implementation
    featureDetection.textarea.applyMaxLength = function () {
        // Test for HTML 5 max length support
        var isMaxLengthSupported = featureDetection.textarea.supportsMaxLength === true;

        if (isMaxLengthSupported || !window.$) return; // Handled by browser, no need to polyfill

        // Defaults
        $.maxlength.setDefaults({
            truncate: true,
            showFeedback: false
        });

        // For all fields with maxlength, call maxlength plugin
        $(document).on('keydown mousedown', 'textarea[maxlength]', function () {
            var $this = $(this),
                key = '__isMaxLengthSetup__',
                isMaxLengthSet = $this.data(key) === true;

            if (isMaxLengthSet) return;

            var max = parseInt($this.attr('maxlength'));
            $this.data(key, true);
            if (!isNaN(max)) {
                $this.maxlength({ max: max }).on('paste', function () {
                    window.setTimeout(function () {
                        $this.keyup();
                        $this.keyup();
                    }, 5);
                });
            }
        });
    }

    featureDetection.textarea.applyMaxLength();

    return featureDetection;
}(US.common.featureDetection || {}));

String.prototype.format = function () {
    /// <summary>
    /// Replaces the format item in this string with the string representation of the corresponding object in the arguments.
    /// </summary>
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

String.prototype.padLeft = function (totalLen, paddingChar) {
    /// <summary>
    /// Right-aligns the characters in this instance, padding on the left with a specific Unicode character for a specific total length.
    /// </summary>
    /// <param name="totalLen">The total length after padding.</param>
    /// <param name="paddingChar">The character used to pad with.</param>
    var padChar = paddingChar.split('')[0], pad = [];
    for (var i = 0; i < totalLen; i++) {
        pad[i] = padChar;
    }
    return (pad.join('') + this).slice(-totalLen);
};

String.prototype.padRight = function (totalLen, paddingChar) {
    /// <summary>
    /// Left-align the characters in this string, padding on the right with a specific Unicode character, for a specified total length.
    /// </summary>
    /// <param name="totalLen">The total length after padding.</param>
    /// <param name="paddingChar">The character used to pad with.</param>
    var padChar = paddingChar.split('')[0], pad = [];
    for (var i = 0; i < totalLen - this.length; i++) {
        pad[i] = padChar;
    }
    return this + pad.join('');
};