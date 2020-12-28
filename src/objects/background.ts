namespace KreuzungsChaos {

    import fc = FudgeCore;

    export class Background extends GameObject {

        public constructor(_material: fc.Material, _size: fc.Vector2, _position: fc.Vector3) {

            super("Background", _size, _position);

            let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(_material);
            //cmpMaterial.pivot.scale(fc.Vector2.ONE(1));
            this.addComponent(cmpMaterial);

        }
        

    }

}