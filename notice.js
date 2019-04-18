/*
dist construction
    app
        javascripts
            app.js
        stylesheets
            app.css
        index.html
        list-item.html
        product.html
    build
        contracts
        webpack-build
    contracts
        smart-program.sol
    front
        bootstrap
        images
    lib
        mongodb-operction       // save product info to mongodb
    migrations
        migrate
    node_modules
        package-library
    test
        smart-progma-test
    package.json                // plugs
    seed.js                     // init mongodb
    server.js                   // run program and listenning port
    truffle-config.js           // connect to private network
    webpack.config.js           // export static dist
*/

/*
operation logic
    ipfs daemon                 // ipfs remote synchron
    mongod                      // start mongodb server
    mongo                       // operate mongodb
    testrpc                     // start test network
    webpack                     // pack main files
    truffle console             // migrate smart program to test network and send some seeds to mongodb
    node server.js              // run program and listenning port
*/