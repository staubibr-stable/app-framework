import BucketFill from "../components/style/bucketFill.js";
import BucketRadius from "../components/style/bucketRadius.js";
import BucketStroke from "../components/style/bucketStroke.js";
import BucketScale from "../components/style/bucketScale.js";
import StaticFill from "../components/style/staticFill.js";
import StaticRadius from "../components/style/staticRadius.js";
import StaticStroke from "../components/style/staticStroke.js";
import StaticScale from "../components/style/staticScale.js";
import Polygon from "../components/style/polygon.js";
import Point from "../components/style/point.js";
import PointIcon from "../components/style/pointIcon.js";
import Linestring from "../components/style/linestring.js";

export default class Style {
	
	static Statistics(simulation) {		
		var values = {};

		// TODO :Something doesn't work here now that there can be multiple model types. 
		// Statistics should be computed in the GIS part of the app, by property on the map.
		for (var i = 0; i < simulation.frames.length; i++) {
			var fr = simulation.frames[i];
			
			for (var j = 0; j < fr.state_messages.length; j++) {
				var m = fr.state_messages[j];
				
				for (var f in m.value) {
					if (!values[f]) values[f] = [];
					
					values[f].push(m.value[f]);
				}
			}
		}
			
		for (var f in values) {
			values[f] = values[f].filter(v => !isNaN(v));
			values[f] = values[f].sort((a, b) => (a < b) ? -1 : 1);
		} 
		
		var stats = {};
		
		for (var f in values) {
			var length = values[f].length;
			
			stats[f] = {
				sorted: values[f],
				length: length,
				min: values[f][0],
				max: values[f][length - 1]
			}
		}
		
		return stats;
	}
	
	static QuantileBuckets(values, n, zero) {
		var buckets = [];
		
		var zValues = zero ?  values.filter(v => v != 0) : values;
		
		if (zValues.length == 0) return [0];
		
		var interval = Math.floor(zValues.length / n);
		
		for (var i = 1; i < n; i++) buckets.push(zValues[i * interval]);
		
		buckets.push(zValues[zValues.length - 1]);
		
		return buckets;
	}
	
	static EquivalentBuckets(min, max, n) {
		var buckets = [];
		
		var interval = (max - min) / n;
		
		for (var i = 1; i < n; i++) buckets.push(min + i * interval);
		
		buckets.push(max);
		
		return buckets;
	}
	
	static BucketizeStyle(style, stats) {
		if (style.type == "quantile") {	
			style.buckets = Style.QuantileBuckets(stats[style.property].sorted, style.length, !!style.zero);
		}
		else if (style.type == "equivalent") {
			style.buckets = Style.EquivalentBuckets(stats[style.property].min, stats[style.property].max, style.length);
		}
	}
	
	static GetStyle(type, json) {
		if (type == "point") return this.PointStyle(json);
		
		if (type == "pointIcon") return this.PointIconStyle(json);
		
		if (type == "polygon") return this.PolygonStyle(json);
		
		if (type == "linestring") return this.LinestringStyle(json);
	}
	
	static PointIconStyle(json) {
		return new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [0.5, 0.5],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				scale: json.scale,
				offset: [0,0],
				opacity: 1,
				src: json.src
			})
		});
	}
	
	static PointStyle(json) {
		return new ol.style.Style({
			image: new ol.style.Circle({
				radius: json.radius,
				fill: new ol.style.Fill({
					color: json.fill.color
				}),
				stroke: new ol.style.Stroke({
					color: json.stroke.color,
					width: json.stroke.width,
				})
			})
		});
	}

	static PolygonStyle(json) {
		return new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: json.stroke.color,
				width: json.stroke.width,
			}),
			fill: new ol.style.Fill({
				color: json.fill.color,
			})
		});
	}
	
	static LinestringStyle(json) {
		return new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: json.stroke.color,
				width: json.stroke.width
			})
		})
	}
	
	static FillStyleFromJson(json) {
		if (json.type == "equivalent" || json.type == "quantile" || json.type == "user-defined") {
			return BucketFill.FromJson(json);
		}

		if (json.type == "static") return StaticFill.FromJson(json);
	}
	
	static StrokeStyleFromJson(json) {
		if (json.type == "equivalent" || json.type == "quantile" || json.type == "user-defined") {
			return BucketStroke.FromJson(json);
		}
		
		if (json.type == "static") return StaticStroke.FromJson(json);
	}
	
	static RadiusStyleFromJson(json) {
		if (json.type == "equivalent" || json.type == "quantile" || json.type == "user-defined") {
			return BucketRadius.FromJson(json);
		}
		
		if (json.type == "static") return StaticRadius.FromJson(json.radius);	
	}
	
	static ScaleStyleFromJson(json) {
		if (json.type == "equivalent" || json.type == "quantile" || json.type == "user-defined") {
			return BucketScale.FromJson(json);
		}
		
		if (json.type == "static") return StaticScale.FromJson(json.scale);	
	}
	
	static FromJson(type, json) {
		if (type == "polygon") return Polygon.FromJson(json);
		
		if (type == "point") {
			if (json.radius) return Point.FromJson(json);
			
			if (json.src) return PointIcon.FromJson(json);
		}
		
		if (type == "linestring") return Linestring.FromJson(json);
	}
}