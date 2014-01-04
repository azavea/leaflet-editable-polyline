// Plugin:
L.Polyline.polylineEditor = L.Polyline.extend({
    edit: function() {
        if(!this._map) {
            alert('Not added to map!');
            return;
        }
        /**
         * Since all point editing is done by marker events, markers 
         * will be the main holder of the polyline points locations.
         * Every marker contains a reference to the newPointMarker 
         * *before* him (=> the first marker has newPointMarker=null).
         */
        this._markers = [];
        var points = this.getLatLngs();
        var length = points.length;
        for(var i = 0; i < length; i++) {
            this._addMarkers(i, points[i]);
        }
        return this;
    },
    /**
     * Add two markers (a point marker and his newPointMarker) for a 
     * single point.
     */
    _addMarkers: function(pointNo, latLng, fixNeighbourPositions) {
        var that = this;
        var points = this.getLatLngs();
        var marker = L.marker(latLng, {draggable: true, icon: pointIcon}).addTo(this._map);

        marker.newPointMarker = null;
        marker.on('dragend', function(event) {
            var marker = event.target;
            var pointNo = that._getPointNo(event.target);
            that.setLatLngs(that._getMarkerLatLngs());
            that._fixNeighbourPositions(pointNo);
        });

        if(pointNo > 0) {
            var previousPoint = points[pointNo - 1];
            var newPointMarker = L.marker([(latLng.lat + previousPoint.lat) / 2.,
                                           (latLng.lng + previousPoint.lng) / 2.],
                                          {draggable: true, icon: newPointIcon}).addTo(this._map);
            marker.newPointMarker = newPointMarker;
            newPointMarker.on('dragend', function(event) {
                var marker = event.target;
                var pointNo = that._getPointNo(event.target);
                that._addMarkers(pointNo, marker.getLatLng(), true);
                that.setLatLngs(that._getMarkerLatLngs());
            });
        }

        this._markers.splice(pointNo, 0, marker);

        if(fixNeighbourPositions) {
            this._fixNeighbourPositions(pointNo);
        }
    },
    _fixNeighbourPositions: function(pointNo) {
        var previousMarker = pointNo == 0 ? null : this._markers[pointNo - 1];
        var marker = this._markers[pointNo];
        var nextMarker = pointNo < this._markers.length - 1 ? this._markers[pointNo + 1] : null;
        if(marker && previousMarker) {
            marker.newPointMarker.setLatLng([(previousMarker.getLatLng().lat + marker.getLatLng().lat) / 2.,
                                             (previousMarker.getLatLng().lng + marker.getLatLng().lng) / 2.]);
        }
        if(marker && nextMarker) {
            nextMarker.newPointMarker.setLatLng([(marker.getLatLng().lat + nextMarker.getLatLng().lat) / 2.,
                                                 (marker.getLatLng().lng + nextMarker.getLatLng().lng) / 2.]);
        }
    },
    _getPointNo: function(marker) {
        for(var i = 0; i < this._markers.length; i++) {
            if(marker == this._markers[i] || marker == this._markers[i].newPointMarker) {
                console.log("Found:" + i);
                return i;
            }
        }
        console.log("Nothing found for:" + marker);
        return -1;
    },
    _getMarkerLatLngs: function() {
        var result = [];
        for(var i = 0; i < this._markers.length; i++)
            result.push(this._markers[i].getLatLng());
        return result;
    },
});

L.Polyline.polylineEditor.addInitHook(function () {
    //this._initMarkers();
});

L.Polyline.PolylineEditor = function(latlngs, options){
    return new L.Polyline.polylineEditor(latlngs, options);
};

var pointIcon = L.icon({
        iconUrl: 'editmarker.png',
        iconSize: [11, 11],
        iconAnchor: [6, 6],
});
var newPointIcon = L.icon({
        iconUrl: 'editmarker2.png',
        iconSize: [11, 11],
        iconAnchor: [6, 6],
});
