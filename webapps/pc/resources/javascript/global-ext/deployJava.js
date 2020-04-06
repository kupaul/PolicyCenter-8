/*
 * Reduced and modified for Guidewire use. (C) 2012-2014, Guidewire Software, Inc.
 *
 * Copyright (c) 2006, 2011, Oracle and/or its affiliates. All rights reserved.
 * ORACLE PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   - Neither the name of Oracle nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * deployJava.js
 *
 * This file is part of the Deployment Toolkit.  It provides functions for web
 * pages to detect the presence of a JRE, install the latest JRE, and easily run
 * applets or Web Start programs.  More Information on usage of the
 * Deployment Toolkit can be found in the Deployment Guide at:
 * http://docs.oracle.com/javase/6/docs/technotes/guides/jweb/index.html
 *
 */

gw.deployJava = function() {
    /** HTML attribute filter implementation */
    var hattrs = {
        core: [ 'id', 'class', 'title', 'style' ],
        i18n: [ 'lang', 'dir' ],
        events: [ 'onclick', 'ondblclick', 'onmousedown', 'onmouseup',
            'onmouseover', 'onmousemove', 'onmouseout', 'onkeypress',
            'onkeydown', 'onkeyup' ],
        object: [ 'classid', 'codebase', 'codetype', 'data', 'type',
            'archive', 'declare', 'standby', 'height', 'width', 'usemap',
            'name', 'tabindex', 'align', 'border', 'hspace', 'vspace' ]
    };

    var object_valid_attrs = hattrs.object.concat(hattrs.core, hattrs.i18n,
        hattrs.events);

    // generic log function, use console.log unless it isn't available
    // then revert to alert()
    function log(message) {
        if ( ! rv.debug ) {return};

        if (console.log) {
            console.log(message);
        } else {
            alert(message);
        }
    }

    function arHas(ar, attr) {
        var len = ar.length;
        for (var i = 0; i < len; i++) {
            if (ar[i] === attr) return true;
        }
        return false;
    }

    function isValidObjectAttr(attr) {
        return arHas(object_valid_attrs, attr.toLowerCase());
    }
    /* HTML attribute filters */

    var rv = {

    debug: null,

    /* version of deployJava.js */
    version: "20120801-guidewire",

    firefoxJavaVersion: null,

    locale: null,

    browserName: null,
    browserName2: null,

    /**
     * Returns an array of currently-installed JRE version strings.
     * Version strings are of the form #.#[.#[_#]], with the function returning
     * as much version information as it can determine, from just family
     * versions ("1.4.2", "1.5") through the full version ("1.5.0_06").
     *
     * Detection is done on a best-effort basis.  Under some circumstances
     * only the highest installed JRE version will be detected, and
     * JREs older than 1.4.2 will not always be detected.
     */
    getJREs: function() {
        var list = new Array();
        var browser = this.getBrowser();

        if (browser == 'MSIE') {
            if (this.testUsingActiveX('1.7.0')) {
               list[0] = '1.7.0';
            } else if (this.testUsingActiveX('1.6.0')) {
                list[0] = '1.6.0';
            } else if (this.testUsingActiveX('1.5.0')) {
                list[0] = '1.5.0';
            } else if (this.testUsingActiveX('1.4.2')) {
                list[0] = '1.4.2';
            } else if (this.testForMSVM()) {
                list[0] = '1.1';
            }
        } else if (browser == 'Netscape Family') {
            this.getJPIVersionUsingMimeType();
            if (this.firefoxJavaVersion != null) {
                list[0] = this.firefoxJavaVersion;
            } else if (this.testUsingMimeTypes('1.7')) {
                list[0] = '1.7.0';
            } else if (this.testUsingMimeTypes('1.6')) {
                list[0] = '1.6.0';
            } else if (this.testUsingMimeTypes('1.5')) {
                list[0] = '1.5.0';
            } else if (this.testUsingMimeTypes('1.4.2')) {
                list[0] = '1.4.2';
            } else if (this.browserName2 == 'Safari') {
                if (this.testUsingPluginsArray('1.7.0')) {
                    list[0] = '1.7.0';
                } else if (this.testUsingPluginsArray('1.6')) {
                    list[0] = '1.6.0';
                } else if (this.testUsingPluginsArray('1.5')) {
                    list[0] = '1.5.0';
                } else if (this.testUsingPluginsArray('1.4.2')) {
                    list[0] = '1.4.2';
                }
            }
        }

        if (this.debug) {
            for (var i = 0; i < list.length; ++i) {
                log('We claim to have detected Java SE ' + list[i]);
            }
        }

        return list;
    },

    /**
     * Ensures that an appropriate JRE is installed and then runs an applet.
     * minimumVersion is of the form #[.#[.#[_#]]], and is the minimum
     * JRE version necessary to run this applet.  minimumVersion is optional,
     * defaulting to the value "1.1" (which matches any JRE).
     * If an equal or greater JRE is detected, runApplet() will call
     * writeObjectTag(attributes, parameters) to output the object tag.
     *
     * Note that version wildcards (star (*) and plus (+)) are not supported,
     * and including them in the minimumVersion will result in an error message.
     */
    runApplet: function(attributes, parameters, minimumVersion, placeholder) {
        if (minimumVersion == 'undefined' || minimumVersion == null) {
            minimumVersion = '1.1';
        }

        var regex = "^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$";

        var matchData = minimumVersion.match(regex);

        if (matchData != null) {
            var browser = this.getBrowser();
            if ((browser != '?') && ('Safari' != this.browserName2)) {
                if (this.versionCheck(minimumVersion + '+')) {
                    return this.writeObjectTag(attributes, parameters, placeholder);
                }
            } else {
                // for unknown or Safari - just try to show applet
                return this.writeObjectTag(attributes, parameters, placeholder);
            }
        } else {
            log('Invalid minimumVersion argument to runApplet():' +
                 minimumVersion);
        }
        return null;
    },

    /**
     * Outputs an applet tag with the specified attributes and parameters, where
     * both attributes and parameters are associative arrays.  Each key/value
     * pair in attributes becomes an attribute of the applet tag itself, while
     * key/value pairs in parameters become <PARAM> tags.  No version checking
     * or other special behaviors are performed; the tag is simply written to
     * the DOM element identified by attributes['id']
     */
    writeObjectTag: function(attributes, parameters, placeholder) {
        var objectTag = {
            tag: 'object',
            type: 'application/x-java-applet',
            id: attributes['id'],
            children: []
        };
        var addCodeAttribute = true;

        if (null == parameters || typeof parameters != 'object') {
            parameters = new Object();
        }

        for (var attribute in attributes) {
            if (! isValidObjectAttr(attribute)) {
                parameters[attribute] = attributes[attribute];
            } else {
                objectTag[attribute] = attributes[attribute];
                if (attribute == 'code') {
                    addCodeAttribute = false;
                }
            }
        }

        var codebaseParam = false;
        for (var parameter in parameters) {
            if (parameter == 'codebase_lookup') {
                codebaseParam = true;
            }
            // Originally, parameter 'object' was used for serialized
            // applets, later, to avoid confusion with object tag in IE
            // the 'java_object' was added.  Plugin supports both.
            if (parameter == 'object' || parameter == 'java_object' ||
                parameter == 'java_code' ) {
                addCodeAttribute = false;
            }
            objectTag['children'].push({
                tag: 'param',
                name: parameter,
                value: parameters[parameter]
            });
        }
        if (!codebaseParam) {
            objectTag['children'].push({
                tag: 'param',
                name: 'codebase_lookup',
                value: 'false'
            });
        }

        if (addCodeAttribute) {
            objectTag['code'] = 'dummy';
        }

        var oldObjectTag = Ext.get(attributes['id']);
        if (oldObjectTag != null) {
            oldObjectTag.remove();
        }

        return Ext.DomHelper.append(placeholder, objectTag, true);
    },


     /**
      * Returns true if there is a matching JRE version currently installed
      * (among those detected by getJREs()).  The versionPattern string is
      * of the form #[.#[.#[_#]]][+|*], which includes strings such as "1.4",
      * "1.5.0*", and "1.6.0_02+".
      * A star (*) means "any version within this family" and a plus (+) means
      * "any version greater or equal to the specified version".  "1.5.0*"
      * matches 1.5.0_06 but not 1.6.0_01, whereas "1.5.0+" matches both.
      *
      * If the versionPattern does not include all four version components
      * but does not end with a star or plus, it will be treated as if it
      * ended with a star.  "1.5" is exactly equivalent to "1.5*", and will
      * match any version number beginning with "1.5".
      *
      * If getJREs() is unable to detect the precise version number, a match
      * could be ambiguous.  For example if getJREs() detects "1.5", there is
      * no way to know whether the JRE matches "1.5.0_06+".  versionCheck()
      * compares only as much of the version information as could be detected,
      * so versionCheck("1.5.0_06+") would return true in in this case.
      *
      * Invalid versionPattern will result in a JavaScript error alert.
      * versionPatterns which are valid but do not match any existing JRE
      * release (e.g. "32.65+") will always return false.
      */
    versionCheck: function(versionPattern)
    {
        var index = 0;
        var regex = "^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?(\\*|\\+)?$";

        var matchData = versionPattern.match(regex);

        if (matchData != null) {
            // default is exact version match
            // examples:
            //    local machine has 1.7.0_04 only installed
            //    exact match request is "1.7.0_05":  return false
            //    family match request is "1.7.0*":   return true
            //    minimum match request is "1.6+":    return true
            var familyMatch = false;
            var minMatch = false;

            var patternArray = new Array();

            for (var i = 1; i < matchData.length; ++i) {
                // browser dependency here.
                // Fx sets 'undefined', IE sets '' string for unmatched groups
                if ((typeof matchData[i] == 'string') && (matchData[i] != '')) {
                    patternArray[index] = matchData[i];
                    index++;
                }
            }

            if (patternArray[patternArray.length-1] == '+') {
                // + specified in request - doing a minimum match
                minMatch = true;
                familyMatch = false;
                patternArray.length--;
            } else if (patternArray[patternArray.length-1] == '*') {
                // * specified in request - doing a family match
                minMatch = false;
                familyMatch = true;
                patternArray.length--;
            } else if (patternArray.length < 4) {
                // versionPattern does not include all four version components
                // and does not end with a star or plus, it will be treated as
                // if it ended with a star. (family match)
                minMatch = false;
                familyMatch = true;
            }

            var list = this.getJREs();
            for (var i = 0; i < list.length; ++i) {
                if (this.compareVersionToPattern(list[i], patternArray,
                                                 familyMatch, minMatch)) {
                    return true;
                }
            }

            return false;
        } else {
            log('Invalid versionPattern passed to versionCheck: ' +
                  versionPattern);
            return false;
        }
    },

    // obtain JPI version using navigator.mimeTypes array
    // if found, set the version to this.firefoxJavaVersion
    getJPIVersionUsingMimeType: function() {
        // Walk through the full list of mime types.
        for (var i = 0; i < navigator.mimeTypes.length; ++i) {
            var s = navigator.mimeTypes[i].type;
            // The jpi-version is the plug-in version.  This is the best
            // version to use.
            var m = s.match(/^application\/x-java-applet;jpi-version=(.*)$/);
            if (m != null) {
                this.firefoxJavaVersion = m[1];
                // Opera puts the latest sun JRE last not first
                if ('Opera' != this.browserName2) {
                    break;
                }
            }
        }
    },

    compareVersionToPattern: function(version, patternArray,
                                      familyMatch, minMatch) {
        if (version == undefined || patternArray == undefined) {
           return false;
        }
        var regex = "^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$";
        var matchData = version.match(regex);

        if (matchData != null) {
            var index = 0;
            var result = new Array();

            for (var i = 1; i < matchData.length; ++i) {
                if ((typeof matchData[i] == 'string') && (matchData[i] != ''))
                {
                    result[index] = matchData[i];
                    index++;
                }
            }

            var l = Math.min(result.length, patternArray.length);

            // result contains what is installed in local machine
            // patternArray is what is being requested by application
            if (minMatch) {
                // minimum version match, return true if what we have (installed)
                // is greater or equal to what is requested.  false otherwise.
                for (var i = 0; i < l; ++i) {
                    if (result[i] < patternArray[i]) {
                        return false;
                    } else if (result[i] > patternArray[i]) {
                        return true;
                    }
                }
                return true;
            } else {
                for (var i = 0; i < l; ++i) {
                    if (result[i] != patternArray[i]) return false;
                }
                if (familyMatch) {
                    // family match - return true as long as what we have
                    // (installed) matches up to the request pattern
                    return true;
                } else {
                    // exact match
                    // result and patternArray needs to have exact same content
                    return (result.length == patternArray.length);
                }
            }
        } else {
            return false;
        }
    },


    getBrowser: function() {

        if (this.browserName == null) {
            var browser = navigator.userAgent.toLowerCase();

            log('userAgent -> ' + browser);

            // order is important here.  Safari userAgent contains mozilla,
            // IE 11 userAgent contains mozilla and netscape,
            // and Chrome userAgent contains both mozilla and safari.
            if ((browser.indexOf('msie') != -1) && (browser.indexOf('opera') == -1)) {
                this.browserName = 'MSIE';
                this.browserName2 = 'MSIE';
            } else if (browser.indexOf('trident') != -1 || browser.indexOf('Trident') != -1) {
                this.browserName = 'MSIE';
                this.browserName2 = 'MSIE';
            } else if (browser.indexOf('iphone') != -1) {
                // this included both iPhone and iPad
                this.browserName = 'Netscape Family';
                this.browserName2 = 'iPhone';
            } else if (browser.indexOf('firefox') != -1) {
                this.browserName = 'Netscape Family';
                this.browserName2 = 'Firefox';
            } else if (browser.indexOf('chrome') != -1) {
                this.browserName = 'Netscape Family';
                this.browserName2 = 'Chrome';
            } else if (browser.indexOf('safari') != -1) {
                this.browserName = 'Netscape Family';
                this.browserName2 = 'Safari';
            } else if (browser.indexOf('mozilla') != -1) {
                this.browserName = 'Netscape Family';
                this.browserName2 = 'Other';
            } else if (browser.indexOf('opera') != -1) {
                this.browserName = 'Netscape Family';
                this.browserName2 = 'Opera';
            } else {
                this.browserName = '?';
                this.browserName2 = 'unknown';
            }

            log ('Detected browser name:'+ this.browserName +
                 ', ' + this.browserName2);
        }
        return this.browserName;
    },


    testUsingActiveX: function(version) {
        var objectName = 'JavaWebStart.isInstalled.' + version + '.0';

        try {
            return (new ActiveXObject(objectName) != null);
        } catch (exception) {
            return false;
        }
    },


    testForMSVM: function() {
        var clsid = '{08B0E5C0-4FCB-11CF-AAA5-00401C608500}';

        if (typeof oClientCaps != 'undefined') {
            var v = oClientCaps.getComponentVersion(clsid, "ComponentID");
            if ((v == '') || (v == '5,0,5000,0')) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    },


    testUsingMimeTypes: function(version) {
        if (!navigator.mimeTypes) {
            log ('Browser claims to be Netscape family, but no mimeTypes[] array?');
            return false;
        }

        for (var i = 0; i < navigator.mimeTypes.length; ++i) {
            s = navigator.mimeTypes[i].type;
            var m = s.match(/^application\/x-java-applet\x3Bversion=(1\.8|1\.7|1\.6|1\.5|1\.4\.2)$/);
            if (m != null) {
                if (this.compareVersions(m[1], version)) {
                    return true;
                }
            }
        }
        return false;
    },

    testUsingPluginsArray: function(version) {
        if ((!navigator.plugins) || (!navigator.plugins.length)) {
            return false;
        }
        var platform = navigator.platform.toLowerCase();

        for (var i = 0; i < navigator.plugins.length; ++i) {
            s = navigator.plugins[i].description;
            if (s.search(/^Java Switchable Plug-in (Cocoa)/) != -1) {
                // Safari on MAC
                if (this.compareVersions("1.5.0", version)) {
                    return true;
                }
            } else if (s.search(/^Java/) != -1) {
                if (platform.indexOf('win') != -1) {
                    // still can't tell - opera, safari on windows
                    // return true for 1.5.0 and 1.6.0
                    if (this.compareVersions("1.5.0", version) ||
                        this.compareVersions("1.6.0", version)) {
                        return true;
                    }
                }
            }
        }
        // if above dosn't work on Apple or Windows, just allow 1.5.0
        if (this.compareVersions("1.5.0", version)) {
            return true;
        }
        return false;



    },

    // return true if 'installed' (considered as a JRE version string) is
    // greater than or equal to 'required' (again, a JRE version string).
    compareVersions: function(installed, required) {

        var a = installed.split('.');
        var b = required.split('.');

        for (var i = 0; i < a.length; ++i) {
            a[i] = Number(a[i]);
        }
        for (var i = 0; i < b.length; ++i) {
            b[i] = Number(b[i]);
        }
        if (a.length == 2) {
            a[2] = 0;
        }

        if (a[0] > b[0]) return true;
        if (a[0] < b[0]) return false;

        if (a[1] > b[1]) return true;
        if (a[1] < b[1]) return false;

        if (a[2] > b[2]) return true;
        if (a[2] < b[2]) return false;

        return true;
    },


    enableAlerts: function() {
        // reset this so we can show the browser detection
        this.browserName = null;
        this.debug = true;
    }

    }; // deployJava object

    if (rv.locale == null) {
        var loc = null;

        if (loc == null) try {
            loc = navigator.userLanguage;
        } catch (err) { }

        if (loc == null) try {
            loc = navigator.systemLanguage;
        } catch (err) { }

        if (loc == null) try {
            loc = navigator.language;
        } catch (err) { }

        if (loc != null) {
            loc.replace("-","_")
            rv.locale = loc;
        }
    }

    return rv;
}();
