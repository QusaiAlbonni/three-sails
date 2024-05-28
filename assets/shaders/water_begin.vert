vec4 transformedPos =modelMatrix * vec4(position, 1.0);
float distance = distance(cameraPosition, (transformedPos).xyz);
float normalizedDistance = clamp((distance - minDistance) / (maxDistance - minDistance), 0.0, 1.0);
float lodFactor = 1.0 - normalizedDistance;
lodFactor = smoothstep(0.0, 1.0, lodFactor);
int numWaves = int(ceil(float(NUM_OF_WAVES) * lodFactor));

vec3 wavesVector = waveHeight(transformedPos.x, transformedPos.z, numWaves);
float waveHeight = wavesVector.y;
height = waveHeight;
transformedPos.y += waveHeight;
transformedPos.x = wavesVector.x;
transformedPos.z = wavesVector.z;
mat4 inverseModelMatrix = inverse(modelMatrix);

vec3 myNormal = (transpose(inverse(viewMatrix)) * vec4(waveNormal(transformedPos.x, transformedPos.z, numWaves, waveHeight), 1.0)).xyz;
myNormal = myNormal;
#ifndef FLAT_SHADED
vNormal = normalize(myNormal);
#endif


vec3 transformed = (inverseModelMatrix * transformedPos).xyz;