var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,
    
	init: function (options) {
		var self = this;
        //console.log(options);
        this.players = {};
        this.waitroom = {};
        //this.food = {};
        this.room = {};
        this.roomnum = 0;
        this.teamSpawn = {
            xA:0,
            yA:0,
            xB:0,
            yB:0
        }
        this.implement(ServerNetworkEvents);
        ige.addComponent(IgeBox2dComponent)
			.box2d.sleep(true)
			.box2d.gravity(0, 10)
			.box2d.createWorld()
			.box2d.start();
		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(8888, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						ige.network.on('connect', function(){});
						ige.network.on('disconnect', self._onPlayerDisconnect);
                        
                        ige.network.define('gameStart', self._onGameStart);
                        ige.network.define('gameEnd', self._onGameEnd);
                        ige.network.define('playerMove', self._onPlayerMove);
                        ige.network.define('playerMoveFin', self._onPlayerMoveFin);
                        ige.network.define('playerEntity', self._onPlayerEntity);
                        ige.network.define('playerUpdate', self._onPlayerUpdate);
                        ige.network.define('playerAttackStart', self._onPlayerAttackStart);
                        ige.network.define('playerAttackEnd', self._onPlayerAttackEnd);
                        ige.network.define('playerHit', self._onPlayerHit);
                        ige.network.define('joinRoom', self._clientJoinRoom);
                        //ige.network.define('playerDestroy', self._onPlayerDestroy);
                        
                        ige.network.define('foodEntity', self._onFoodEntity);
						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Load the base scene data
						//ige.addGraph('IgeBaseScene');
                        
                        self.startGame = function(roomId){
                            //self.createScene();
                            self.createObjects(roomId);
                        }
                        self.createContacts();
                        
                        //self.startGame();
                        //console.log(ige.server);
					}
				});
			});
	},
    
    createRoom: function(roomid){
        var self = this;
        //console.log(roomid);
        var room = new IgeScene2d()
            .id(roomid)
            .streamRoomId(roomid)
            //.streamMode(1)
            //.compositeStream(true)
            .ignoreCamera(false);
        
        this.room[roomid] = {
            //scene:mainScene,
            room:room,
            vp:null,
            food:{},
            players:{},
            teamA:{},
            teamB:{},
            objectCreated:false
        };
        
        this.room[roomid].vp = new IgeViewport()
            .id('vp'+roomid)
            .autoSize(true)
            .scene(this.room[roomid].room)
            .drawBounds(true)
            .mount(ige);
        
        /*
        var room = new IgeScene2d()
            .id('room'+this.roomnum)
            .streamRoomId('room'+this.roomnum)
            .streamMode(1)
            .compositeStream(true)
            .ignoreCamera(false);
        
        this.room['room'+this.roomnum] = {
            //scene:mainScene,
            room:room,
            vp:null
        };
        this.room['room'+this.roomnum].vp = new IgeViewport()
            .id('vproom'+this.roomnum)
            .autoSize(true)
            .scene(this.room['room'+this.roomnum].room)
            .drawBounds(true)
            .mount(ige);
        */
        
        /*this.roomnum++;
        
        var room = new IgeScene2d()
            .streamRoomId('room'+this.roomnum)
            .streamMode(1)
            .compositeStream(true)
            .ignoreCamera(false)
            .mount(this.mainScene);
        /*var mainScene = new IgeScene2d()
            .id('mainScene');
        
        this.room['room'+this.roomnum] = {
            //scene:mainScene,
            room:room,
            vp:null
        };*/
            
        
        //this.createVp('room'+this.roomnum);
        //this.createScene();
        //this.createObjects('room'+this.roomnum);
    },
    
    createVp: function(roomId){
        this.room[roomId].vp = new IgeViewport()
        .id('vp2')
        .autoSize(true)
        .scene(this.room[roomId].scene)
        .drawBounds(true)
        .mount(ige);
    },
    
    createScene: function(){
        var self = this;
         // Create the scene
        /*self.mainScene = new IgeScene2d()
            .id('mainScene');*/

        // Create the scene
        /*self.scene1 = new IgeScene2d()
            .id('scene1')
            .mount(self.mainScene);
        
        
        // Create the main viewport and set the scene
        // it will "look" at as the new scene1 we just
        // created above*/
        /*self.vp = new IgeViewport()
            .id('vp2')
            .autoSize(true)
            .scene(self.mainScene)
            .drawBounds(true)
            .mount(ige);*/
        
        //this.createRoom();
    },
    
    createObjects: function(roomId){
        var self = this;
        self.dimenx = 1000;
        self.dimeny = 700;
        self.divnum = 80;
        self.box = 70;

        var timer = new IgeInterval(function(){
            //console.log(self.food.length < Object.keys(self.players).length*5, self.food.length, self.players.length);
            if(Object.keys(self.room[roomId].food).length < Object.keys(self.room[roomId].players).length*5){
                var f = new Food()
                .width(50)
                .height(50)
                .category("food")
                .box2dBody({
                    type: 'dynamic',
                    linearDamping: 0.0,
                    angularDamping: 0.1,
                    allowSleep: true,
                    bullet: false,
                    gravitic: false,
                    fixedRotation: false,
                    fixtures: [{
                        density: 1.0,
                        friction: 0.5,
                        restitution: 0.2,
                        shape: {
                            type: 'rectangle'
                        }
                    }]
                })
                .translateTo(Math.round(Math.random()*(self.dimenx-40))+20, Math.round(Math.random()*(self.dimeny-40))+20, 0)
                .streamMode(1)
                .mount(self.room[roomId].room);
                self.room[roomId].food[f.id()] = f;
                //ige.network.send("foodEntity", {food:self.food});
            }
        }, 1000);

        self.teamSpawn.xA = 100;
        self.teamSpawn.yA = self.dimeny/2;
        self.teamSpawn.yB = self.dimeny/2;
        self.teamSpawn.xB = self.dimenx-100;
        for (var i = 0; i<self.dimenx/self.divnum; i++){
            new Rocks(-i)
            .category("rocks")
            .width(self.box)
            .height(self.box)
            .box2dBody({
                type: 'static',
                linearDamping: 0.0,
                angularDamping: 0.1,
                allowSleep: true,
                bullet: false,
                gravitic: false,
                fixedRotation: false,
                fixtures: [{
                    shape: {
                        type: 'rectangle'
                    }
                }]
            })
            .translateTo(i*self.divnum,0,0)
            .streamMode(1)
            .mount(self.room[roomId].room);
        }

        for (var i = 0; i<self.dimeny/self.divnum; i++){
            new Rocks(i*self.divnum)
            .category("rocks")
            .width(self.box)
            .height(self.box)
            .box2dBody({
                type: 'static',
                linearDamping: 0.0,
                angularDamping: 0.1,
                allowSleep: true,
                bullet: false,
                gravitic: false,
                fixedRotation: false,
                fixtures: [{
                    shape: {
                        type: 'rectangle'
                    }
                }]
            })
            .translateTo(0,i*self.divnum,0)
            .streamMode(1)
            .mount(self.room[roomId].room);
        }

        for (var i = 0; i<self.dimeny/self.divnum; i++){
            new Rocks(i*self.divnum)
            .category("rocks")
            .width(self.box)
            .height(self.box)
            .box2dBody({
                type: 'static',
                linearDamping: 0.0,
                angularDamping: 0.1,
                allowSleep: true,
                bullet: false,
                gravitic: false,
                fixedRotation: false,
                fixtures: [{
                    shape: {
                        type: 'rectangle'
                    }
                }]
            })
            .translateTo(self.dimenx,i*self.divnum,0)
            .streamMode(1)
            .mount(self.room[roomId].room);
        }

        for (var i = 0; i<self.dimenx/self.divnum; i++){
            new Rocks(self.dimeny+i)
            .category("rocks")
            .width(self.box)
            .height(self.box)
            .box2dBody({
                type: 'static',
                linearDamping: 0.0,
                angularDamping: 0.1,
                allowSleep: true,
                bullet: false,
                gravitic: false,
                fixedRotation: false,
                fixtures: [{
                    shape: {
                        type: 'rectangle'
                    }
                }]
            })
            .translateTo(i*self.divnum,self.dimeny,0)
            .streamMode(1)
            .mount(self.room[roomId].room);
        }

        //CREATING THE FLAGS
        self.flag1 = new Flag(1)
        .category("flags")
        .box2dBody({
            type: 'static',
            linearDamping: 0.0,
            angularDamping: 0.1,
            allowSleep: true,
            bullet: false,
            gravitic: false,
            fixedRotation: false,
            fixtures: [{
                shape: {
                    type: 'rectangle'
                }
            }]
        })
        .translateTo(100,100,0)
        .streamMode(1)
        .mount(self.room[roomId].room);

        self.flag2 = new Flag(2)
        .category("flags")
        .box2dBody({
            type: 'static',
            linearDamping: 0.0,
            angularDamping: 0.1,
            allowSleep: true,
            bullet: false,
            gravitic: false,
            fixedRotation: false,
            fixtures: [{
                shape: {
                    type: 'rectangle'
                }
            }]
        })
        .translateTo((self.dimenx - 100), (self.dimeny - 50), 0)
        .streamMode(1)
        .mount(self.room[roomId].room);

        //CREATING END POINTS
        self.endpoint1 = new Endpoints(1)
        .category("endpoints")
        .box2dBody({
            type: 'static',
            linearDamping: 0.0,
            angularDamping: 0.1,
            allowSleep: true,
            bullet: false,
            gravitic: false,
            fixedRotation: false,
            fixtures: [{
                shape: {
                    type: 'rectangle'
                }
            }]
        })
        .translateTo(100, (self.dimeny - 50), 0)
        .streamMode(1)
        .mount(self.room[roomId].room);

        //CREATING END POINTS
        self.endpoint2 = new Endpoints(2)
        .category("endpoints")
        .box2dBody({
            type: 'static',
            linearDamping: 0.0,
            angularDamping: 0.1,
            allowSleep: true,
            bullet: false,
            gravitic: false,
            fixedRotation: false,
            fixtures: [{
                shape: {
                    type: 'rectangle'
                }
            }]
        })
        .translateTo((self.dimenx - 100), 120, 0)
        .streamMode(1)
        .mount(self.room[roomId].room);
        
        self.room[roomId].objectCreated = true;
    },
    
    createContacts : function(){
        var self = this;
        ige.box2d.contactListener(
        // Listen for when contact's begin
            function (contact) {
                if(contact.igeEntityB()._streamRoomId != contact.igeEntityA()._streamRoomId){
                    return false;
                }
                
                if(contact.igeEitherCategory('player') && contact.igeEitherCategory('food')){
                    if(contact.igeEntityB()._category == 'player'){
                        delete self.room[contact.igeEntityB()._streamRoomId].food[contact.igeEntityA()._id];
                        //console.log(contact.igeEntityA().id());
                        contact.igeEntityA().destroy();
                        contact.igeEntityB().score += 100;
                        //console.log(contact.igeEntityB().score);
                        //ige.network.send("playerUpdate", {id:contact.igeEntityB()._id, score:contact.igeEntityB().score});
                    } else {
                        delete self.room[contact.igeEntityA()._streamRoomId].food[contact.igeEntityB()._id];
                        //console.log(contact.igeEntityA().id());
                        contact.igeEntityB().destroy();
                        contact.igeEntityA().score += 100;
                       // console.log(contact.igeEntityA().score);
                        //ige.network.send("playerUpdate", {id:contact.igeEntityA()._id, score:contact.igeEntityA().score});
                    }
                }

                if(contact.igeEitherCategory('player') && contact.igeEitherCategory('flags')){
                    if(contact.igeEntityB()._category == 'player'){
                        if(contact.igeEntityB().team != contact.igeEntityA().team){
                            contact.igeEntityA().player = contact.igeEntityB()._id;
                            //contact.igeEntityA().box2dActive(false);
                        }
                    } else {
                        if(contact.igeEntityB().team != contact.igeEntityA().team){
                            contact.igeEntityB().player = contact.igeEntityA()._id;
                            //contact.igeEntityB().box2dActive(false);
                        }
                    }
                }

                if(contact.igeEitherCategory('endpoints') && contact.igeEitherCategory('player')){
                    //console.log(contact.igeEntityB().team, contact.igeEntityA().team);
                    if(contact.igeEntityB()._category == 'player' && contact.igeEntityB().hasFlag && (contact.igeEntityB().team == contact.igeEntityA().team)){
                        //console.log("win1");
                        ige.network.send("gameEnd", {team:contact.igeEntityA().team});
                    } else if(contact.igeEntityA()._category == 'player' && contact.igeEntityA().hasFlag && (contact.igeEntityB().team == contact.igeEntityA().team)) {
                        console.log("win2");
                        ige.network.send("gameEnd", {team:contact.igeEntityA().team});
                    }

                }

                if(contact.igeEitherCategory('player') && contact.igeEitherCategory('rocks')){
                    //console.log("velocity stop");
                    if(contact.igeEntityB()._category == 'player'){
                        contact.igeEntityB().velocity._velocity.x = 0;
                        contact.igeEntityB().velocity._velocity.y = 0;
                        contact.igeEntityB().playerControl.controls.move = false;
                    } else {
                        contact.igeEntityA().velocity._velocity.x = 0;
                        contact.igeEntityA().velocity._velocity.y = 0;
                        contact.igeEntityA().playerControl.controls.move = false;
                    }
                }

                if(contact.igeEitherCategory('player') && contact.igeEitherCategory('attack')){
                    //console.log("HIT");
                    if(contact.igeEntityB().team != contact.igeEntityA().team){
                        if(contact.igeEntityB()._category == "player"){
                            //console.log(contact.igeEntityB().score)
                            contact.igeEntityB().values.health -= contact.igeEntityA().damage;
                            //ige.network.send("playerHit", {id:contact.igeEntityB()._id, health:contact.igeEntityB().values.health});
                        } else {
                            //console.log(contact.igeEntityA().score)
                            contact.igeEntityA().values.health -= contact.igeEntityB().damage;
                            //ige.network.send("playerHit", {id:contact.igeEntityA()._id, health:contact.igeEntityA().values.health});
                        }
                    }

                }
            },
            // Listen for when contact's end
            function (contact) {
                //console.log('Contact ends between', contact.igeEntityA()._id, 'and', contact.igeEntityB()._id);
            },
            // Handle pre-solver events
            function (contact) {
                //console.log(contact.igeEntityB()._streamRoomId, contact.igeEntityA()._streamRoomId);
                // For fun, lets allow ball1 and square2 to pass through each other
                //console.log(contact.igeEitherCategory('attack'));
                if(contact.igeEntityB()._streamRoomId == contact.igeEntityA()._streamRoomId){
                    if(contact.igeEitherCategory('player') && contact.igeEitherCategory('attack')){
                        if(contact.igeEntityB().team == contact.igeEntityA().team){
                            //console.log("FALSE");
                            contact.SetEnabled(false);
                        }
                        contact.SetEnabled(false);
                        // You can also check an entity by it's category using igeEitherCategory('categoryName')
                    }

                    if(contact.igeEitherCategory('endpoints')){
                        contact.SetEnabled(false);
                    }

                    if(contact.igeEitherCategory('flags') && contact.igeEitherCategory('player')){
                        contact.SetEnabled(false);
                    }   
                } else {
                    contact.SetEnabled(false);
                }
            }
        );
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }