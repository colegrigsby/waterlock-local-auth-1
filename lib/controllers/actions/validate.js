var jwt = require( 'jwt-simple' );
var _ = require( 'lodash' );
var wl = require( '../../waterlock-local-auth' );

/**
 * Account validate action
 */
module.exports = function ( req, res ) {

    if ( req.method != 'POST' )
        return res.status( 404 ).json( 404 );


    var params = req.allParams();

    if ( !params.email || !params.token )
        return res.status( 400 ).json( { reason: "missing email or token" } );


    var config = wl.config;
    var authConfig = wl.authConfig;

    try {
        // decode the token
        var _token = jwt.decode( params.token, config.jsonWebTokens.secret );

        // set the time of the request
        var _reqTime = Date.now();

        // If token is expired
        if ( _token.exp <= _reqTime ) {
            return res.forbidden( 'Your token is expired.' );
        }

        // If token is early
        if ( _reqTime <= _token.nbf ) {
            return res.forbidden( 'This token is early.' );
        }

        // If audience doesn't match
        if ( config.jsonWebTokens.audience !== _token.aud ) {
            return res.forbidden( 'This token cannot be accepted for this domain.' );
        }

        // If the subject doesn't match
        if ( 'account validate' !== _token.sub ) {
            return res.forbidden( 'This token cannot be used for this request.' );
        }
        
        sails.models.auth.findOne( _token.iss ).populate( 'validateToken' ).exec( function ( err, auth ) {
            if ( typeof auth.validateToken === 'undefined' || params.token !== auth.validateToken.token ) {
                return res.forbidden( 'This token cannot be used.' );
            }

            //OK! We have passed all checks, let's unblock the account and forward
            auth.blocked = false;
            auth.validateToken = '';
            auth.save();

            if ( sails.config.waterlock.validateAccount && sails.config.waterlock.validateAccount.redirectOnValidateUrl ) {
                res.redirect( sails.config.waterlock.validateAccount.redirectOnValidateUrl );
            } else {
                res.json( 200 );
            }

        } );

    } catch ( err ) {
        return res.serverError( err );
    }
    

}
