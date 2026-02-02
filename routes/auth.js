const express = require('express');
const { getAuthorizationUrl, authCallbackMiddleware, authRefreshMiddleware, getUserProfile, getClientId } = require('./common/aps.js');

let router = express.Router();


router.get('/api/auth/login', function (req, res) {
    const authUrl = getAuthorizationUrl();
    console.log('[AUTH] Login initiated, redirecting to:', authUrl);
    res.redirect(authUrl);
});

router.get('/api/auth/logout', function (req, res) {
    req.session = null;
    res.redirect('/');
});

router.get('/callback/oauth', authCallbackMiddleware, function (req, res) {
    console.log('[AUTH] Callback successful, redirecting to home');
    res.redirect('/');
});


router.get('/api/auth/profile', authRefreshMiddleware, async function (req, res, next) {
    try {
        const profile = await getUserProfile(req.oAuth3LeggedToken.access_token);
        res.json({ name: `${profile.name}`, picture: `${profile.picture}` });
    } catch (err) {
        next(err);
    }
});

router.get('/oauth/v1/clientid', (req, res) =>{
    res.status(200).end( JSON.stringify({id : getClientId()}) );
});


module.exports = router;
