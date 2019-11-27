var mem = {};
mem.parts_timer = {};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('do -> ', request);
        request = JSON.parse(request);
        var hostname = request.hostname;
        var pathname = request.pathname;
        if (request.type == 'box_sizes') {

            // запрос блоков на сервере
            request = JSON.stringify(request.msg);

            console.log('request --> ', typeof(request));

            if (request.length <= 2) {
                sendResponse('{"time":0,"msg":"Not banner for replace (user)","result":[]}');
                console.log('auto response');
                return;
            }

            $.ajax({
                type: "GET",
                url: "https://advprofit.ru/get/banner",
                data: ({
                    request: request,
                    getBanners: '1',
                    hostname: hostname,
                    pathname: pathname,
                    t: (new Date()).valueOf()
                }),
                success: function (msg) {
                    console.log('Banners --> ', msg);

                    if (msg != '') {
                        msg_json = msg;
                        msg = JSON.parse(msg);

                        if (msg.config !== undefined){
                            chrome.storage.local.set({'config':JSON.stringify(msg.config), 'config_date':Date.now()});
                        }

                        if (!msg.error) {
                            sendResponse(msg_json);
                        } else {

                        }

                    }
                }
            });
            return true;

        } else if (request.type == 'get_selectors') {

            // запрос селекторов на сервере
            $.ajax({
                type: "GET",
                url: "https://advprofit.ru/get/selector",
                data: ({
                    getSelectors: '1',
                    v: 140,
                    t: (new Date()).valueOf()
                }),
                success: function (msg) {
                    if (msg != '') {
                        msg_json = msg;
                        msg = JSON.parse(msg);

                        if (!msg.error) {
                            chrome.storage.local.set({'selectors':JSON.stringify(msg), 'selectors_date':Date.now()});
                            sendResponse(msg_json);
                        } else {

                        }

                    }
                }
            });
            return true;

        } else if (request.type == 'box_time') {

            for (var i = request.msg.length - 1; i >= 0; i--) {
                if (!request.msg[i].isvisible || !(request.msg[i].company_id && request.msg[i].banner_id)) {
                    continue;
                }

                var cur_time = (new Date()).valueOf();

                var cid = request.msg[i].company_id;
                var bid = request.msg[i].banner_id;

                var part_key = 'part_' + bid;

                if (mem.parts_timer[part_key] === undefined) {
                    mem.parts_timer[part_key] = {};
                }

                var part = mem.parts_timer[part_key];

                if (request.msg[i].time >= 10 && request.msg[i].time < 12) {

                    var url = 'https://advprofit.ru/away/view?company_id=' + cid + '&banner_id=' + bid + '&t=' + cur_time + '&full=1';
                    $.get(url);

                    part.count = 0;
                    part.update = cur_time;


                } else if (request.msg[i].time > 0 && request.msg[i].time <= 10) {

                    part.count = (part.count === undefined) ? 1 : (Math.round((cur_time - part.update)/1000) >= 2) ? part.count + 1 : part.count;
                    part.update = cur_time;

                    if (part.count >= 6) {
                        part.count = 0;
                        part.update = cur_time;

                        var url = 'https://advprofit.ru/away/view?company_id=' + cid + '&banner_id=' + bid + '&t=' + cur_time + '&part=1';
                        $.get(url)
                    }

                }

            }
            sendResponse("Информация о времени получена");

        } else if (request.type == 'links') {

            // запрос ссылок на сервере
            request = JSON.stringify(request.msg);
            $.ajax({
                type: "POST",
                url: "https://advprofit.ru/get/links",
                data: ({
                    request: request,
                    getLinks: '1',
                    hostname: request.hostname,
                    pathname: request.pathname,
                    t: (new Date()).valueOf()
                }),
                success: function (msg) {

                    if (msg != '') {
                        msg_json = msg;
                        msg = JSON.parse(msg);

                        if (!msg.error) {
                            sendResponse(msg_json);
                        } else {

                        }

                    }
                }
            });
            return true;

        } else if (request.type == 'get_config') {

            // запрос конфига на сервере
            request = JSON.stringify(request.msg);
            var config;

            chrome.storage.local.get(['config', 'config_date'],function(v){
                if (v.config_date === undefined) { v.config_date = 0;}

                if (v.config === undefined || Date.now() - v.config_date > 900*1000) {
                    config = undefined;
                } else {
                    sendResponse(v.config);
                    return;
                }

                if (config === undefined) {
                    $.ajax({
                        type: "GET",
                        url: "https://advprofit.ru/get/config",
                        data: ({
                            getConfig: '1',
                            t: (new Date()).valueOf()
                        }),
                        success: function (msg) {

                            if (msg != '') {
                                msg_json = msg;
                                msg = JSON.parse(msg);

                                if (!msg.error) {
                                    chrome.storage.local.set({'config':JSON.stringify(msg), 'config_date':Date.now()});
                                    sendResponse(msg_json);
                                    return;
                                } else {

                                }

                            }
                        }
                    });
                }
            });

            return true;

        } else {

            console.log('undeclareted type request on backgrond.js');

        }
        //
        request = JSON.stringify(request);

    }
);