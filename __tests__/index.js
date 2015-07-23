/* jshint expr: true, globalstrict: true */
'use strict';

// Ensure that chai accepts should-style assertions and is integrated with sinon.
var chai      = require('chai');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

// Require all modules ending in '-test'
var context = require.context('.', true, /\-test$/);

context.keys().forEach(context);
