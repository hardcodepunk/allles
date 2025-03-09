precision mediump float; // Ensure correct float precision for WebGL

// Uniforms for lighting
uniform vec3 uLightAPosition;
uniform float uLightAIntensity;

uniform vec3 uLightBPosition;
uniform float uLightBIntensity;

// Varyings received from vertex shader
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Compute light directions
    vec3 lightDirA = normalize(uLightAPosition - vPosition);
    vec3 lightDirB = normalize(uLightBPosition - vPosition);

    // Calculate diffuse shading (grayscale light intensity)
    float lightIntensityA = max(dot(vNormal, lightDirA), 0.0) * uLightAIntensity;
    float lightIntensityB = max(dot(vNormal, lightDirB), 0.0) * uLightBIntensity;

    // Combine both light intensities (grayscale)
    float lightIntensity = (lightIntensityA + lightIntensityB) * 0.5;
    lightIntensity = clamp(lightIntensity, 0.2, 1.0);

    // Output grayscale color
    gl_FragColor = vec4(vec3(lightIntensity), 1.0);
}
