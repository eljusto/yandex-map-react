import api from '../api';

function detectImagesLoaded (element) {
    const images = Array.from(element.querySelectorAll('img') || []);

    if (images.length === 0) {
        return Promise.resolve();
    }

    return Promise.all(images.map((image) => {
        return new Promise((resolve) => {
            if (image.complete) {
                resolve();
                return;
            }
            image.onload = image.onerror = resolve;
        });
    }));
}

function createLayout ({domElement, extendMethods = {}}) {
    const LayoutClass = (api.getAPI()).templateLayoutFactory.createClass('<i></i>', Object.assign({
        build: function () {
            LayoutClass.superclass.build.call(this);

            this.options = this.getData().options;

            this._setupContent(domElement);
            this._updateSize();

            detectImagesLoaded(this.getElement()).then(this._updateMarkerShape.bind(this));
        },

        getShape: function () {
            return new (api.getAPI()).shape.Rectangle(
                new (api.getAPI()).geometry.pixel.Rectangle(
                    [
                        [0, 0],
                        [this._size[0], this._size[1]]
                    ]
                )
            );
        },

        _updateMarkerShape: function () {
            this._updateSize();
            this.events.fire('shapechange');
        },

        /**
         * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
         * @function
         * @name applyElementOffset
         */
        applyElementOffset: function () {
            const content = this._getContent();
            if (content) {
                content.style.left = -(content.offsetWidth / 2) + 'px';
                content.style.top= -(content.offsetHeight) + 'px';
            }
        },

        _getContent: function() {
            return this.getElement();
        },

        onSublayoutSizeChange: function () {
            LayoutClass.superclass.onSublayoutSizeChange.apply(this, arguments);

            const content = this._getContent();
            if(!content) {
                return;
            }

            this._updateSize();

            this.events.fire('shapechange');
        },

        _setupContent: function (domElement) {
            const element = this.getElement();
            element.appendChild(domElement);
        },

        _updateSize: function () {
            const newSize = this._getSize();
            if (newSize) {
                this._size = newSize;
            }
            this.applyElementOffset();
        },

        _getSize: function () {
            const content = this._getContent();
            if(!content) {
                return null;
            }
            return [content.offsetWidth, content.offsetHeight];
        }
    }, extendMethods));

    return LayoutClass;
}

export default {
    createIconLayoutClass: function (domElement) {
        return createLayout({
            domElement,
            extendMethods: {

                _getContent: function () {
                    const element = this.getElement();
                    if (element) {
                        return element.querySelector('.icon-content');
                    }
                },

                _updateSize: function () {
                    let geoObject;
                    const oldSize = this._size;
                    const newSize = this._getSize();

                    if (newSize) {
                        this._size = newSize;
                    }

                    // Update layout offset.
                    if (!oldSize || (oldSize[0] !== this._size[0] || oldSize[1] !== this._size[1])) {
                        geoObject = this.getData().geoObject;

                        if (geoObject.getOverlaySync()) {
                            geoObject.options.set('iconOffset', [-this._size[0] / 2, -this._size[1]]);
                        } else {
                            geoObject.getOverlay().then(() => {
                                geoObject.options.set('iconOffset', [-this._size[0] / 2, -this._size[1]]);
                            });
                        }
                    }
                }
            }
        });
    },

    createBalloonLayoutClass: function (domElement) {
        return createLayout({
            domElement,
            extendMethods: {

                getShape: function getShape() {
                    const content = this._getContent();
                    var rect;
                    if (content) {
                        rect = [
                            [content.offsetLeft, content.offsetTop],
                            [content.offsetLeft + content.offsetWidth, content.offsetTop + content.offsetHeight]
                        ];
                    } else {
                        let size = this._size || [0, 0];
                        rect = [
                            [0, 0],
                            [size[0], size[1]]
                        ];
                    }

                    return new (api.getAPI()).shape.Rectangle(
                        new (api.getAPI()).geometry.pixel.Rectangle(rect)
                    );
                },

                _getContent: function () {
                    const element = this.getElement();
                    if (element) {
                        return element.querySelector('.balloon-content');
                    }
                }
            }

        });
    }
};
