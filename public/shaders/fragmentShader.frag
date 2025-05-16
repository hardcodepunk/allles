precision mediump float;

uniform vec3 uLightAPosition;
uniform float uLightAIntensity;

uniform vec3 uLightBPosition;
uniform float uLightBIntensity;

uniform vec3 uCameraPosition;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);

    vec3 lightDirA = normalize(uLightAPosition - vPosition);
    vec3 lightDirB = normalize(uLightBPosition - vPosition);

    float diffA = max(dot(normal, lightDirA), 0.0) * uLightAIntensity;
    float diffB = max(dot(normal, lightDirB), 0.0) * uLightBIntensity;

    float diffuse = clamp(diffA + diffB, 0.1, 1.0);

    vec3 baseColor = vec3(0.3); // dark grey base color
    vec3 finalColor = baseColor * diffuse;

    gl_FragColor = vec4(finalColor, 1.0);
}
