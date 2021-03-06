'use strict';

import Core from '../../tools/core.js';
import Dom from '../../tools/dom.js';
import Templated from '../../components/templated.js';
import Popup from '../../ui/popup.js';
import Linker from './linker.js';
import ChunkReader from '../../components/chunkReader.js';

export default Core.Templatable("Popup.Linker", class PopupLinker extends Popup { 
	
	get svg_file() { return this.linker.svg_file; }
	
	constructor(id) {
		super(id);
	}
	
	async Initialize(simulation, diagram) {
		Dom.Empty(this.Elem('body'));
		
		this.simulation = simulation;
		
		var diagram = await ChunkReader.ReadAsText(diagram);
		
		var ports = [];
		var links = [];
		
		simulation.models.forEach(m => {
			m.ports.forEach(p => ports.push({ model:m, port:p }));
		});
		
		simulation.models.forEach(m => links = links.concat(m.links));
		
		var options = {
			diagram: diagram,
			selector : Linker.SVG_FORMAT.DRAW_IO,
			pages: [{
				caption: 'Models',
				empty: 'No models found in the structure file.',
				label: d => `<b>${d.id}</b>`,
				items: simulation.models,
				attrs: {
					"devs-model-id" : d => d.id
				}
			}, {
				caption: 'Output ports',
				empty: 'No output ports found in the structure file.',
				label: d => `<div><b>${d.port.name}</b> @ <b>${d.model.id}</b></div>`,
				items: ports,
				attrs: {
					"devs-port-model" :  d => d.model.id,
					"devs-port-name" : d => d.port.name
				}
			}, {
				caption: 'Links',
				empty: 'No links found in the structure file.',
				label: d => `<div><b>${d.port_a.name}</b> @ <b>${d.model_a.id}</b> to</div><div><b>${d.port_b.name}</b> @ <b>${d.model_b.id}</b></div>`,
				items: links,
				attrs: {
					"devs-link-mA" : d => d.model_a.id,
					"devs-link-pA" : d => d.port_a.name
				}
			}]
		}
		
		this.linker = new Linker(this.Elem('body'), options);
	}
	
	Show() {		
		return super.Show().then(this.onLinker_Complete.bind(this));
	}
	
	onLinker_Complete(ev) {
		this.linker.Reset();
		
		this.simulation.diagram = this.simulation.load_svg(this.linker.svg.innerHTML);
	}
	
	Template() {
		return "<div handle='popup' class='popup'>" +
				  "<div class='popup-header'>" +
					  "<h2 class='popup-title' handle='title'>nls(Popup_Linker_Title)</h2>" +
					  "<button class='close' handle='close' title='nls(Popup_Close)'>×</button>" +
				  "</div>" +
				  "<div class='popup-body popup-linker' handle='body'>" + 

				  "</div>" +
			   "</div>";
	}
	
	static Nls() {
		return {
			"Popup_Close": {
				"en": "Close",
				"fr": "Fermer"
			},
			"Popup_Linker_Title" : {
				"en":"DEVS Diagram Linker"
			}
		}
	}
});