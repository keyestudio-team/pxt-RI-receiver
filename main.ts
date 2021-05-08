// keyestudio Infrared Wireless Module Kit for microbit
// (receiver module+remote controller)
// author: jieliang mo
// github:https://github.com/mworkfun
// Write the date: 2020-5-15

const enum IrButton {
    //% block=" "
    Any = -1,
    //% block="▲"
    Up = 70,
    //% block=" "
    Unused_2 = -2,
    //% block="◀"
    Left = 68,
    //% block="OK"
    Ok = 64,
    //% block="▶"
    Right = 67,
    //% block=" "
    Unused_3 = -3,
    //% block="▼"
    Down = 21,
    //% block=" "
    Unused_4 = -4,
    //% block="1"
    Number_1 = 22,
    //% block="2"
    Number_2 = 25,
    //% block="3"
    Number_3 = 13,
    //% block="4"
    Number_4 = 12,
    //% block="5"
    Number_5 = 24,
    //% block="6"
    Number_6 = 94,
    //% block="7"
    Number_7 = 8,
    //% block="8"
    Number_8 = 28,
    //% block="9"
    Number_9 = 90,
    //% block="*"
    Star = 66,
    //% block="0"
    Number_0 = 82,
    //% block="#"
    Hash = 74
}
/**
 * create IR_receiver namespace
 * use for keyestudio IR receiver and IR emission kit
 * author: jieliang mo
 * Write the date: 2020-5-15
 */
//% color="#ff6800" weight=10 icon="\uf1eb"
namespace irReceiver {
    /**
     * define a IR receiver class
     */
    class irReceiver {
        constructor() {
            this.address = 0;
            this.command = 0;
        }
        address: number;
        command: number;
        IR_pin: DigitalPin;
    }
    //create a IR receiver class
    let IR_R = new irReceiver;

    //define nec_IR maximum number of pulses is 33.
    //create 2 pulse cache array.
    let maxPulse: number = 33;
    let low_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let high_pulse: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    //must define for 33,
    //otherwise there is a risk of error in receiving the first data.
    let LpulseCounter: number = 33;
    let HpulseCounter: number = 33;

    let LpulseTime: number = 0;
    let HpulseTime: number = 0;
    //let pulse9ms: boolean = false;
    //let pulse4ms: boolean = false;
    //This variable will become true when the pulse is repeated
    //let repeatedPulse: boolean = false;

    /**
     * initialize the IR receiver function
     */
    function irInit(IR_pin: DigitalPin) {
        pins.onPulsed(IR_pin, PulseValue.Low, () => {      //interrupt event
            LpulseTime = pins.pulseDuration();             //measure the pulse
            if (8250 < LpulseTime && LpulseTime < 9250) {  //9ms
                LpulseCounter = 0;
            }
            if (LpulseCounter < maxPulse /*&& repeatedPulse == false*/) {
                low_pulse[LpulseCounter] = LpulseTime;
                LpulseCounter += 1;
            }
        });
        pins.onPulsed(IR_pin, PulseValue.High, () => {
            HpulseTime = pins.pulseDuration();
            /*if (2000 < HpulseTime && HpulseTime < 2500) {  //2.25ms
                repeatedPulse = true;
            }*/
            if (4250 < HpulseTime && HpulseTime < 4750) {  //4.5ms
                HpulseCounter = 0;
                //repeatedPulse = false;
            }
            if (HpulseCounter < maxPulse /*&& repeatedPulse == false*/) {
                high_pulse[HpulseCounter] = HpulseTime;
                HpulseCounter += 1;
            }
        });
    }
    /**
    * Convert the pulse into data function
    * author: jieliang mo
    * github:https://github.com/mworkfun
    * Write the date: 2020-5-15
    */
    function irDataProcessing() {
        let tempAddress: number = 0;
        let inverseAddress: number = 0;
        let tempCommand: number = 0;
        let inverseCommand: number = 0;
        let num: number;
        //confirm start pulse
        if (8250 < low_pulse[0] && low_pulse[0] < 9250 && HpulseCounter >= 33) {
            //conver the pulse into data
            for (num = 1; num < maxPulse; num++) {
                //if (440 < low_pulse[num] && low_pulse[num] < 680) {      //0.56ms
                if (1400 < high_pulse[num] && high_pulse[num] < 2000) {  //1.69ms = 1, 0.56ms = 0
                    if (1 <= num && num < 9) {    //conver the pulse into address
                        tempAddress |= 1 << (num - 1);
                    }
                    if (9 <= num && num < 17) {   //conver the pulse into inverse address
                        inverseAddress |= 1 << (num - 9);
                    }
                    if (17 <= num && num < 25) {   //conver the pulse into command
                        tempCommand |= 1 << (num - 17);
                    }
                    if (25 <= num && num < 33) {   //conver the pulse into inverse command
                        inverseCommand |= 1 << (num - 25);
                    }
                }
                //}
            }
            low_pulse[0] = 0;
            //check the data and return the data to IR receiver class.
            if ((tempAddress + inverseAddress == 0xff) && (tempCommand + inverseCommand == 0xff)) {
                IR_R.address = tempAddress;
                IR_R.command = tempCommand;
                return;
            } else {  //Return -1 if check error.
                IR_R.address = -1;
                IR_R.command = -1;
                return;
            }
        }
        IR_R.address = 0;
        IR_R.command = 0;
    }
    /**
     * Connects to the IR receiver module at the specified pin.
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-5-15
     */
    //% blockId="infrared_connect"
    //% block="connect IR receiver at %IR_pin"
    //% IR_pin.fieldEditor="gridpicker"
    //% IR_pin.fieldOptions.columns=4
    //% IR_pin.fieldOptions.tooltips="false"
    //% weight=99
    export function connectInfrared(IR_pin: DigitalPin): void {
        IR_R.IR_pin = IR_pin;   //define IR receiver control pin
        pins.setPull(IR_R.IR_pin, PinPullMode.PullUp);
        irInit(IR_R.IR_pin);   //initialize the IR receiver
    }
    /**
     * Returns the command code of a specific IR button.
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-5-15
     */
    //% blockId=infrared_button
    //% button.fieldEditor="gridpicker"
    //% button.fieldOptions.columns=3
    //% button.fieldOptions.tooltips="false"
    //% block="IR button %button"
    //% weight=98
    export function irButton(button: IrButton): number {
        return button as number;
    }
    /**
     * Returns the code of the IR button that is currently pressed and 0 if no button is pressed.
     * It is recommended to delay 110ms to read the data once
     * author: jieliang mo
     * github:https://github.com/mworkfun
     * Write the date: 2020-5-18
     */
    //% blockId=infrared_pressed_button
    //% block="IR button"
    //% weight=97
    export function returnIrButton(): number {
        irDataProcessing();
        return IR_R.command;
    }
}

