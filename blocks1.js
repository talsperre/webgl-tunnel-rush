var newTranslate1 = [];
newTranslate1[0] = -50;
var newRotate1 = [];
newRotate1[0] = 20;

function initBuffers1(gl) {

	// Create a buffer for the cube's vertex positions.

	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Now create an array of positions for the cube.

	const blockFaces = [
		obs1_face1, obs1_face2, obs1_face3, obs1_face4, obs1_face5, obs1_face6
	];

	var blocks = [];
	for (var k = 0; k < blockFaces.length; k++) {
		blocks = blocks.concat(blockFaces[k]);
	}

	const textureCoordBuffer = gl.createBuffer();
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blocks), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

	const textureCoordinates = [
		// Front
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Back
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Top
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Bottom
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Right
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Left
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];

	const indexBuffer = gl.createBuffer();
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	const indices = [
		0, 1, 2, 0, 2, 3, // front
		4, 5, 6, 4, 6, 7, // back
		8, 9, 10, 8, 10, 11, // top
		12, 13, 14, 12, 14, 15, // bottom
		16, 17, 18, 16, 18, 19, // right
		20, 21, 22, 20, 22, 23, // left
	];

	// Now send the element array to GL

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	var res = { position: positionBuffer, textureCoord: textureCoordBuffer, indices: indexBuffer};
	
	return res;
}

//
// Draw the scene.
//
for (i = 0; i < DATA["nblock"] - 1; i++) {
	var tp1 = newTranslate1[i] - 100;
	var tp2 = Math.floor(Math.random() * 360);
	newTranslate1[i+1] = tp1;
	newRotate1[i+1] = tp2;
}

function drawScene1(gl, programInfo, buffers, texture, deltaTime) {

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const zFar = 100.0;
	const zNear = 0.1;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const fieldOfView = 45 * Math.PI / 180; // in radians
	const projectionMatrix = mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.

	for (i = 0; i < DATA["nblock"]; i++) {
		const modelViewMatrix = mat4.create();
		var tp1 = DATA["cubeTranslation1"] + newTranslate1[i];
		var tp2 = DATA["cubeRotation1"] + newRotate1[i];

		mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, DATA["jump"], tp1]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, tp2, [0, 0, 1]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, 0, [0, 1, 0]);

		var num = DATA["cubeTranslation1"] + newTranslate1[i];
		var M_PI = 3.14;
		if (num > -1.0 && num < 0.0) {

			var num1 = Math.floor(tp2 * 180.0 / M_PI + 360) % 360;
			var num2 = Math.floor(DATA["cubeRotation"] * 180.0 / M_PI) % 360;
			var diff = Math.abs((tp2 - DATA["cubeRotation"]) * 180.0 / M_PI + 360);
			var kl = Math.floor(diff) % 360;
			var diff1 = Math.abs((tp2 + 3.14 - DATA["cubeRotation"]) * 180.0 / M_PI + 360);
			var kl1 = Math.floor(diff1) % 360;
			is_collide = false;

			num1 = num1 % 180;
			if (num1 < 35 || num1 > 140) {
				newTranslate1[i] += 10;
				is_collide = true;
				audio.pause();
				audio1.play();
				DATA["lives"] -= 1;
			}
			audio.play();
		}

		{
			const numComponents = 3;
			const type = gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
			gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
			gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
		}

		// Tell WebGL how to pull out the colors from the color buffer
		// into the vertexColor attribute.
		{
			const num = 2; // every coordinate composed of 2 values
			const type = gl.FLOAT; // the data in the buffer is 32 bit float
			const normalize = false; // don't normalize
			const stride = 0; // how many bytes to get from one set to the next
			const offset = 0; // how many bytes inside the buffer to start from
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
			gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
			gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
		}

		// Tell WebGL which indices to use to index the vertices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

		// Tell WebGL to use our program when drawing

		gl.useProgram(programInfo.program);

		// Set the shader uniforms

		gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

		gl.activeTexture(gl.TEXTURE0);

		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

		{
			const vertexCount = 36;
			const type = gl.UNSIGNED_SHORT;
			const offset = 0;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}
	}
	if (DATA["level"] - 1 < 0) {
		DATA["cubeRotation1"] = DATA["cubeRotation1"] + 0;
	}
	else if (DATA["level"] > 1) {
		DATA["cubeRotation1"] = DATA["cubeRotation1"] + deltaTime;
	}
	if (DATA["cubeTranslation1"] + deltaTime * 20 >= 1000) {
		DATA["cubeTranslation1"] = 0;
	}
	else {
		DATA["cubeTranslation1"] = DATA["cubeTranslation1"] + deltaTime * 20;
	}
}