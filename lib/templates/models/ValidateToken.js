'use strict';
/**
 * ResetToken
 *
 * @module      :: Model
 * @description :: Describes a users reset token
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.validateToken.attributes({
    
    /* e.g.
    nickname: 'string'
    */
    
  }),

  beforeCreate: require('waterlock').models.validateToken.beforeCreate,
  afterCreate: require('waterlock').models.validateToken.afterCreate
};
