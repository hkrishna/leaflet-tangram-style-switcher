/*
This plugin adds a bunch of custom styles to your leaflet map as a drop down menu L.Control
TODO: abstract out all the icons and remove font awesome dependency
TODO: Check for tangram/window.layer - if undefined, then dont render anything and throw a nice error msg
TODO: Clean up.
*/
L.Control.Styles = L.Control.extend({
    options: {
        position: 'topleft',
        icon: 'fa fa-heart',
        play: true,
        autoplay: false,
        interval: 2500,
        styles: [
            {'style_file': 'https://tangrams.github.io/carousel/traditional.yaml', 'name': 'traditional'},
            {'style_file': 'https://tangrams.github.io/carousel/halftone.yaml', 'name': 'halftone'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/crosshatch.yaml', 'name': 'crosshatch'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/pericoli.yaml', 'name': 'pericoli'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/default.yaml', 'name': 'default'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/lego.yaml', 'name': 'lego'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/matrix.yaml', 'name': 'matrix'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/nursery.yaml', 'name': 'nursery'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/patterns.yaml', 'name': 'patterns'},
            {'style_file': 'https://tangrams.github.io/tangram-sandbox/styles/tron.yaml', 'name': 'tron'}
        ],
        title: "Show me other map styles", 
        scene: window.layer ? window.layer.scene : undefined
    },

    initialize: function (options) {
        for (var i in options) {
            if (typeof this.options[i] === 'object') {
                L.extend(this.options[i], options[i]);
            } else {
                this.options[i] = options[i];
            }
        }
    },

    switchStyle: function (style_file) {
      this.options.scene.config_source = style_file;
      this.options.scene.reload();
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div',
            'leaflet-control-styles leaflet-bar leaflet-control');

        var self = this;
        this._layer = new L.LayerGroup();
        this._layer.addTo(map);

        this._container = container;

        this._link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
        this._link.href = '#';
        this._link.title = this.options.title;
        this._icon = L.DomUtil.create('i', this.options.icon, this._link);
        this._list = L.DomUtil.create('ul', 'styles shortcuts hidden', container);
        this._play = function() {
          // animate scenes
          self._animate = true;
          self._show = true;
          var i=0;
          L.DomUtil.removeClass(self._icon, "fa-play");
          L.DomUtil.addClass(self._icon, "fa-refresh fa-spin");
          window.style_timer = window.setInterval(function(){
            // console.log(i)
            i=i+1;
            if (i==self.options.styles.length) {
              i=0;
            }
            self.switchStyle(self.options.styles[i].style_file);
          }, self.options.interval);
        };

        for (var i=0; i<this.options.styles.length; i++) {
            var $this = this.options.styles[i];
            var li = L.DomUtil.create('li', '', this._list);
            var link = L.DomUtil.create('a', '', li);
            link.setAttribute('data-style_file', $this.style_file);
            link.setAttribute('data-style_name', $this.name);
            link.innerHTML = $this.name;
            L.DomEvent
                .on(link, 'click', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.preventDefault)
                .on(link, 'click', function() {
                    var style_name = this.getAttribute('data-style_name');
                    var style_file = this.getAttribute('data-style_file');
                    self.switchStyle(style_file);
                })
        }

        L.DomEvent
            .on(this._link, 'click', L.DomEvent.stopPropagation)
            .on(this._link, 'click', L.DomEvent.preventDefault)
            .on(this._link, 'click', function() {
                var classList = self._icon.classList;

                if (!self._show) {
                    if (!self.options.play) {
                      self._show = true;
                    }

                    if (self.options.play && !self._animate && classList.contains('fa-play')) {
                      self._play();
                    } 
                    L.DomUtil.addClass(self._container, "expanded");
                    if (!self._icon.classList.contains('fa-refresh') && !self.options.play) {
                      L.DomUtil.addClass(self._icon, "fa-play");
                      L.DomUtil.removeClass(self._icon, "fa-heart");
                    }
                    L.DomUtil.removeClass(self._list, "hidden"); 
                } else {
                    L.DomUtil.removeClass(self._container, "expanded");
                    L.DomUtil.addClass(self._icon, "fa-heart");
                    L.DomUtil.removeClass(self._icon, "fa-play");
                    L.DomUtil.removeClass(self._icon, "fa-refresh");
                    L.DomUtil.removeClass(self._icon, "fa-spin");
                    L.DomUtil.addClass(self._list, "hidden");
                    self._show = false;
                    self._animate = false;
                    window.clearTimeout(window.style_timer);
                }
                
            })
            .on(this._link, 'dblclick', L.DomEvent.stopPropagation);
        if (self.options.autoplay) {
            self._play();
        }
        return container;
    }
});

L.control.styles = function (options) {
    return new L.Control.Styles(options);
};
