var color_type = 0;
var grayScala = false;
var flashScala = false;
var paused = false;
var pos = 0;
var score2 = 0;
var game_over = false;
var is_collide = false;
var audio1 = new Audio("smash.mp3");
var audio3 = new Audio("mario.mp3");

main();

//
// Start here
//


Mousetrap.bind('a', function() {
	//console.log("mouse");
	DATA["cubeRotation"] += DATA["zrotate"];
	DATA["cubeRotation1"] += DATA["zrotate"];
	DATA["cubeRotation2"] += DATA["zrotate"];

})

Mousetrap.bind('d', function() {
	//console.log("mouse");
	DATA["cubeRotation"] -= DATA["zrotate"];
	DATA["cubeRotation1"] -= DATA["zrotate"];
	DATA["cubeRotation2"] -= DATA["zrotate"];

})

Mousetrap.bind('b', function() {
	//console.log("mouse");
	grayScala = !grayScala
	//DATA["cubeRotation"] -= DATA["zrotate"];
})

Mousetrap.bind('p', function() {
	togglePause();
})

Mousetrap.bind('space', function() {
	audio3.play();
	if (DATA["flag"] == 1) {
		DATA["flag"] = 0;
		DATA["speed"] = -0.12;
		DATA["gravity"] = 0.005;
	}
});

function main() {
	const canvas = document.querySelector('#glcanvas');
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	// If we don't have a GL context, give up now

	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.');
		return;
	}

	// Vertex shader program

	const vsSource = `
	attribute vec4 aVertexColor;
	attribute vec4 aVertexPosition;
	attribute vec2 aTextureCoord;
	attribute vec3 aVertexNormal;

	uniform mat4 uProjectionMatrix;
	uniform mat4 uModelViewMatrix;
	uniform bool flashScala;
	uniform mat4 uNormalMatrix;

	varying highp vec2 vTextureCoord;
	varying lowp vec4 vColor;
	varying highp vec3 vLighting;


	void main(void) {
	  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	  highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.5);
	  vTextureCoord = aTextureCoord;
	  if (flashScala) {
		directionalLightColor = vec3(1.5, 1.5, 1.5);        
	  }
	  
	  highp vec3 directionalVector = normalize(vec3(0, -1.5, 10));
	  highp vec3 ambientLight = vec3(0.4, 0.4, 0.4);

	  highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

	  highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
	  vLighting = ambientLight + (directionalLightColor * directional);
	}
  `;

	// Fragment shader program

	const fsSource = `
	varying highp vec3 vLighting;
	varying highp vec2 vTextureCoord;
	precision mediump float;
	
	uniform bool grayScala;
	uniform float now;
	uniform sampler2D uSampler;
	
	
	vec4 colorize(in vec4 grayscale, in vec4 color) {
	  return (grayscale * color);
	}

	float modI(float a,float b) {
	  float m=a-floor((a+0.5)/b)*b;
		return floor(m+0.5);
	}
	
	vec4 toGrayscale(in vec4 color) {
	  float average = (color.r + color.g + color.b) / 3.0;
	  return vec4(average, average, average, 1.0);
	}
	
	void main(void) {
	  
	  highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
	  
	  if (grayScala){      //&& modI(now,10.0) < 10.0) {
		gl_FragColor = toGrayscale(vec4(texelColor.rgb * vLighting, texelColor.a));   

	  }
	  else {
		gl_FragColor = vec4(texelColor.rgb *vLighting, texelColor.a);
	  }
	}
  `;

	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

	// Collect all the info needed to use the shader program.
	// Look up which attributes our shader program is using
	// for aVertexPosition, aVevrtexColor and also
	// look up uniform locations.
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
			textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),

		},
		uniformLocations: {
			normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
			grayScala: gl.getUniformLocation(shaderProgram, 'grayScala'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			flashScala: gl.getUniformLocation(shaderProgram, 'flashScala'),
			uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
		},
	};

	const buffers2 = initBuffers2(gl);
	const buffers1 = initBuffers1(gl);
	const buffers = initBuffers(gl);

	const texture = loadTexture(gl, 'electric.jpg');
	const texture1 = loadTexture(gl, 'bg4.png');
	const texture2 = loadTexture(gl, 'bg5.png');

	var then = 0;
	// Draw the scene repeatedly
	function render(now) {
		now *= 0.001; // convert to seconds
		const deltaTime = now - then;
		then = now;
		if (!paused) {
			score2 += 0.01;
			DATA["score"] = Math.floor(score2 * 10);
			DATA["level"] = Math.ceil(DATA["score"] / 100);
			// console.log(DATA["level"]);
			document.getElementById("score").innerHTML = DATA["score"];
			document.getElementById("life").innerHTML = DATA["lives"];
			document.getElementById("level").innerHTML = DATA["level"];
			var isAlive = (DATA["lives"] > 0) ? false : true;
			if (isAlive) {
				game_over = true;
				console.log(game_over);
				var audio2 = new Audio("gameover.mp3");
				audio.pause();
				audio2.play();
				document.getElementById("load").innerHTML = "<img src='finish.jpg' alt='GAME OVER' height='950' width='1900' />"
			}

			console.log(game_over);
			gl.uniform1i(programInfo.uniformLocations.grayScala, grayScala);
			gl.uniform1i(programInfo.uniformLocations.flashScala, flashScala);
			flashScala = (now % 10 <= 8) ? false : true;
			//-----------------------------------------------------------------
			drawScene(gl, programInfo, buffers, texture, deltaTime);
			//-----------------------------------------------------------------
			drawScene1(gl, programInfo, buffers1, texture1, deltaTime);
			drawScene2(gl, programInfo, buffers2, texture2, deltaTime);
		}

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

	// Create a buffer for the cube's vertex positions.

	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Now create an array of positions for the cube.

	var pos1 = 0, n = 8, pi = 3.14159, angle = 0, theta = (2 * pi) / n, positions = [];
	for (var i = 0; i < n; i++) {
		for (var k = 0; k < 2; k++) {
			var tp1 = 2 * Math.cos(angle);
			var tp2 = 2 * Math.sin(angle);
			positions[pos1++] = tp1;
			positions[pos1++] = tp2;
			positions[pos1++] = -2.0;
			positions[pos1++] = tp1;
			positions[pos1++] = tp2;
			positions[pos1++] = -6.0;
			angle = angle + theta;
		}
		angle = angle - theta;
	}
	var len = positions.length;
	for (var j = 0; j < DATA["tunnel_length"]; j++) {
		for (var i = 0; i < len; i += 3) {
			var tp1 = positions[i];
			var tp2 = positions[i+1];
			var tp3 = positions[i + 2] - 4 * (j + 1);
			positions.push(tp1);
			positions.push(tp2);
			positions.push(tp3);
		}
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	//-------------------------------------------------------------------------------------------------

	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

	var vertexFaceNormals1 = [
		tunnel_face1, tunnel_face2, tunnel_face3, tunnel_face4, tunnel_face5, tunnel_face6, tunnel_face7, tunnel_face8
	];

	var vertexFaceNormals = [];
	for (var i = 0; i < 8; i++) {
		vertexFaceNormals = vertexFaceNormals.concat(vertexFaceNormals1[i]);
	}

	var vertexNormals = [];

	for (var i = 1; i < DATA["tunnel_length"] + 1; i++) {
		vertexNormals = vertexNormals.concat(vertexFaceNormals);
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

	//-------------------------------------------------------------------------------------------------
	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

	const faceTextureCoordinates = [
		// Face 1
		[0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0],
		// Face 2
		[1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
		// Face 3
		[1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0],
		// Face 4
		[0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
		// Face 5
		[0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0],
		// Face 6
		[1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
		// Face 7
		[1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0],
		// Face 8
		[0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
	];

	var texLen = faceTextureCoordinates.length;
	var textureCoordinates = [];

	for (var j = 0; j < DATA["tunnel_length"]; j++) {
		for (i = 0; i < texLen; i++) {
			textureCoordinates = textureCoordinates.concat(faceTextureCoordinates[i]);
		}
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

	const indices = [
		0, 1, 2, 1, 2, 3, // front
		4, 5, 6, 5, 6, 7, // back
		8, 9, 10, 9, 10, 11, // top
		12, 13, 14, 13, 14, 15, // bottom
		16, 17, 18, 17, 18, 19, // right
		20, 21, 22, 21, 22, 23, // left
		24, 25, 26, 25, 26, 27, // left
		28, 29, 30, 29, 30, 31, // left
	];

	var len = indices.length;
	for (j = 0; j < DATA["tunnel_length"]; j++) {
		for (i = 0; i < len; i++) {
			indices.push(indices[i] + (32 * (j + 1)));
		}
	}

	// Now send the element array to GL

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	var res = {position: positionBuffer, normal: normalBuffer, textureCoord: textureCoordBuffer, indices: indexBuffer};

	return res;
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, texture, deltaTime) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
	gl.clearDepth(1.0); // Clear everything
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things

	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const zNear = 0.1;
	const zFar = 100.0;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const fieldOfView = 45 * Math.PI / 180; // in radians
	const projectionMatrix = mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.

	mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, DATA["jump"], DATA["cubeTranslation"]]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, DATA["cubeRotation"], [0, 0, 1]); // axis to rotate around (Z)
	mat4.rotate(modelViewMatrix, modelViewMatrix, 0, [0, 1, 0]); // axis to rotate around (X)

	const normalMatrix = mat4.create();
	mat4.invert(normalMatrix, modelViewMatrix);
	mat4.transpose(normalMatrix, normalMatrix);

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute
	{
		const offset = 0;
		const normalize = false;
		const numComponents = 3;
		const type = gl.FLOAT;
		const stride = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
	}

	// Tell WebGL how to pull out the colors from the color buffer
	// into the vertexColor attribute.
	{
		const normalize = false;
		const type = gl.FLOAT;
		const stride = 0;
		const numComponents = 2; //----------------- 2 for texture
		const offset = 0;
		// gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);

		//---------------------------------------------------------------
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		//---------------------------------------------------------------

		gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
	}


	// Tell WebGL how to pull out the texture coordinates from
	// the texture coordinate buffer into the textureCoord attribute.
	{
		const normalize = false;
		const stride = 0;
		const type = gl.FLOAT;
		const numComponents = 2;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
	}

	{
		const normalize = false;
		const type = gl.FLOAT;
		const numComponents = 3;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
		gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
	}

	// Tell WebGL which indices to use to index the vertices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	// Tell WebGL to use our program when drawing

	gl.useProgram(programInfo.program);

	// Set the shader uniforms

	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);

	// Texture Code 
	//---------------------------------------------------------------------------------
	gl.activeTexture(gl.TEXTURE0); -

	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Tell the shader we bound the texture to texture unit 0
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	//--------------------------------------------------------------------------------


	{
		const vertexCount = 48 * DATA["tunnel_length"];
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}

	// Update the rotation for the next draw

	//DATA["cubeRotation"] += deltaTime;
	DATA["cubeTranslation"] += deltaTime * (15 + DATA["level"] * 5);
	if (DATA["cubeTranslation"] >= 320)
		DATA["cubeTranslation"] = 0;

	if (DATA["flag"] == 0) {
		pos += DATA["speed"];
		DATA["speed"] += DATA["gravity"];
		DATA["jump"] = 1 + pos;
		if (pos >= 0) {
			DATA["flag"] = 1;
		}
	}


}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const internalFormat = gl.RGBA;
	const border = 0;
	const height = 1;
	const srcFormat = gl.RGBA;
	const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
	const level = 0;
	const srcType = gl.UNSIGNED_BYTE;
	const width = 1;
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
		width, height, border, srcFormat, srcType,
		pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
			srcFormat, srcType, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (!(isPowerOf2(image.width) && isPowerOf2(image.height))) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);			
		}
		else {
			gl.generateMipmap(gl.TEXTURE_2D);			
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function togglePause() {
	paused = !paused;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	// Send the source to the shader object

	gl.shaderSource(shader, source);

	// Compile the shader program

	gl.compileShader(shader);

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}