'use strict';
var request = require('request'),
    User = require('./user.model.js'),
    config = require('../../res/config.js'),
    jwt = require('jsonwebtoken'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose');


/**
 * Return if user is banned
 * @param {String} userId
 * @param {Function} next
 * @return {Boolean} banned
 */
exports.isBanned = function(userId, next) {
    User.findById(userId, function(err, user) {
        if (user && user.bannedInForum) {
            next(err, true);
        } else {
            next(err, false);
        }
    });
};


/**
 * Get a single profile user
 * @param {String} userId
 * @param {Function} next
 * @return {Object} user.profile
 */
exports.getUserProfile = function(userId, next) {
    User.findById(userId, function(err, user) {
        if (err) {
            next(err);
        } else if (user) {
            next(err, user.profile);
        } else {
            next();
        }
    });
};

/**
 * Get users by username regex
 * @param {String} username
 * @param {Function} next
 * @return {Object} user.owner
 */
exports.getUserIdsByName = function(username, next) {
    if (username['$regex']) {
        username['$regex'] = username['$regex'].toLowerCase();
    }
    User.find({username: username}, '_id', function(err, users) {
        if (err) {
            next(err);
        } else if (users) {
            next(err, users);
        } else {
            next();
        }
    });
};

/**
 * Get an user id
 * @param {String} email
 * @param {Function} next
 * @return {String} user Id
 */
exports.getUserId = function(email, next) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) {
            next(err);
        } else if (user) {
            next(err, user._id);
        } else {
            next();
        }
    });
};

/**
 * Get an user
 * @param {String} email
 * @param {Function} next
 * @return {Object} user.owner
 */
exports.getUserByEmail = function(email, next) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) {
            next(err);
        } else if (user) {
            next(err, user.owner);
        } else {
            next();
        }
    });
};


/**
 * Get users
 * @param {String} emails
 * @param {Function} next
 * @return {Array} userIds
 */
exports.getAllUsersByEmails = function(emails, next) {
    async.map(emails, exports.getUserByEmail, function(err, userIds) {
        next(err, userIds);
    });
};


/**
 * Get google user data with token
 * @param {String} provider
 * @param {String} token
 * @param {Function} next
 */

exports.getSocialProfile = function(provider, token, next) {
    switch (provider) {
        case 'google':
            request('https://www.googleapis.com/userinfo/v2/me?access_token=' + token, next);
            break;
        case 'facebook':
            request('https://graph.facebook.com/me?fields=id,name,first_name,email,last_name,age_range&access_token=' + token, next);
            break;
    }
};

/**
 * Get avatar facebook user
 * @param {String} userId
 * @param {Function} next
 */
exports.getFacebookAvatar = function(userId, next) {
    request('http://graph.facebook.com/v2.5/' + userId + '/picture?type=large&redirect=false', next);
};
