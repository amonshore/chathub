(() => {
    "use strict";
    /**
     * ChatHub v1.0 by narsenico
     */
    require('./server.js')({ "debug": process.argv[2] === '--debug' }).start();
})();
