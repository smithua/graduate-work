IM = {
    socket: null,
    connected: null,
    connect: function() {
        this.socket = Node.socket;
        this.listenEvents();
    },
    listenEvents: function() {
        this.socket.on('events', function(data) {
            console.log(data);
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