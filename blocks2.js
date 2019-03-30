var newTranslate = [];
newTranslate[0] = -100;
var newRotate = [];
newRotate[0] = 50;

function initBuffers2(gl) {

	const positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	const blockFaces = [
		obs2_face1, obs2_face2, obs2_face3, obs2_face4, obs2_face5, obs2_face6, obs2_face7, obs2_face8, obs2_face9, obs2_face10, obs2_face11, obs2_face12
	];

	var blocks = [];
	for (var k = 0; k < blockFaces.length; k++) {
		blocks = blocks.concat(blockFaces[k]);
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blocks), gl.STATIC_DRAW);

	const textureCoordBuffer = gl.createBuffer();
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

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	const indices = [
		0, 1, 2, 0, 2, 3, // front
		4, 5, 6, 4, 6, 7, // back
		8, 9, 10, 8, 10, 11, // top
		12, 13, 14, 12, 14, 15, // bottom
		16, 17, 18, 16, 18, 19, // right
		20, 21, 22, 20, 22, 23, // left
	];
	
	for (i = 0; i < 36; i++) {
		var tp = indices[i] + 24;
		indices.push(tp);
	}

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	var res = {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
	}

	return res;
}

for (i = 0; i < DATA["nblock1"] - 1; i++) {
	var tp1 = newTranslate[i] - 100;
	var tp2 = Math.floor(Math.random() * 360);
	newTranslate[i+1] = tp1;
	newRotate[i+1] = tp2;
}

function drawScene2(gl, programInfo, buffers, texture, deltaTime) {
	const zFar = 100.0;
	const zNear = 0.1;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const fieldOfView = 45 * Math.PI / 180; // in radians
	const projectionMatrix = mat4.create();

	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	for (i = 0; i < DATA["nblock1"]; i++) {
		const modelViewMatrix = mat4.create();
		var tp1 = DATA["cubeTranslation2"] + newTranslate[i];
		var tp2 = DATA["cubeRotation2"] + newRotate[i];
		mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, DATA["jump"], tp1]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, tp2, [0, 0, 1]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, 0, [0, 1, 0]);

		var num = DATA["cubeTranslation2"] + newTranslate[i];
		var M_PI = 3.14;
		
		if (num > -1.0 && num < 0.0) {
			var num1 = Math.floor(tp2 * 180.0 / M_PI + 360) % 360;
			var num2 = Math.floor(DATA["cubeRotation"] * 180.0 / M_PI) % 360;
			var diff = Math.abs((tp2 - DATA["cubeRotation"]) * 180.0 / M_PI + 360);
			var kl = Math.floor(diff) % 360;
			var diff1 = Math.abs((tp2 + M_PI - DATA["cubeRotation"]) * 180.0 / M_PI + 360);
			var kl1 = Math.floor(diff1) % 360;
			is_collide = false;

			num1 = num1 % 180;
			if (!(num1 < 20 || num1 > 170)) {
				DATA["lives"] -= 1;
				is_collide = true;
				audio.pause();
				audio1.play();
				newTranslate[i] += 10;
			}
			audio.play();
		}
		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute
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

		// tell webgl how to pull out the texture coordinates from buffer
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

		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);

		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

		{
			const vertexCount = 72;
			const type = gl.UNSIGNED_SHORT;
			const offset = 0;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}

		// Update the rotation for the next draw
	}

	if (DATA["level"] - 1 < 0) {
		DATA["cubeRotation2"] = DATA["cubeRotation2"] + 0;
	}
	else if (DATA["level"] > 1) {
		DATA["cubeRotation2"] = DATA["cubeRotation2"] + deltaTime;
	}
	if (DATA["cubeTranslation2"] + deltaTime * 20 >= 1000) {
		DATA["cubeTranslation2"] = 0;
	}
	else {
		DATA["cubeTranslation2"] = DATA["cubeTranslation2"] + deltaTime * 20;
	}
}
