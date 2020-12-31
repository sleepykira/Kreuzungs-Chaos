"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    //import fcaid = FudgeAid;
    let VEHICLE_TYPE;
    (function (VEHICLE_TYPE) {
        VEHICLE_TYPE[VEHICLE_TYPE["CAR"] = 0] = "CAR";
        VEHICLE_TYPE[VEHICLE_TYPE["TRUCK"] = 1] = "TRUCK";
        VEHICLE_TYPE[VEHICLE_TYPE["BUS"] = 2] = "BUS";
        VEHICLE_TYPE[VEHICLE_TYPE["POLICE"] = 3] = "POLICE";
        VEHICLE_TYPE[VEHICLE_TYPE["PARAMEDIC"] = 4] = "PARAMEDIC";
    })(VEHICLE_TYPE = KreuzungsChaos.VEHICLE_TYPE || (KreuzungsChaos.VEHICLE_TYPE = {}));
    window.addEventListener("load", hndLoad);
    KreuzungsChaos.root = new fc.Node("Root");
    KreuzungsChaos.vehicles = new fc.Node("Vehicles");
    KreuzungsChaos.clrWhite = fc.Color.CSS("white");
    //NOT CHANGEABLE
    KreuzungsChaos.switchCooldown = false;
    let carCounter;
    let background = new fc.Node("Background");
    let mtrCurrentLightstate;
    let trafficlight;
    function hndLoad(_event) {
        //Variables and Constants
        const canvas = document.querySelector("canvas");
        KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
        mtrCurrentLightstate = new fc.Material("Lightstate", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
        KreuzungsChaos.previousState = 1;
        KreuzungsChaos.currentState = 1;
        KreuzungsChaos.difficulty = 750;
        carCounter = 0;
        //Camera
        let cmpCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translate(new fc.Vector3(15, 15, 40));
        cmpCamera.pivot.rotateY(180);
        cmpCamera.backgroundColor = fc.Color.CSS("black");
        //Viewport
        KreuzungsChaos.viewport = new fc.Viewport;
        KreuzungsChaos.viewport.initialize("Viewport", KreuzungsChaos.root, cmpCamera, canvas);
        //Functions to load up game
        createGameEnvironment();
        createLights();
        createCar();
        hndTraffic(KreuzungsChaos.difficulty);
        //Timers
        //Initialize Loop
        fc.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
        console.log(KreuzungsChaos.vehicles.getChildren().length);
    }
    function hndLoop(_event) {
        if (KreuzungsChaos.switchCooldown == false) {
            trafficlight.hndControl();
        }
        if (trafficlight.stateUpdate != KreuzungsChaos.currentState) {
            updateLights(trafficlight.stateUpdate);
            KreuzungsChaos.currentState = trafficlight.stateUpdate;
        }
        for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
            let currentVehicle = KreuzungsChaos.vehicles.getChild(i);
            currentVehicle.followPath(currentVehicle.endLocation);
            currentVehicle.checkOutOfBounds();
            //console.log(currentVehicle.mtxLocal.translation);
        }
        KreuzungsChaos.viewport.draw();
    }
    function createGameEnvironment() {
        let txtBackground = new fc.TextureImage("../textures/base_clean.png");
        let mtrBackground = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtBackground));
        background.appendChild(new KreuzungsChaos.Background(mtrBackground, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 0)));
        let txtLights = new fc.TextureImage("../textures/base_lights_only.png");
        let mtrLights = new fc.Material("Lights", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtLights));
        background.appendChild(new KreuzungsChaos.Background(mtrLights, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 2)));
        let txtBorder = new fc.TextureImage("../textures/border.png");
        let mtrBorder = new fc.Material("Border", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtBorder));
        background.appendChild(new KreuzungsChaos.Background(mtrBorder, new fc.Vector2(25, 25), new fc.Vector3(15, 15, 10)));
        /* let txtCross: fc.TextureImage = new fc.TextureImage("../textures/cross.png");
        let mtrCross: fc.Material = new fc.Material("Cross", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCross));

        background.appendChild(new Background(mtrCross, new fc.Vector2(1, 1), new fc.Vector3(0, 13.75, .1))); */
        return background;
    }
    function createLights() {
        let lightstate = new fc.Node("Lightstate");
        trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), KreuzungsChaos.previousState);
        trafficlight.appendChild(lightstate);
        background.appendChild(trafficlight);
        KreuzungsChaos.root.appendChild(background);
        KreuzungsChaos.previousState = trafficlight.state.valueOf();
        return trafficlight;
    }
    function createCar() {
        carCounter++;
        let startlocation;
        let decideRandomLocation = Math.random() * 10;
        if (decideRandomLocation <= 2.5) {
            startlocation = KreuzungsChaos.LOCATION.BOT;
        }
        else if (decideRandomLocation > 2.5 && decideRandomLocation < 5) {
            startlocation = KreuzungsChaos.LOCATION.RIGHT;
        }
        else if (decideRandomLocation > 5 && decideRandomLocation < 7.5) {
            startlocation = KreuzungsChaos.LOCATION.TOP;
        }
        else {
            startlocation = KreuzungsChaos.LOCATION.LEFT;
        }
        let newCar = new KreuzungsChaos.Car("Car_" + carCounter, new fc.Vector3(50, 50, .1), startlocation, colorGenerator());
        newCar.mtxLocal.translation = newCar.translateLocation(startlocation);
        KreuzungsChaos.vehicles.addChild(newCar);
        KreuzungsChaos.root.addChild(KreuzungsChaos.vehicles);
    }
    function hndTraffic(_difficulty) {
        let randomFactor = (Math.random() - 0.5) * 100;
        _difficulty = _difficulty + randomFactor;
        fc.Time.game.setTimer(_difficulty, 0, createCar);
    }
    function updateLights(_number) {
        switch (_number) {
            case 0:
                background.removeChild(trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 0);
                background.addChild(trafficlight);
                KreuzungsChaos.root.addChild(background);
                break;
            case 1:
                background.removeChild(trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 1);
                background.addChild(trafficlight);
                KreuzungsChaos.root.addChild(background);
                break;
            case 2:
                background.removeChild(trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/side_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Side_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 2);
                background.addChild(trafficlight);
                KreuzungsChaos.root.addChild(background);
                break;
            default:
                break;
        }
    }
    function colorGenerator() {
        let colorInt = Math.random();
        if (colorInt <= 0.2) {
            return 0;
        }
        else if (colorInt > 0.2 && colorInt <= 0.4) {
            return 1;
        }
        else if (colorInt > 0.24 && colorInt <= 0.6) {
            return 2;
        }
        else if (colorInt > 0.6 && colorInt <= 0.8) {
            return 3;
        }
        else {
            return 4;
        }
    }
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=game.js.map