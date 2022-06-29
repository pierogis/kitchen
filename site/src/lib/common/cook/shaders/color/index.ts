import type { Shader } from 'three';

export const ColorShader: Shader = {
	uniforms: {
		tDiffuse: { value: null },
		color: { value: 1 }
	},

	vertexShader: /* glsl */ `
		precision mediump float;

		attribute vec2 a_position;
		
		void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
		}`,

	fragmentShader: /* glsl */ `
		precision mediump float;

		uniform vec3 color;
		
		void main() {
			gl_FragColor = vec4(color, 1.0);
		}`
};
