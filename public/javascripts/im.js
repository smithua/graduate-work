IM = {
    socket: null,
    connected: null,
    connect: function() {
        this.socket = Node.socket;
        this.listenEvents();
    },
    listenEvents: function() {
        this.socket.on('events', function(data) {
            if (data.fn) {
                IM[data.fn](data.message);
            }
        });
    },
    send: function(el) {
        var val_message = $(el).prev().val();
        var dialogId = window.location.pathname.split('/')[2];
        if (!_IM.hasWhiteSpaceOnly(val_message)) {
            this.socket.emit('events', {fn: 'addMessage', data: {message: val_message, _id: dialogId}});
        } else {
            console.error('empty textarea');
        }
    },
    addMessage: function (data) {
        if (window.location.pathname.split('/')[2] == data.inst.dialog_id) {
            $('.im_textarea').val('');
            var html = '<div class="' + (data.sender.user_name == $('#user_name').val() ? 'owner' : 'interlocutor') + '" id="message_' + data.inst._id + '">' +
                '<span class="message_owner">' + data.sender.user_name + '</span>' +
                '<span class="message_text">' + data.inst.text + '</span>' +
                '</div>';
            $('#dialog .wrap3 .wrap4').append(html);
        }
    },
    refreshOnline: function(data) {
        var online = [];
        if (window.location.pathname.split('/')[2].length) {
            for (key in data) {
                if (data[key]['currentUrl'].split('/')[2] !== undefined) {
                    if (data[key]['currentUrl'].split('/')[2] == window.location.pathname.split('/')[2]) {
                        online.push(data[key]['user_name']);
                    }
                }
            }
            if (online.length) {
                var html = '';
                online.forEach(function(item, key) {
                    html += '<li>' + item + '</li>';
                });

                $('.user_list').html(html);
            }
        }
        //console.log(online);
//        if (!$('#user_' + data.user_id).length) {
//            $('.user_list').append('<li id="user_' + data.user_id + '" class="user_list_block">' + data.user_name + '</li>');
//        }
    }
};

_IM = {
    parseInt: function (str) {
        if (str == '')
            return 0;
        else
            return parseInt(str);
    },
    timeConverter: function(time_stamp) {
        var a = new Date(Math.floor(time_stamp) * 1000);
        var monthsEnd = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var monthsRus = ['Январь','Февраль','Март','Апрель','Май','Июнь', 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
        var year = a.getFullYear();
        var month = monthsRus[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = ((a.getMinutes().toString().length === 1) ? '0' + a.getMinutes() : a.getMinutes());
        var sec = a.getSeconds();

        var today = new Date;

        if ((today.getDate() - date) === 1)
        {
            return 'вчера в ' + hour + ':' + min;
        }
        else if ((today.getDate() - date) === 0)
        {
            return 'сегодня в ' + hour + ':' + min;
        }
        else
        {
            return date + ' ' + substr(month, 0, 3).toLowerCase() + ' ' + year + ' в ' + hour + ':' + min;
        }
    },
    hasWhiteSpaceOnly: function(s) {
        return /^ *$/.test(s);
    }
};