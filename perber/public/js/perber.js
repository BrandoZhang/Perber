/* 
* @Author: hanjiyun
* @Date:   2013-11-02 18:53:14
* @Last Modified by:   hanjiyun
* @Last Modified time: 2013-12-24 16:04:11
*/


$(function() {
    var USERS = window.USERS = {},
        windowStatus,
        afkDeliveredMessages = 0,
        roomName = $('#room_name').text();

    // First update the title with room's name
    updateTitle();

    focusInput();


    // Then check users online!
    $('.people a').each(function(index, element) {
        USERS[$(element).data('provider') + ":" + $(element).data('username')] = 1;
    });

  //View handlers
    $(".dropdown a.selected").click(function() {
        $('.create-room').show().next("form .text").hide();
        $(this).toggleClass("active");
        $(this).next(".dropdown-options").toggle();
    });

    $(".create-room").click(function() {
        $(this).hide();
        $(this).next(".text").fadeIn();
    });

    $(".lock").click(function() {
        $(this).toggleClass('active');
    });

    // $(".fancybox").fancybox({'margin': 0, 'padding': 0});

    $(".invite-people").click(function(){
        $(this).hide().after('<p class="inviting-people">Inviting peple, please wait.</p>').delay(2000).hide().after('something');
    });

/*
=================
    Socket.io
=================
*/

    var socket = io.connect("", {
        "connect timeout": 1000
    });

    socket.on('error', function (reason){
        console.error('Unable to connect Socket.IO !!', reason);
    });

    socket.on('connect', function (){
        console.info('successfully established a working connection');

        if($('.chat .chat-box').length == 0) {
            // console.log('加载历史记录')
            socket.emit('history request');
        } else {
            // console.log('有数据11')
        }
    });



/*
history respinse
*/
    socket.on('history response', function(data) {

        if(data.history && data.history.length) {

            var $lastInput,
                lastInputUser;

            // console.log(data.history.length)

            data.history.forEach(function(historyLine) {

                // check lang
                var lang;

                if(isChinese(historyLine.withData)){
                    lang = 'en';
                } else {
                    lang = 'cn';
                }

                var time = new Date(historyLine.atTime),
                    msnData = historyLine.from.split(':'),
                    nickname = msnData.length > 1 ? msnData[1] : msnData[0],
                    provider = msnData.length > 1 ? msnData[0] : "twitter",
                    chatBoxData = {
                        nickname: nickname,
                        provider: provider,
                        msg: historyLine.withData,
                        type: 'history',
                        lang : lang,
                        time: time.format("yyyy-MM-dd hh:mm:ss")
                    };

                // console.log(historyLine)


                // $lastInput = $('.chat .history').children().last();
                // lastInputUserKey = $lastInput.data('provider') + ':' + $lastInput.data('user');

                // if($lastInput.hasClass('chat-box') && lastInputUserKey === chatBoxData.provider + ':' + chatBoxData.nickname) {
                    // $lastInput.append(parseChatBoxMsg(ich.chat_box_text(chatBoxData)));
                // } else {
                    $('.chat').append(parseChatBox(ich.chat_box(chatBoxData)));
                // }

                $('.chat').scrollTop($('.chat').prop('scrollHeight'));
            });

            $('.time').timeago();
            masonryHistory($('.chat'));
            hideLoading();
            // console.log('loading hiden')
        }
    });


/*
new user
*/
    // socket.on('new user', function(data) {
    //     var message = "$username has joined the room.";

    //     //If user is not 'there'
    //     if(!$('.people a[data-username="' + data.nickname + '"][data-provider="' + data.provider + '"]').length) {
    //         //Then add it
    //         $('.online .people').prepend(ich.people_box(data));
    //         USERS[data.provider + ":" + data.nickname] = 1;

    //         // Chat notice
    //         message = message.replace('$username', data.nickname);

    //         // Check update time
    //         var time = new Date(),
    //             noticeBoxData = {
    //             user: data.nickname,
    //             noticeMsg: message,
    //             time: time
    //         };

    //         var $lastChatInput = $('.chat .current').children().last();

    //         if($lastChatInput.hasClass('notice') && $lastChatInput.data('user') === data.nickname) {
    //             $lastChatInput.replaceWith(ich.chat_notice(noticeBoxData));
    //         } else {
    //             $('.chat .current').append(ich.chat_notice(noticeBoxData));
    //             $('.chat').scrollTop($('.chat').prop('scrollHeight'));
    //         }
    //     } else {
    //         //Instead, just check him as 'back'
    //         USERS[data.provider + ":" + data.nickname] = 1;
    //     }
    // });



/*
user-info update
*/
/*
    socket.on('user-info update', function(data) {
        var message = "$username is now $status.";

        // Update dropdown
        if(data.username === $('#username').text() && data.provider === $('#provider').text()) {
            $('.dropdown-status .list a').toggleClass('current', false);
            $('.dropdown-status .list a.' + data.status).toggleClass('current', true);

            $('.dropdown-status a.selected').removeClass('available away busy');

            $('.dropdown-status a.selected').addClass(data.status).html('<b></b>' + data.status);
        }

        // Update users list
        $('.people a[data-username=' + data.username + '][data-provider="' + data.provider + '"]').removeClass('available away busy').addClass(data.status);

        // Chat notice
        message = message.replace('$username', data.username).replace('$status', data.status);

        // Check update time
        var time = new Date(),
        noticeBoxData = {
            user: data.username,
            noticeMsg: message,
            time: time
        };

        var $lastChatInput = $('.chat .current').children().last();
      
        if($lastChatInput.hasClass('notice') && $lastChatInput.data('user') === data.username) {
            $lastChatInput.replaceWith(ich.chat_notice(noticeBoxData));
        } else {
            $('.chat .current').append(ich.chat_notice(noticeBoxData));
            $('.chat').scrollTop($('.chat').prop('scrollHeight'));
        }
    });
*/




/*
new msg
*/
    socket.on('new msg', function(data) {
        var time = new Date();
        // var $lastInput = $('.chat .current').children().last(),
        //     lastInputUserKey = $lastInput.data('provider') + ':' + $lastInput.data('user');

        data.type = 'chat';
        data.time = time;

        // check lang

        if(isChinese(data.msg)){
            data.lang = 'en';
        } else {
            data.lang = 'cn';
        }


        // if($lastInput.hasClass('chat-box') && lastInputUserKey === data.provider + ':' + data.nickname) {
            // $lastInput.prepend(parseChatBoxMsg(ich.chat_box_text(data)));
        // } else {
            // $('.chat').prepend(parseChatBox(ich.chat_box(data)));
        // }

        var $boxes = parseChatBox(ich.chat_box(data));
        if($('.chat .chat-box').length == 0) {
             $('.chat').prepend( $boxes )
         } else {
            $('.chat').prepend( $boxes ).masonry('prepended', $boxes)
         }

         masonryHistory($('.chat'));

        $('.chat').scrollTop($('.chat').prop('scrollHeight'));

        $(".time").timeago();

        // removeNull()

        //update title if window is hidden
        if(windowStatus == "hidden") {
            afkDeliveredMessages +=1;
            updateTitle();
        }
    });



/*
user leave
*/
    // socket.on('user leave', function(data) {
    //     var nickname = $('#username').text(),
    //         message = "$username has left the room.";

    //     for (var userKey in USERS) {
    //         if(userKey === data.provider + ":" + data.nickname && data.nickname != nickname) {
    //             //Mark user as leaving
    //             USERS[userKey] = 0;

    //             //Wait a little before removing user
    //             setTimeout(function() {
    //                 //If not re-connected
    //                 if (!USERS[userKey]) {
    //                     //Remove it and notify
    //                     $('.people a[data-username="' + data.nickname + '"][data-provider="' + data.provider + '"]').remove();

    //                     // Chat notice
    //                     message = message.replace('$username', data.nickname);

    //                     // Check update time
    //                     var time = new Date(),
    //                     noticeBoxData = {
    //                         user: data.nickname,
    //                         noticeMsg: message,
    //                         time: time
    //                     };

    //                     var $lastChatInput = $('.chat .current').children().last();

    //                     if($lastChatInput.hasClass('notice') && $lastChatInput.data('user') === data.nickname) {
    //                         $lastChatInput.replaceWith(ich.chat_notice(noticeBoxData));
    //                     } else {
    //                         $('.chat .current').append(ich.chat_notice(noticeBoxData));
    //                         $('.chat').scrollTop($('.chat').prop('scrollHeight'));
    //                     }
    //                 };
    //             }, 2000);
    //         }
    //     }
    // });






/*
=================
   Say
=================
*/

    $(".chat-input textarea").keypress(function(event) {
        // todo
        var inputText = $(this).val().trim().replace(/\r\n/gi, '');//.replace('\n', '').replace('\r','').replace(' ','');
        // console.log(inputText)


        switch (event.keyCode) {
            case 13:
                // console.log('回车')
                if (!event.shiftKey && inputText){
                    // var inputText = $(this).val().trim()
                    // console.log('发送信息')
                    // Activity.addActivity($scope.message);

                    socket.emit('my msg', {
                        msg: inputText
                    });
                    // $timeout(function(){
                    //     $scope.message = '';
                    // })
                    $(this).val('');

                    return false;
                }
                break;
            case 8: // 退格 backspace
            case 46: // 删除 delete
        }

        // if(e.which == 13 && inputText) {
        //     var chunks = inputText.match(/.{1,1024}/g),
        //     len = chunks.length;

        //     for(var i = 0; i<len; i++) {
        //         socket.emit('my msg', {
        //             msg: chunks[i]
        //         });
        //     }


        // }
    });

    // $('.dropdown-status .list a.status').click(function(e) {
    //     socket.emit('set status', {
    //         status: $(this).data('status')
    //     });
    // });

    var textParser = function(text) {
        // link
        text = text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,"<a href=\"$1\" target='_blank'>$1</a>").replace(/(@)([a-zA-Z0-9_]+)/g, "<a href=\"http://twitter.com/$2\" target=\"_blank\">$1$2</a>");

        return injectEmoticons(text);
    };

    var parseChatBox = function(chatBox) {
        var chatBoxMsg = chatBox.find('p');
        parseChatBoxMsg(chatBoxMsg);
        return chatBox;
    };

    var parseChatBoxMsg = function(chatBoxMsg) {
        var msg = chatBoxMsg.html();
        return chatBoxMsg.html(textParser(msg));
    };

    var patterns = {
        angry: /\&gt;:-o|\&gt;:o|\&gt;:-O|\&gt;:O|\&gt;:-\(|\&gt;:\(/g,
        naughty: /\&gt;:-\)|\&gt;:\)|\&gt;:-\&gt;|\&gt;:\&gt;/g,
        sick: /:-\&amp;|:\&amp;|=\&amp;|=-\&amp;|:-@|:@|=@|=-@/g,
        smile: /:-\)|:\)|=-\)|=\)/g,
        wink: /;-\)|;\)/g,
        frown: /:-\(|:\(|=\(|=-\(/g,
        ambivalent: /:-\||:\|/g,
        gasp: /:-O|:O|:-o|:o|=-O|=O|=-o|=o/g,
        laugh: /:-D|:D|=-D|=D/g,
        kiss: /:-\*|:\*|=-\*|=\*/g,
        yuck: /:-P|:-p|:-b|:P|:p|:b|=-P|=-p|=-b|=P|=p|=b/g,
        yum: /:-d|:d/g,
        grin: /\^_\^|\^\^|\^-\^/g,
        sarcastic: /:-\&gt;|:\&gt;|\^o\)/g,
        cry: /:'\(|='\(|:'-\(|='-\(/g,
        cool: /8-\)|8\)|B-\)|B\)/g,
        nerd: /:-B|:B|8-B|8B/g,
        innocent: /O:-\)|o:-\)|O:\)|o:\)/g,
        sealed: /:-X|:X|=X|=-X/g,
        footinmouth: /:-!|:!/g,
        embarrassed: /:-\[|:\[|=\[|=-\[/g,
        crazy: /%-\)|%\)/g,
        confused: /:-S|:S|:-s|:s|%-\(|%\(|X-\(|X\(/g,
        moneymouth: /:-\$|:\$|=\$|=-\$/g,
        heart: /\(L\)|\(l\)/g,
        thumbsup: /\(Y\)|\(y\)/g,
        thumbsdown: /\(N\)|\(n\)/g,
        "not-amused": /-.-\"|-.-|-_-\"|-_-/g,
        "mini-smile": /c:|C:|c-:|C-:/g,
        "mini-frown": /:c|:C|:-c|:-C/g,
        content: /:j|:J/g,
        hearteyes: /\&lt;3/g
    };

    var emoticHTML = "<span class='emoticon $emotic'></span>";

    var injectEmoticons = function(text) {
        for(var emotic in patterns) {
            text = text.replace(patterns[emotic],emoticHTML.replace("$emotic", "emoticon-" + emotic));
        }
        return text;
    }



    // todo
    var isChinese = function(text){
        if(/.*[\u4e00-\u9fa5]+.*$/.test(text)){
            return false;
        } else {
            return true;
        }
    }

    // todo
    // time.format("yyyy-MM-dd hh:mm:ss")
    Date.prototype.format = function(format){
        var o = {
            "M+" : this.getMonth()+1, //month
            "d+" : this.getDate(), //day
            "h+" : this.getHours(), //hour
            "m+" : this.getMinutes(), //minute
            "s+" : this.getSeconds(), //second
            "q+" : Math.floor((this.getMonth()+3)/3), //quarter
            "S" : this.getMilliseconds() //millisecond
        }

        if(/(y+)/.test(format)) format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4- RegExp.$1.length));
        for(var k in o)if(new RegExp("("+ k +")").test(format))
            format = format.replace(RegExp.$1,RegExp.$1.length==1? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        return format;
    }

    // Simplified Chinese
    $.timeago.settings = {
        refreshMillis : 1000,
        allowFuture: false,
        localeTitle: true,
        cutoff:0,
        // strings: {
        //     prefixAgo: null,
        //     prefixFromNow: "从现在开始",
        //     suffixAgo: "之前",
        //     suffixFromNow: null,
        //     seconds: "刚刚",
        //     minute: "大约 1 分钟",
        //     minutes: "%d 分钟",
        //     hour: "大约 1 小时",
        //     hours: "大约 %d 小时",
        //     day: "1 天",
        //     days: "%d 天",
        //     month: "大约 1 个月",
        //     months: "%d 月",
        //     year: "大约 1 年",
        //     years: "%d 年",
        //     numbers: [],
        //     wordSeparator: ""
        // }
        strings: {
            prefixAgo: null,
            prefixFromNow: null,
            suffixAgo: "ago",
            suffixFromNow: "from now",
            seconds: "less than a minute",
            minute: "about a minute",
            minutes: "%d minutes",
            hour: "about an hour",
            hours: "about %d hours",
            day: "a day",
            days: "%d days",
            month: "about a month",
            months: "%d months",
            year: "about a year",
            years: "%d years",
            wordSeparator: " ",
            numbers: []
          }
    }


/*
=================
    TITLE notifications
=================
*/

    var hidden,
        change,
        vis = {
            hidden: "visibilitychange",
            mozHidden: "mozvisibilitychange",
            webkitHidden: "webkitvisibilitychange",
            msHidden: "msvisibilitychange",
            oHidden: "ovisibilitychange" /* not currently supported */
        };

    for (var hidden in vis) {
        if (vis.hasOwnProperty(hidden) && hidden in document) {
            change = vis[hidden];
            break;
        }
    }

    if (change) {
        document.addEventListener(change, onchange);
    } else if (/*@cc_on!@*/false) { // IE 9 and lower
        document.onfocusin = document.onfocusout = onchange
    } else {
        window.onfocus = window.onblur = onchange;
    }

    function onchange (evt) {
        var body = document.body;
            evt = evt || window.event;

        if (evt.type == "focus" || evt.type == "focusin") {
            windowStatus = "visible";
        } else if (evt.type == "blur" || evt.type == "focusout") {
            windowStatus = "hidden";
        } else {
            windowStatus = this[hidden] ? "hidden" : "visible";
        }

        if(windowStatus == "visible" && afkDeliveredMessages) {
            afkDeliveredMessages = 0;
            updateTitle();
        }

        if (windowStatus == "visible") {
            focusInput();
        }
    }

    function updateTitle() {
        // On chrome, we have to add a timer for updating the title after the focus event
        // else the title will not update
        
        // console.log('updateTitle!!')

        window.setTimeout(function () {
            $('title').html(ich.title_template({
                count: afkDeliveredMessages,
                // roomName: roomName
            }, true));
        },100);
    }

    function focusInput() {
        $(".chat-input textarea").focus();
    }

    //masonry history
    function masonryHistory(wrap){
        wrap.masonry({
            // columnWidth: 290,
            'itemSelector': '.chat-box',
            // 'gutter': 5,
            // isResizeBound: false,
            visibleStyle: { opacity: 1, transform: 'scale(1)' },
            isAnimated: true,
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
    }

    function hideLoading(){
        $('.chat .loading').hide();
    }

    function removeNull(){
        $('.chat .nullbox').remove();
    }

});
