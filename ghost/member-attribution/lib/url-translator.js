/**
 * @typedef {Object} UrlService
 * @prop {(resourceId: string) => Object} getResource
 *  @prop {(resourceId: string, options) => string} getUrlByResourceId
 * 
 */

/**
 * Translate a url into a type and id
 * And also in reverse
 */
class UrlTranslator {
    /**
     * 
     * @param {Object} deps 
     * @param {UrlService} deps.urlService
     * @param {Object} deps.models
     * @param {Object} deps.models.Post
     * @param {Object} deps.models.Tag
     * @param {Object} deps.models.User
     */
    constructor({urlService, models}) {
        this.urlService = urlService;
        this.models = models;
    }

    getTypeAndId(url) {
        const resource = this.urlService.getResource(url);
        if (!resource) {
            return;
        }

        if (resource.config.type === 'posts') {
            return {
                type: 'post',
                id: resource.data.id
            };
        }

        if (resource.config.type === 'pages') {
            return {
                type: 'page',
                id: resource.data.id
            };
        }

        if (resource.config.type === 'tags') {
            return {
                type: 'tag',
                id: resource.data.id
            };
        }

        if (resource.config.type === 'authors') {
            return {
                type: 'author',
                id: resource.data.id
            };
        }
    }

    async getResourceById(id, type, options = {absolute: true}) {
        const url = this.urlService.getUrlByResourceId(id, options);

        switch (type) {
        case 'post':
        case 'page': {
            const post = await this.models.Post.findOne({id}, {require: false});
            if (!post) {
                return null;
            }
    
            return {
                id: post.id,
                type,
                url,
                title: post.get('title')
            };
        }
        case 'author': {
            const user = await this.models.User.findOne({id}, {require: false});
            if (!user) {
                return null;
            }
    
            return {
                id: user.id,
                type,
                url,
                title: user.get('name')
            };
        }
        case 'tag': {
            const tag = await this.models.Tag.findOne({id}, {require: false});
            if (!tag) {
                return null;
            }
    
            return {
                id: tag.id,
                type,
                url,
                title: tag.get('name')
            };
        }
        }
        return null;
    }
}

module.exports = UrlTranslator;
