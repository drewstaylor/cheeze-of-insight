if (!window.sessionStorage.getItem('splash')) {
    var loadingLen = 0;
    var loadingTxt = 'coi --launch';

    function cursorAnimation() {
        $('#cursor').animate({
            opacity: 0
        }, 'fast', 'swing').animate({
            opacity: 1
        }, 'fast', 'swing');
    }

    function type() {
        $('#loading-text').html(loadingTxt.substr(0, loadingLen++));
        if (loadingLen < loadingTxt.length+1) {
            setTimeout('type()', 50);
        }
    }

    setInterval('cursorAnimation()', 600);
    setTimeout('type()', 1000);
    window.sessionStorage.setItem('splash', true);
} else {
    $('#splash').remove();
}
