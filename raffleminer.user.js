// ==UserScript==
// @name         Raffleminer.com throttle script
// @namespace    jasonheecs
// @version      1.0
// @description  Automatically throttle raffleminer.com's CPU mining speed
// @author       Jason Hee
// @include https://www.raffleminer.com/
// @grant   GM_getValue
// @grant   GM_setValue
// @grant   GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Set a greasemonkey script's variable to be user definable 
     * @param  {string} varName
     * @param  {*} defaultVal
     * @param  {Function} parseFunc
     * @return {Function} 
     */
    function makeUserModifiable(varName, defaultVal, parseFunc) {
        if(typeof parseFunc !== "function") {
            parseFunc = function(a) { return a; };
        }

        var currentVal = GM_getValue(varName, defaultVal);
        GM_registerMenuCommand("Set variable " + varName, function() {
            var val = prompt("Value for " + varName, currentVal);
            GM_setValue(varName, val);
        });

        return parseFunc(currentVal);
    }

    /**
     * Observe mutation changes for a dom element
     * @param  {Node}   domEl
     * @param  {Function} callback
     */
    function observeNode(domEl, callback) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        var observer = new MutationObserver(function(mutationsList) {
             for(var mutation of mutationsList) {
                 callback(mutation, domEl);
             }
        });

        observer.observe(domEl, { characterData: false, attributes: false, childList: true, subtree: false });
    }

    var $ = function(selector) {
        return document.getElementById(selector) || document.querySelector(selector);
    }

    var nanoWalletAddress = makeUserModifiable("nanoWalletAddress", "xrb_1u9b3oup4sc16tk3gzc5aprnrxh6cnnugmwy7ofgmpoeckusxqz39q4duzgz");
    var maxMiningSpeed = makeUserModifiable("maxMiningSpeed", "10", parseInt);
    var toggleMiningEl = $('toggle-mining');
    var decreaseMiningSpeedEl = $('throttle-dec');

    $('nano_account').value = nanoWalletAddress;

    toggleMiningEl.addEventListener('click', function () {
        observeNode($('mine-status'), function (mutation) {
            if (mutation.addedNodes.length && mutation.addedNodes[0].data === 'You are generating hashes, good luck in the raffle!') {
                while (parseInt($('mine-throttle').textContent) > maxMiningSpeed) {
                    decreaseMiningSpeedEl.click();
                }
            }
        });
    });

    toggleMiningEl.click();
})();