
function judgeMobile() {
    var docEl = document.documentElement,
        isIOS = navigator.userAgent.match(/iphone|ipod|ipad/gi),
        dpr = isIOS ? Math.min(window.devicePixelRatio, 3) : 1,
        scale = 1 / dpr,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

    docEl.dataset.dpr = dpr;
    var metaEl = document.createElement('meta');
    metaEl.name = 'viewport';
    metaEl.content = 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no';
    docEl.firstElementChild.appendChild(metaEl);

    var recalc = function () {
        var width = docEl.getBoundingClientRect().width;
        if (width / dpr > 750) {
            width = 750 * dpr;
        }
        docEl.style.fontSize = 100 * (width / 750) + 'px';
    };
    recalc();
    if (!document.addEventListener) return;
    window.addEventListener(resizeEvt, recalc, false);
}

export default judgeMobile
