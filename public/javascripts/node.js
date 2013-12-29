Node = {
    socket: null,
    urlIO: null,
    connect: function() {
        try {
            this.socket = io.connect(this.urlIO + ':3000', {
                'connect timeout': 500,
                'reconnect': true,
                'reconnection delay': 500,
                'reopen delay': 500,
                'max reconnection attempts': 10
            });
        } catch (e) {
            throw new RangeError('Unable connect to server. Please, start node.js app!');
        }
    },
    init: function(host) {
        this.urlIO = host;
        this.connect();
    }
};