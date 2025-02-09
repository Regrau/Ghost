// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');
const UrlHistory = require('../lib/history');
const AttributionBuilder = require('../lib/attribution');

describe('AttributionBuilder', function () {
    let attributionBuilder;

    before(function () {
        attributionBuilder = new AttributionBuilder({
            urlTranslator: {
                getTypeAndId(path) {
                    if (path === '/my-post') {
                        return {
                            id: 123,
                            type: 'post'
                        };
                    }
                    if (path === '/my-page') {
                        return {
                            id: 845,
                            type: 'page'
                        };
                    }
                    return;
                },
                getResourceById(id, type) {
                    if (id === 'invalid') {
                        return null;
                    }
                    return {
                        id,
                        type,
                        url: '/path',
                        title: 'Title'
                    };
                }
            }
        });
    });

    it('Returns empty if empty history', function () {
        const history = new UrlHistory([]);
        should(attributionBuilder.getAttribution(history)).match({id: null, type: null, url: null});
    });

    it('Returns last url', function () {
        const history = new UrlHistory([{path: '/not-last', time: 123}, {path: '/test', time: 123}]);
        should(attributionBuilder.getAttribution(history)).match({type: 'url', id: null, url: '/test'});
    });

    it('Returns last post', function () {
        const history = new UrlHistory([
            {path: '/my-post', time: 123}, 
            {path: '/test', time: 124},
            {path: '/unknown-page', time: 125}
        ]);
        should(attributionBuilder.getAttribution(history)).match({type: 'post', id: 123, url: '/my-post'});
    });

    it('Returns last post even when it found pages', function () {
        const history = new UrlHistory([
            {path: '/my-post', time: 123}, 
            {path: '/my-page', time: 124}, 
            {path: '/unknown-page', time: 125}
        ]);
        should(attributionBuilder.getAttribution(history)).match({type: 'post', id: 123, url: '/my-post'});
    });

    it('Returns last page if no posts', function () {
        const history = new UrlHistory([
            {path: '/other', time: 123}, 
            {path: '/my-page', time: 124}, 
            {path: '/unknown-page', time: 125}
        ]);
        should(attributionBuilder.getAttribution(history)).match({type: 'page', id: 845, url: '/my-page'});
    });

    it('Returns all null for invalid histories', function () {
        const history = new UrlHistory('invalid');
        should(attributionBuilder.getAttribution(history)).match({
            type: null,
            id: null,
            url: null
        });
    });

    it('Returns all null for empty histories', function () {
        const history = new UrlHistory([]);
        should(attributionBuilder.getAttribution(history)).match({
            type: null,
            id: null,
            url: null
        });
    });

    it('Returns post resource', async function () {
        should(await attributionBuilder.build({type: 'post', id: '123', url: '/post'}).getResource()).match({
            type: 'post',
            id: '123',
            url: '/path',
            title: 'Title'
        });
    });

    it('Returns url resource', async function () {
        should(await attributionBuilder.build({type: 'url', id: null, url: '/url'}).getResource()).match({
            type: 'url',
            id: null,
            url: '/url',
            title: '/url'
        });
    });

    it('Returns url resource if not found', async function () {
        should(await attributionBuilder.build({type: 'post', id: 'invalid', url: '/post'}).getResource()).match({
            type: 'url',
            id: null,
            url: '/post',
            title: '/post'
        });
    });
});
