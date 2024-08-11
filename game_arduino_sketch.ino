/**
 * Arduino sketch with a potentiometer as input and servo as output.
 */

/**
 * Servo control pin.
 */
const int servoPin = 3;

/**
 * Potentiometer needs to be connected to 5V, GND, and this pin
 */
const int potPin = A0;

void setup() {
    pinMode(servoPin, OUTPUT);  // Set the servo pin as an output
    pinMode(potPin, INPUT);     // Set the potentiometer pin as an input
    Serial.begin(9600);
}

void loop() {
    // Potentiometer input.
    float potRead = analogRead(potPin);

    // Game input.
    int extGame = map(potRead, 0, 1023, 0, 100);
    Serial.println(extGame);

    // Write to servo.
    float angle = map(potRead, 0, 1023, 500, 2500);
    digitalWrite(servoPin, HIGH);
    delayMicroseconds(angle);
    digitalWrite(servoPin, LOW);

    delay(15);
}
