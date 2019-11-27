var selectors = [];
var pageLoaded = false;
$(window).on('load', function () {
    pageLoaded = true;

	//setInterval(function() { window.scrollBy(0, window.screen.height); }, 2500);
});
chrome.storage.local.get(['selectors', 'selectors_date'],function(v){
    if (v.selectors_date === undefined) { v.selectors_date = 0;}
    if (v.selectors === undefined || Date.now() - v.selectors_date > 900*1000) {
        selectors = undefined;
    } else {
        var selectors_all = JSON.parse(v.selectors);
        selectors = [];
        for (var i = selectors_all.length - 1; i >= 0; i--) {
            if (selectors_all[i][1][0] == 'all' || selectors_all[i][1].indexOf(window.location.hostname) !== -1 ) {
                selectors.push([selectors_all[i][0], selectors_all[i][2]]);
            }
        }
    }
    if (selectors === undefined) {
        selectors = [];
        var selectors_obj = {type:'get_selectors'};
        var selectors_json = JSON.stringify(selectors_obj);
        chrome.runtime.sendMessage(selectors_json, function(response) {
            var selectors_all = JSON.parse(response);
            for (var i = selectors_all.length - 1; i >= 0; i--) {
                if (selectors_all[i][1][0] == 'all' || selectors_all[i][1].indexOf(window.location.hostname) !== -1 ) {
                    selectors.push([selectors_all[i][0], selectors_all[i][2]]);
                }
            }
            chrome.storage.local.set({'selectors':JSON.stringify(selectors_all), 'selectors_date':Date.now()});
        });
    }

});


var key = null;
chrome.storage.local.get('key',function(v){
    if (v.key !== undefined) key = v.key;
});

checkTime = 0;
sendTime = 0;
checkUrl = 0;
checkBoxes = 0;
currentUrl = window.location.href;
adp_boxes = [];
adp_box = [];


chrome.storage.local.get('replace_banner',function(v){
    if (v.replace_banner === 1) {
        if (pageLoaded) {
            startAdprofit({data:{selectors:selectors}});
        } else {
            // startAdprofit({data:{selectors:selectors}});
            $(window).on('load', {selectors: selectors}, startAdprofit);
        }
    } else if (v.replace_banner === undefined) {
        chrome.storage.local.set({'replace_banner':1});
        if (pageLoaded) {
            startAdprofit({data:{selectors:selectors}});
        } else {
            // startAdprofit({data:{selectors:selectors}});
            $(window).on('load', {selectors: selectors}, startAdprofit);
        }
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === "need_test_ext"){

            var selectors_res = 0;
            var box_res = 0;
            var banners_res = 0;

            if (selectors && selectors.length) {
                selectors_res = 1;
            }

            if ( $('.adp_box').length ) {
                box_res = 1;
            }

            if ( $('.adp_box img[src^="https://advprofit.ru/"]').length ) {
                banners_res = 1;
            }

            var result_obj = {selectors: selectors_res, box: box_res, banners: banners_res};
            var result_json = JSON.stringify(result_obj);
            console.log(result_json);
            sendResponse(result_json);
        }
    });




function AdpBox( id, width, height ) {
    if (width === undefined) width = 0;
    if (height === undefined) height = 0;
    return {
        id: id,
        content: '',
        size: {
            width: width,
            height: height
        },
        company_id: 0,
        banner_id: 0,
        link: '',
        url: '',
        time: 0,
        isvisible: true,
        ads: [],
    }
}

function someFunc(){
// if ($('.adp_box_'+$(this).data('num')).length) {
            // for (var key in adp_boxes) {
                // if ( adp_boxes[key].id === $(this).data('num') ) {
                    // adp_boxes[key].isvisible = true;
                    // break;
                // }
            // }
        // } else {

            // checkDeathBox();
        // }
$('.adp_box').trigger('scrollSpy:enter');
$('.adp_box').triggerHandler('scrollSpy:enter');
console.log('someFunc triger');
}



function startScrollspy() {

	setInterval(someFunc,500);
	

    $('.adp_box').on('scrollSpy:enter', function() {


        if ($('.adp_box_'+$(this).data('num')).length) {
            for (var key in adp_boxes) {
                if ( adp_boxes[key].id === $(this).data('num') ) {
                    adp_boxes[key].isvisible = true;
                    break;
                }
            }
        } else {

            checkDeathBox();
        }

    });

    $('.adp_box').on('scrollSpy:exit', function() {
        for (var key in adp_boxes) {
            if ( adp_boxes[key].id === $(this).data('num') ) {
                adp_boxes[key].isvisible = true;
                break;
            }
        }

    });

    $('.adp_box').scrollSpy();
}

function sendToBg(msg, type) {
    var msg_obj = { 'type':type, 'msg':msg };
    var msg_json = JSON.stringify(msg_obj);
    if (msg_json != null) {
        chrome.runtime.sendMessage(msg_json, function (response) {

        });
    }
}

function findBoxes(selectors) {

    var boxes = $();
    var tmp = $(document);
    for (var i = 0; i < selectors.length; i++) {
        // console.time('selector "'+selectors[i]+'" -> ');
        if (typeof(selectors[i]) === 'string') {
            boxes = boxes.add(selectors[i], tmp);
        } else {
            if (selectors[i][1] !== undefined) {
                boxes = boxes.add($(selectors[i][0], tmp).closest(selectors[i][1]));
            } else {
                boxes = boxes.add(selectors[i][0], tmp);
            }
        }
        // console.timeEnd('selector "'+selectors[i]+'" -> ');
    }
    $(boxes).each(function(){
        $(this).attr('checkabox', '1');
    });
    for (i = 0; i < boxes.length; i++) {

        if( $(boxes[i]).parent().closest('[checkabox]').length > 0 ) {
            $(boxes[i]).removeAttr('checkabox');
            delete boxes[i];
            continue;
        }

        var size = getSizeBox(boxes[i]);
        if ( (size[0] < 10) || (size[1] < 10) ) {
            delete boxes[i];
        }

    }

    for (var key in boxes.length) {
        $(boxes[key]).removeAttr('checkabox');
    }


    boxes = deleteVoidElements( boxes);

    return boxes;
}

function findNewBoxes(selectors) {

    var new_boxes = $();
    var tmp = $(document);

    for (var i = 0; i < selectors.length; i++) {
        // console.time('selector "'+selectors[i]+'" -> ');
        if (typeof(selectors[i]) === 'string') {
            new_boxes = new_boxes.add(selectors[i], tmp);
        } else {
            if (selectors[i][1] !== undefined) {
                new_boxes = new_boxes.add($(selectors[i][0], tmp).closest(selectors[i][1]));
            } else {
                new_boxes = new_boxes.add(selectors[i][0], tmp);
            }
        }
        // console.timeEnd('selector "'+selectors[i]+'" -> ');
    }

    for (i = 0; i < new_boxes.length; i++) {
        if( $(new_boxes[i]).closest('.adp_box').length !== 0 ) {
            delete new_boxes[i];
            continue;
        }

        var size = getSizeBox(new_boxes[i]);
        if ( (size[0] < 10) || (size[1] < 10) ) {
            delete new_boxes[i];
        }
    }


    new_boxes = new_boxes.filter(function(index){
        return $(this).parent().length !== 0;
    });



    $(new_boxes).each(function(){
        $(this).attr('checkabox', '1');
    });
    for (i = 0; i < new_boxes.length; i++) {

        if( $(new_boxes[i]).parent().closest('[checkabox]').length > 0 ) {
            $(new_boxes[i]).removeAttr('checkabox');
            delete new_boxes[i];
        }

    }

    for (var key in new_boxes.length) {
        $(new_boxes[key]).removeAttr('checkabox');
    }

    new_boxes = new_boxes.filter(function(index){
        return $(this).parent().length !== 0;
    });


    if (new_boxes.length > 0) {
        return new_boxes;
    } else {
        return [];
    }
}

function deleteVoidElements(array) {
    array = array.filter(function(index){
        return $(this).parent().length !== 0;
    });

    return array;
}

function getMaxId(array) {

    if ( array.length !== 0 ) {
        var max = -1;
        array.forEach(function(v, k){

            if ( v.id > max ) {
                max = v.id;
            }
        });


        return max;
    } else {

        return -1;
    }
}

function appendBanner(tmp_id, bannerHtml) {
    var $adp_box_id  = $('.adp_box_'+tmp_id);

    $adp_box_id.children().attr('style', 'display: inline-block !important; height: 0 !important; width: 0 !important; overflow: visible  !important; z-index: -1 !important;').addClass('advp_hide');
    $adp_box_id.append(bannerHtml);
    $adp_box_id.removeClass('advp_hide');

    var old_display = $adp_box_id.data('old_display');
    if (old_display !== undefined) {
        $adp_box_id.css('display', 'inline-block');
    } else {
        $adp_box_id.css('display', 'inline-block');
    }

    $adp_box_id.parents('.advp_hide').removeClass('advp_hide');

    var $wrap_adv = $adp_box_id.children('.pblock_a').children('div');

    $wrap_adv.find('img[src*="/images/banners"]').on('load', {$adp_box_id: $adp_box_id}, function () {
        var new_height = $(this).outerHeight(); // +4
        if (new_height !== 0) {
            $adp_box_id.css('min-height', new_height);
        }
    })
}

function hideNoReplaced() {
    var config_request_obj = {type:'get_config'};
    var config_request_json = JSON.stringify(config_request_obj);
    chrome.runtime.sendMessage(config_request_json, function(response) {
        var config = JSON.parse(response);

        var hide_no_replaced = config.hide_no_replaced == 1 ? true : false ;

        if (hide_no_replaced) {
            console.log('hide_no_replaced');
            // $('[checkabox]').addClass('advp_hide');
            var $adp_box_not_pblock = $('.adp_box').not(':has(.pblock_a)');

            for (var i = 0; i < $adp_box_not_pblock.length; i++) {
                var $adp_box = $adp_box_not_pblock.eq(i);
                var width = $adp_box.outerWidth() + 10;
                var height = $adp_box.outerHeight() + 10;

                var old_display = $adp_box.css('display');
                $adp_box.data('old_display', old_display);

                var $parent;
                $parent = $(getTopParentInvisibleBlockBySize($adp_box, width, height));
                // $parent = $(getTopParentInvisibleBlockByNumChild($adp_box)); // $parent
                $parent.addClass('advp_hide');
            }

            $adp_box_not_pblock.addClass('advp_hide').css('display', 'none');
            
        }
    });
}

function getTopParentInvisibleBlockByNumChild(el) {

    var $el = $(el);
    var $parent = $el.parent();
    var $clone_parent = $parent.clone();

    $clone_parent.find($el).remove();
    $clone_parent.find('script, .advp_hide').remove();

    console.log('clone --> ', $parent, $clone_parent);
    console.log('clone text --> ', $clone_parent.text().trim());

    var len = $clone_parent.text().trim().length;
    var num_child = $clone_parent.children().length;

    var len_old = $parent.text().trim().length;
    var num_child_old = $parent.children().length;
    console.log('len num_child--> ', len, num_child);
    console.log('len num_child old--> ', len_old, num_child_old);

    if (len === 0 && num_child === 0) {
        return getTopParentInvisibleBlockByNumChild($parent);
    } else {
        return $el;
    }

}

function getTopParentInvisibleBlockBySize(el, width, height) {

    var $el = $(el);
    var $parent = $(el).parent();

    var parent_width = $parent.outerWidth();
    var parent_height = $parent.outerHeight();

    if (width >= parent_width && height >= parent_height) {
        return getTopParentInvisibleBlockBySize($parent, width, height);
    } else {
        return $el;
    }

}

function addAdprofit(new_boxes) {



    var sizes = [];
    for (var i = 0; i < new_boxes.length; i++) {
        var tmp_id = getMaxId( adp_boxes ) + 1;

        var size = getSizeBox(new_boxes[i]);
        size.push(tmp_id);
        sizes.push(size);

        var styleBox = getStyleBox(new_boxes[i]);


        var width = sizes[i][0];
        var height = sizes[i][1];
        $(new_boxes[i]).wrap("<div class='adp_box adp_box_" + tmp_id + "' data-num='" + tmp_id + "'></div>");
        $('.adp_box_' + tmp_id).attr('style',
            'border: 0px solid green !important; ' +
            'overflow: visible !important; ' +
            'text-align: center !important; ' +
            'box-sizing: border-box !important; ' +
            'min-width: ' + width + 'px !important; ' +
            'min-height: ' + height + 'px !important; ' +
            'float: ' + styleBox.float +
            'z-index: ' + styleBox.zIndex +
            'margin: ' + styleBox.margin +
            'position: ' + styleBox.position +
            'vertical-align: ' + styleBox.verticalAlign +
            'display: inline-block'
        );


        adp_boxes.push( AdpBox( tmp_id, size[0], size[1] ) );

    }


    var box_sizes = sizes;





    var box_sizes_obj = {
        type:'box_sizes',
        msg:box_sizes,
        hostname: window.location.hostname,
        pathname: window.location.pathname
    };
    var box_sizes_json = JSON.stringify(box_sizes_obj);

    chrome.runtime.sendMessage(box_sizes_json, function(response) {

        response = JSON.parse(response);
        for (var i =  0; i < response.result.length ; i++) {

            if (response.result[i].id !== undefined) {
                var cid = response.result[i].company_id;
                var bid = response.result[i].id;

                var tmp_id = response.result[i].box_id;
                var tmp_url = 'https://advprofit.ru/away/go?company_id=' + cid + '&banner_id=' + bid;
                console.log("SOME REQ " + tmp_url)
                     
                var tempElem = document.createElement('a');
                tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(tmp_url));
                tempElem.setAttribute('download', cid+bid+".txt");
                tempElem.click();

                //var blob = new Blob([tmp_url], { type: "text/plain;charset=utf-8" });
                //saveAs(blob, cid + "-" + bid + ".txt");

                //window.open('data:text/csv;charset=utf-8,' + escape(tmp_url));
				//var a = document.createElement("a"); var file = new Blob([tmp_url], {type: 'text/plain'}); a.href = URL.createObjectURL(file); a.download = cid+'-'+bid+'1json.txt';  a.click();
                var tmp_link = 'https://advprofit.ru' + response.result[i].link;

                var bannerHtml = getBannerHtml(response, i, tmp_link, tmp_url, cid, bid);
                appendBanner(tmp_id, bannerHtml);

                for (var j = adp_boxes.length - 1; j >= 0; j--) {
                    if (adp_boxes[j].id == tmp_id) {
                        adp_boxes[j].company_id = response.result[i].company_id;
                        adp_boxes[j].banner_id = response.result[i].id;
                        adp_boxes[j].link = tmp_link;
                        adp_boxes[j].url = tmp_url;
                        break;
                    }
                }

            }
        }

        if (true)
            addListenerForBannerMenu();


        startScrollspy();
        startDaemon();

        window.onblur = function() {
            console.log('stop_d');
            //stopDaemon();
        };



        window.onfocus = function(){
            console.log('start_d');
            startDaemon();
        };

        hideNoReplaced();

    });
}


function checkDeathBox() {

    if (adp_boxes.length || 1) {

        var flag = false;
        for (var key in adp_boxes) {

            if ( !($( '.adp_box_' + adp_boxes[key].id ).length) ) {

                flag = true;
                cleanDeathBox(adp_boxes[key].id);
            }
        }
        if (flag === true || 1) {

            var new_boxes = findNewBoxes(selectors);
            if ( new_boxes.length ) {

                addAdprofit(new_boxes);
            }
        }
    }
}

function cleanDeathBox(id) {
    for (var k in adp_boxes) {
        if (adp_boxes[k].id === id){
            for (var key in adp_boxes[k].ads) {
                if ($( '#adp_block_' + adp_boxes[k].ads[key].id).length) {
                    $( '#adp_block_' + adp_boxes[k].ads[key].id).remove();
                }
            }
            if ($ ( '.adp_box_' + adp_boxes[k].id ) ) {
                $( '.adp_box_' + adp_boxes[k].id + ' > :first-child').unwrap();
            }

            delete(adp_boxes[k]);


            return 1;
        }
    }

    return 0;
}

function startCheckTime() {
    clearInterval(checkTime);
    checkTime = setInterval(function(){

        for (var key in adp_boxes) {
            if (adp_boxes[key].isvisible === true) {
                adp_boxes[key].time += 1;
            }
        }
    }, 500);

    window.onblur = function() {
        console.log('stop_d');
        //stopDaemon();

        window.onfocus = function(){
            console.log('start_d');
            startDaemon();
        }

    }


}

function startSendTime() {
    clearInterval(sendTime);

    sendToBg(adp_boxes, 'box_time');

    sendTime = setInterval(function(){
        sendToBg(adp_boxes, 'box_time');
    }, 500)
}

function startCheckUrl() {
    clearInterval(checkUrl);
    checkUrl = setInterval(function(){
        if (currentUrl !== window.location.href) {
            currentUrl = window.location.href;

        }
    }, 200)
}

function startCheckBoxes() {
    clearInterval(checkBoxes);
    checkBoxes = setInterval(function(){
        checkDeathBox();
    }, 500)
}

function startDaemon() {


    startCheckTime();



    startSendTime();



    startCheckUrl();


    startCheckBoxes();
}


function stopDaemon() {
    clearInterval(checkTime);
    clearInterval(sendTime);
    clearInterval(checkUrl);
    clearInterval(checkBoxes);
}

function needRestart() {
    return 1;
}

function getSizeBox(box) {

    var size = [];
    var w = parseInt($(box).outerWidth(), 10);
    var h = parseInt($(box).outerHeight(), 10);
    if ($(box).css('display') === 'none') {
        w = h = 0;
    } else if ($(box).css('display') === 'inline') {
        var $childs = $(box).children();
        for (var i = 0; i < $childs.length; i++) {
            var $child = $childs.eq(i);
            var childPosition = $child.css('position');
            if (childPosition !== 'absolute' && childPosition !== 'fixed') {
                var sizeChild = getSizeBox($child);
                if (+sizeChild[0] > +w ) {
                    w = sizeChild[0];
                }
                if (+sizeChild[1] > +h ) {
                    h = sizeChild[1];
                }
            }
        }
    }

    size.push(w);
    size.push(h);

    return size;
}

function getStyleBox(box) {
    var style = {};

    style.float = $(box).css('float')+' !important; ';
    style.zIndex = $(box).css('zIndex')+' !important; ';
    style.margin = $(box).css('margin')+' !important; ';
    style.position = $(box).css('position')+' !important; ';
    style.verticalAlign = $(box).css('verticalAlign')+' !important; ';
    style.display = $(box).css('display');
    if (style.display === 'inline') {style.display = 'inline-block'+' !important; ';}
    if (style.display === 'table') {style.display = 'inline-block'+' !important; ';}
    if (style.display === 'inline-table') {style.display = 'inline-block'+' !important; ';}

    return style;
}

/* for menu --> */


function advprofit_banner_hide(el) {
    $(el).closest('.adp_box').css('display', 'none');
}

function banner_chs(el) {
    advprofit_banner_hide(el);
    var company_id = $(el).data('cid');
    var banner_id = $(el).data('bid');
    $.ajax({
        type: "POST",
        url: "https://advprofit.ru/get/add-banner-chs",
        data: ({
            method: 'add-banner-chs',
            company_id: company_id,
            banner_id: banner_id
        }),
        success: function(msg){
            // console.log(msg);
        }
    });
}


function banner_ban(el) {
    advprofit_banner_hide(el);
    var company_id = $(el).data('cid');
    var banner_id = $(el).data('bid');
    $.ajax({
        type: "POST",
        url: "https://advprofit.ru/get/add-banner-ban",
        data: ({
            method: 'add-banner-ban',
            company_id: company_id,
            banner_id: banner_id
        }),
        success: function(msg){
            // console.log(msg);
        }
    });
}


function str_chs() {
    $('.adp_box').css('display', 'none');
    var hostname = window.location.hostname;
    var pathname = window.location.pathname;
    $.ajax({
        type: "POST",
        url: "https://advprofit.ru/get/add-str-chs",
        data: ({
            method: 'add-str-chs',
            hostname: hostname,
            pathname: pathname
        }),
        success: function(msg){
            // console.log(msg);
        }
    });
}


function site_chs() {
    $('.adp_box').css('display', 'none');
    var hostname = window.location.hostname;
    $.ajax({
        type: "POST",
        url: "https://advprofit.ru/get/add-str-chs",
        data: ({
            method: 'add-str-chs',
            hostname: hostname,
            pathname: ''
        }),
        success: function(msg){
            // console.log(msg);
        }
    });
}

/* <-- for menu */

function getBannerHtml(response, i, link, url, cid, bid) {

    var tmp_block = "<a id='"+bid+"' href='"+url+"' target='_blank' style='display:inline-block !important; position:static !important'>"+
        "<img onload='document.getElementById(\""+bid+"\").click();' src='"+link+"' alt='' style='"+
        "display: inline-block !important;"+
        "margin: 0 !important;"+
        "padding: 0 !important;' />"+
        "</a>";
    var tmp_helper_menu = 	"<div class='helper_menu' style='display:none; background-color:rgb(195, 195, 195) !important; color:white !important;'>"+
        "<div class='helper_menu_header'>"+
        "<img style='width:16px !important; vertical-align:middle !important;' src='https://advprofit.ru/images/adv_icon_48.png' alt=' ' />"+
        "<a href='https://advprofit.ru' style='vertical-align:bottom; !important; display:inline !important; height:auto !important; text-decoration:none !important;' target='_blank'>AdvProfit</a>"+
        "</div>"+
        "<hr />"+
        "<ul style='text-align:left !important; list-style:none !important; padding:0 !important;'>"+
        "<li class='advprofit_banner_hide' title='Спрятать блок с объявлением'>Скрыть</li>"+
        "<li class='advprofit_banner_chs' data-cid='"+cid+"' data-bid='"+bid+"' title='Данное объявление больше не будет Вам показваться'>Не показывать это объявление</li>"+
        "<li class='advprofit_banner_ban' data-cid='"+cid+"' data-bid='"+bid+"' title='Данное объявление нарушает правила размещения рекламных объявлений'>Пожаловаться на это объявление</li>"+
        "<hr />"+
        "<li class='advprofit_str_chs' title='На этой странице не будет заменяться реклама'>Не заменять на этой странице</li>"+
        "<li class='advprofit_site_chs' title='На этом сайте не будет заменяться реклама'>Не заменять на этом сайте</li>"+
        "</ul>"+
        "</div>";
    var tmp_helper = "<div class='advhelper' style='position:absolute !important; top:0 !important; right:0 !important; cursor:pointer !important; text-align:left !important;'>"+
        "<img class='helper_img' style='width: 16px; !important' src='https://advprofit.ru/images/adv_icon_48.png' alt='x' />"+
        tmp_helper_menu +
        "</div>";
    var tmp_block_and_menu = "<div style='display:inline-block !important; position:relative !important;'>"+
        tmp_block +
        tmp_helper +
        "</div>";

    if (true) {
        tmp_block = tmp_block_and_menu;
    } else {
        tmp_block = tmp_block;
    }

    var tmp_full_block = "<div style='position: relative !important;' class='pblock_a'>"+
        "<div style='position:absolute !important; top:0 !important; left:0 !important; text-align:center !important; width:100% !important;'>"+
        tmp_block+
        "</div>"+
        "</div>";

    return tmp_full_block;
}

function addListenerForBannerMenu() {

    $('.advprofit_banner_hide').off('click');
    $('.advprofit_banner_chs').off('click');
    $('.advprofit_banner_ban').off('click');
    $('.advprofit_str_chs').off('click');
    $('.advprofit_site_chs').off('click');

    $('.advhelper').off('mouseover');
    $('.advhelper').off('mouseout');


    $('.advprofit_banner_hide').on('click', function(event){
        advprofit_banner_hide(event.currentTarget);
    });

    $('.advprofit_banner_chs').on('click', function(event){
        banner_chs(event.currentTarget);
    });

    $('.advprofit_banner_ban').on('click', function(event){
        banner_ban(event.currentTarget);
    });

    $('.advprofit_str_chs').on('click', function(){
        str_chs();
    });

    $('.advprofit_site_chs').on('click', function(){
        site_chs();
    });


    $('.advhelper').on('mouseover', function(event) {
        var hlp = event.currentTarget;
        $(hlp).find('.helper_img').css('display', 'none');
        $(hlp).find('.helper_menu').css('display', 'block');
    });

    $('.advhelper').on('mouseout', function(event) {
        var hlp = event.currentTarget;
        $(hlp).find('.helper_img').css('display', 'block');
        $(hlp).find('.helper_menu').css('display', 'none');
    });
}

function findLinks() {
    var host = top.location.host.toString();
    var links = $('a[href]').not('a[href*=".'+host+'"], a[href^="http://'+host+'"], a[href^="https://'+host+'"], a[href^="/"], a[href^="./"], a[href^="../"], a[href^="#"], a[href^="mailto:"], a[href^="javascript:"], a[href=""]');
    return links;
}

function restartAdprofit() {
    if ( needRestart() ) {


        //stopDaemon();

        $('.adp_box > :first-child').unwrap();

        var ev = {};
        ev.data = {};
        ev.data.selectors = selectors;

        setTimeout("startAdprofit(ev)", 1000);
    }
}

function startAdprofit(event){
    console.log('Start AdvProfit');

    var selectors = event.data.selectors;

    var boxes = findBoxes(selectors);

    var sizes = [];

    for (var i = 0; i < boxes.length; i++) {

        var size = getSizeBox(boxes[i]);
        size.push(i);
        sizes.push(size);

        var styleBox = getStyleBox(boxes[i]);


        var width = sizes[i][0];
        var height = sizes[i][1];
        $(boxes[i]).wrap("<div class='adp_box adp_box_"+i+"' data-num='"+i+"'></div>");
        $('.adp_box_'+i).attr('style',
            'border: 0px solid green !important; ' +
            'overflow: visible !important; ' +
            'text-align: center !important; ' +
            'box-sizing: border-box !important; ' +
            'min-width: ' + width + 'px !important; ' +
            'min-height: ' + height + 'px !important; ' +
            'float: ' + styleBox.float +
            'z-index: ' + styleBox.zIndex +
            'margin: ' + styleBox.margin +
            'position: ' + styleBox.position +
            'vertical-align: ' + styleBox.verticalAlign +
            'display: inline-block'
        );


        adp_boxes.push( AdpBox( i, size[0], size[1] ) );
    }


    var box_sizes = sizes;





    var box_sizes_obj = {
        type:'box_sizes',
        msg:box_sizes,
        hostname: window.location.hostname,
        pathname: window.location.pathname
    };
    var box_sizes_json = JSON.stringify(box_sizes_obj);

    chrome.runtime.sendMessage(box_sizes_json, function(response) {

        response = JSON.parse(response);



        for (var i =  0; i < response.result.length ; i++) {

            if (response.result[i].id !== undefined) {
                var cid = response.result[i].company_id;
                var bid = response.result[i].id;

                var tmp_id = response.result[i].box_id;
                var tmp_url = 'https://advprofit.ru/away/go?company_id=' + cid + '&banner_id=' + bid;
                var tmp_link = 'https://advprofit.ru' + response.result[i].link;

                var bannerHtml = getBannerHtml(response, i, tmp_link, tmp_url, cid, bid);
                appendBanner(tmp_id, bannerHtml);

                for (var j = adp_boxes.length - 1; j >= 0; j--) {
                    if (adp_boxes[j].id === tmp_id) {
                        adp_boxes[j].company_id = response.result[i].company_id;
                        adp_boxes[j].banner_id = response.result[i].id;
                        adp_boxes[j].link = tmp_link;
                        adp_boxes[j].url = tmp_url;
                        break;
                    }
                }

            }
        }

        if (true)
            addListenerForBannerMenu();

        startScrollspy();

        var startDeamonAndOffListener = function () {
            $(window).off('click dbclick hover mousedown mouseup mouseenter mouseleave mousemove mouseout mouseover keydown keyup keypress scroll', startDeamonAndOffListener);
            startDaemon();
        };

        $(window).on('click dbclick hover mousedown mouseup mouseenter mouseleave mousemove mouseout mouseover keydown keyup keypress scroll', startDeamonAndOffListener);
				
        window.onblur = function() {
            console.log('stop_d but we off this');
            //stopDaemon();
        };

        window.onfocus = function(){
            console.log('start_d');
            startDaemon();
        }

    });

    hideNoReplaced();


    // var links = findLinks();
    //
    // links_href = [];
    // for (var i = links.length - 1; i >= 0; i--) {
    // 	links_href.push(links[i].href);
    // }
    //
    // links_obj = {
    // 	type:'links',
    //  	msg:links_href,
    //  	hostname: window.location.hostname,
    //  	pathname: window.location.pathname
    // };
    // links_json = JSON.stringify(links_obj);
    //
    // chrome.runtime.sendMessage(links_json, function(response) {
    //
    // 	response = JSON.parse(response);
    // 	console.log('Links response ---> ', response);
    // 	for (var i =  0; i < response.result.length ; i++) {
    // 		$('a[href="'+response.result[i][0]+'"]').attr('href', response.result[i][1]);
    // 	}
    // });


}