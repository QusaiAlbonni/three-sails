uniform float time;
uniform float waterHeight;
uniform float k;
uniform float maxAmplitude;
uniform float waveOffset;
uniform float minDistance;
uniform float maxDistance;
uniform float normalStrength;

uniform float amplitude[NUM_OF_WAVES];
uniform float wavelength[NUM_OF_WAVES];
uniform float speed[NUM_OF_WAVES];
uniform vec2 direction[NUM_OF_WAVES];

varying float height;
varying vec3 fragPos;

float dWavedxExp(int i, float x, float y) {
    float frequency = 2.0 / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    float A = maxAmplitude * amplitude[i] * direction[i].x * frequency;
    return A * cos(theta * frequency + time * phase) * pow(e, sin(theta * frequency + time * phase) - waveOffset);
}

float dWavedyExp(int i, float x, float y) {
    float frequency = 2.0 / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    float A = maxAmplitude * amplitude[i] * direction[i].y * frequency;
    return A * cos(theta * frequency + time * phase) * pow(e, sin(theta * frequency + time * phase) - waveOffset);
}

float dWavedxPoly(int i, float x, float y) {
    float frequency = 2.0 / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    float A = 2.0 * k * amplitude[i] * direction[i].x * frequency;
    return A * cos(theta * frequency + time * phase) * pow((sin(theta * frequency + time * phase) + 1.0) / 2.0, k - 1.0);
}

float dWavedyPoly(int i, float x, float y) {
    float frequency = 2.0 / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    float A = 2.0 * k * amplitude[i] * direction[i].y * frequency;
    return A * cos(theta * frequency + time * phase) * pow((sin(theta * frequency + time * phase) + 1.0) / 2.0, k - 1.0);
}

float dWavedx(int i, float x, float y) {
    float frequency = 2.0 * pi / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    float A = amplitude[i] * direction[i].x * frequency;
    return A * cos(theta * frequency + time * phase);
}

float dWavedy(int i, float x, float y) {
    float frequency = 2.0 * pi / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    float A = amplitude[i] * direction[i].y * frequency;
    return A * cos(theta * frequency + time * phase);
}

float wavePoly(int i, float x, float y) {
    float frequency = (2.0) / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    return 2.0 * amplitude[i] * pow((sin(theta * frequency + time * phase) + 1.0) / 2.0, k);
}

float waveExp(int i, float x, float y) {
    float frequency = (2.0) / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    return amplitude[i] * pow(e, maxAmplitude * sin(theta * frequency + time * phase) - waveOffset);
}

float wave(int i, float x, float y) {
    float frequency = (2.0) / wavelength[i];
    float phase = speed[i] * frequency;
    float theta = dot(direction[i], vec2(x, y));
    return amplitude[i] * sin(theta * frequency + time * phase);
}

vec3 waveHeight(float x, float y, int numOfWaves) {
    float height = 0.0;
    float a, b;
    a = x;
    b = y;
    for(int i = 1; i < numOfWaves; ++i) {
        
        #if WAVE_FUNCTION == 2
        x += dWavedxExp(i - 1, x, y);
        y += dWavedyExp(i - 1, x, y);
        height += waveExp(i, a, b);
        #elif WAVE_FUNCTION == 1
        x += dWavedxPoly(i - 1, x, y);
        y += dWavedyPoly(i - 1, x, y);
        height += wavePoly(i, x, y);
        #else
        x += dWavedx(i - 1, x, y);
        y += dWavedy(i - 1, x, y);
        height += wave(i, x, y);
        #endif
    }
    return vec3(x, height, y);
}

vec3 waveNormal(float x, float y, int numOfWaves, float height) {
    float dx = 0.0;
    float dy = 0.0;
    float ampSum = 0.0;
    for(int i = 1; i < numOfWaves; ++i) {
        #if WAVE_FUNCTION == 2
        //x += dWavedxExp(i - 1, x, y);
        //y += dWavedyExp(i - 1, x, y);
        #elif WAVE_FUNCTION == 1
        x += dWavedxPoly(i - 1, x, y);
        y += dWavedyPoly(i - 1, x, y);
        #else
        x += dWavedx(i - 1, x, y);
        y += dWavedy(i - 1, x, y);
        #endif
        dx +=
        #if WAVE_FUNCTION == 1
        dWavedxPoly(i, x, y);
        #elif WAVE_FUNCTION == 2
        dWavedxExp(i, x, y);
        #else
        dWavedx(i, x, y);
        #endif
        dy +=
        #if WAVE_FUNCTION == 1
        dWavedyPoly(i, x, y);
        #elif WAVE_FUNCTION == 2
        dWavedyExp(i, x, y);
        #else
        dWavedy(i, x, y);
        #endif
    }
    vec3 n = vec3(-dx, 0.5, -dy);
    return normalize(n);
}
