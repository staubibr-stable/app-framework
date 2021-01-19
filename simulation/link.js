'use strict';

import Evented from '../components/evented.js';

export default class Link { 
	get PortA() { return this.svg; }
	
	get PortB() { return this.type; }
	
	get ModelB() { return this.name; }
	
	get SVG() { return this.svg; }

	constructor(portA, portB, modelB, svg) {
		this.portA = portA;
		this.portB = portB;
		this.modelB = modelB;
		this.svg = svg || [];
	}
    
	Clone() {
		return new Link(this.portA, this.portB, this.modelB, this.svg);
	}
	
	static FromJson(json) {
		return new Link(json.portA, json.portB, json.modelB, json.svg);
	}
}