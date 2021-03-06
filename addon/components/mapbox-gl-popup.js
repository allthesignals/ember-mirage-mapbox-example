import { assign } from '@ember/polyfills';
import { getOwner } from '@ember/application';
import { getProperties, get } from '@ember/object';
import { bind } from '@ember/runloop';
import Component from '@ember/component';
import layout from '../templates/components/mapbox-gl-popup';
import MapboxGl from 'mapbox-gl';

export default Component.extend({
  layout,
  tagName: '',

  map: null,
  marker: null,
  lngLat: null,
  initOptions: null,

  onClose: null,

  init() {
    this._super(...arguments);

    const { initOptions, marker } = getProperties(this, 'initOptions', 'marker');

    this.domContent = document.createElement('div');
    this._onClose = bind(this, this.sendAction, 'onClose'); // eslint-disable-line ember/closure-actions
    const options = assign({},
      get(getOwner(this).resolveRegistration('config:environment'), 'mapbox-gl.popup'),
      initOptions);

    this.popup = new MapboxGl.Popup(options)
      .setDOMContent(this.domContent)
      .on('close', this._onClose);

    if (marker === null) {
      this.popup.addTo(this.map);
    } else {
      marker.setPopup(this.popup);
    }
  },

  didReceiveAttrs() {
    this._super(...arguments);

    const lngLat = get(this, 'lngLat');

    if (lngLat) {
      this.popup.setLngLat(lngLat);
    }
  },

  willDestroy() {
    this._super(...arguments);

    this.popup.off('close', this._onClose);
    const marker = get(this, 'marker');

    if (marker === null) {
      this.popup.remove();
    } else {
      marker.setPopup(null);
    }
  }
});
