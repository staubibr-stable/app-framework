'use strict';

import Core from '../tools/core.js';
import Evented from './evented.js';

const CHUNK_SIZE = 8388608;

export default class ChunkReader extends Evented { 
	
	constructor () {
		super();
		
		this.fileReader = new FileReader();
		this.defer = null;
	
		this.fileReader.addEventListener("loadend", this.onLoadEnd_Handler.bind(this));
		this.fileReader.addEventListener("error", this.onLoadError_Handler.bind(this));
	}
	
	PromiseRead(file) {
		if (this.defer) throw new Error("FileReader is in use");
		
		this.defer = Core.Defer();
		
		// let start = reverse ? file.size - CHUNK_SIZE : 0;
        // let end = reverse ? file.size : CHUNK_SIZE;
        // let slice = file.slice(start, end);
		
		// TODO: readAsArrayBuffer is better for large files supposedly
		this.fileReader.readAsText(file);
		// this.fileReader.readAsArrayBuffer(file);
		
		return this.defer.promise;
	}

	onLoadEnd_Handler(ev) {
		var resolve = this.defer.Resolve;
		
		this.defer = null;
		
		resolve(this.fileReader.result);
	}

	onLoadError_Handler(ev) {		
		// TODO: This never triggers, example, bad visualization.json file
		var reject = this.defer.Reject;
		
		this.defer = null;
		
		reject(new Error("Unable to read the file."));
	}
	
	Read(file, delegate) {
		var d = Core.Defer();
		
		if (!file) return d.Resolve(null);
		
		this.PromiseRead(file).then(function(result) {
			try {			
				d.Resolve(delegate(result));
			}
			catch(ex) {
				d.Reject(ex);
				
				throw(ex);
			}
		}, (error) => { d.Reject(error); });

		return d.promise;
	}
	
	ReadAsJson(file) {
		return this.Read(file, json => JSON.parse(json));
	}
	
	ReadAsText(file) {
		return this.Read(file, text => text);
	}
	
	ReadByChunk(file, split, delegate) {
		var position = 0;
		var d = Core.Defer();
		var read = null;
		
		if (!file) return d.Resolve(null);
		
		var ReadChunk = (size) => {
			var chunk = file.slice(position, position + size);
		
			this.PromiseRead(chunk).then((result) => {
				var idx = size > result.length ? result.length - 1 : result.lastIndexOf(split);
				var content = result.substr(0, idx);
				
				position += content.length + 1;
				
				try {
					read = delegate(read, content, 100 * position / file.size);
				}
				catch (error) {
					d.Reject(error);
				}
				
				if (position < file.size) ReadChunk(size);
				
				else if (position == file.size) d.Resolve(read);
				
				else d.Reject(new Error("Reader position exceeded the file size."));
			});
		}
		
		ReadChunk(CHUNK_SIZE);
		
		return d.promise;
	}
	
	static Read(file, delegate) {
		var reader = new ChunkReader();
	
		return reader.Read(file, delegate);
	}
	
	static ReadByChunk(file, split, delegate) {
		var reader = new ChunkReader();
	
		return reader.ReadByChunk(file, split, delegate);
	}
	
	static ReadAsJson(file) {
		var reader = new ChunkReader();
		
		return reader.ReadAsJson(file);
	}
	
	static ReadAsText(file) {
		var reader = new ChunkReader();
		
		return reader.ReadAsText(file);
	}
}