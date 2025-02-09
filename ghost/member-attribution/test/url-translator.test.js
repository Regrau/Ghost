// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('./utils');
const UrlTranslator = require('../lib/url-translator');

describe('UrlTranslator', function () {
    describe('Constructor', function () {
        it('doesn\'t throw', function () {
            new UrlTranslator({});
        });
    });

    describe('getTypeAndId', function () {
        let translator;
        before(function () {
            translator = new UrlTranslator({
                urlService: {
                    getResource: (path) => {
                        switch (path) {
                        case '/post': return {
                            config: {type: 'posts'},
                            data: {id: 'post'}
                        };
                        case '/tag': return {
                            config: {type: 'tags'},
                            data: {id: 'tag'}
                        };
                        case '/page': return {
                            config: {type: 'pages'},
                            data: {id: 'page'}
                        };
                        case '/author': return {
                            config: {type: 'authors'},
                            data: {id: 'author'}
                        };
                        }
                    }
                }
            });
        });

        it('returns posts', function () {
            should(translator.getTypeAndId('/post')).eql({
                type: 'post',
                id: 'post'
            });
        });

        it('returns pages', function () {
            should(translator.getTypeAndId('/page')).eql({
                type: 'page',
                id: 'page'
            });
        });

        it('returns authors', function () {
            should(translator.getTypeAndId('/author')).eql({
                type: 'author',
                id: 'author'
            });
        });

        it('returns tags', function () {
            should(translator.getTypeAndId('/tag')).eql({
                type: 'tag',
                id: 'tag'
            });
        });

        it('returns undefined', function () {
            should(translator.getTypeAndId('/other')).eql(undefined);
        });
    });

    describe('getResourceById', function () {
        let translator;
        before(function () {
            translator = new UrlTranslator({
                urlService: {
                    getUrlByResourceId: () => {
                        return '/path';
                    }
                },
                models: {
                    Post: {
                        findOne({id}) {
                            if (id === 'invalid') {
                                return null;
                            }
                            return {id: 'post_id', get: () => 'Title'};
                        }
                    },
                    User: {
                        findOne({id}) {
                            if (id === 'invalid') {
                                return null;
                            }
                            return {id: 'user_id', get: () => 'Title'};
                        }
                    },
                    Tag: {
                        findOne({id}) {
                            if (id === 'invalid') {
                                return null;
                            }
                            return {id: 'tag_id', get: () => 'Title'};
                        }
                    }
                }
            });
        });

        it('returns for post', async function () {
            should(await translator.getResourceById('id', 'post')).eql({
                type: 'post',
                id: 'post_id',
                title: 'Title',
                url: '/path'
            });
        });

        it('returns for page', async function () {
            should(await translator.getResourceById('id', 'page')).eql({
                type: 'page',
                id: 'post_id',
                title: 'Title',
                url: '/path'
            });
        });

        it('returns for tag', async function () {
            should(await translator.getResourceById('id', 'tag')).eql({
                type: 'tag',
                id: 'tag_id',
                title: 'Title',
                url: '/path'
            });
        });

        it('returns for user', async function () {
            should(await translator.getResourceById('id', 'author')).eql({
                type: 'author',
                id: 'user_id',
                title: 'Title',
                url: '/path'
            });
        });

        it('returns for invalid', async function () {
            should(await translator.getResourceById('id', 'invalid')).eql(null);
        });

        it('returns null for not found post', async function () {
            should(await translator.getResourceById('invalid', 'post')).eql(null);
        });

        it('returns null for not found page', async function () {
            should(await translator.getResourceById('invalid', 'page')).eql(null);
        });

        it('returns null for not found author', async function () {
            should(await translator.getResourceById('invalid', 'author')).eql(null);
        });

        it('returns null for not found tag', async function () {
            should(await translator.getResourceById('invalid', 'tag')).eql(null);
        });
    });
});
