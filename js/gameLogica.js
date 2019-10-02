var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_TOP,
        parent: 'phaser',
        width: 1124,
        height: 700
    },
    parent: 'phaser',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 535
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    audio: {
        disableWebAudio: false
    }
};

var jogador; // player
var estrelas;
var diamantes;
var bombas; // inimigos
var vidas;
var teclasDirecionais; // setas direcionais: esquerda, direita, para cima
var teclaA, teclaD, teclaEspaco, teclaPause, teclaEnter, teclaResume;
var pontosString, vidaString, pauseString, string; //String
var pontos = 0;
var quantidadeVida = 3;
var gameOver = false; // se a quantidadeVida zerar deverá receber TRUE
var plat1, plat2, plat3;
var musicaBackground, ping, hit, pulo, fim, vidaSom; // sons
var contDiamante = 0;
var game = new Phaser.Game(config); //objeto game com as funcionalidades do Phaser

function preload() {
    //SPRITES
    this.load.image("galaxy", 'arquivo/img/space.jpg');
    this.load.image("plat1", 'arquivo/img/plat1.png');
    this.load.image("plat2", 'arquivo/img/plat2.png');
    this.load.image("plat3", 'arquivo/img/plat3.jpg');
    this.load.image("estrela", 'arquivo/img/star.png');
    this.load.image("diamante", "arquivo/img/diamond.png");
    this.load.image("bomba", 'arquivo/img/slime2.png');
    this.load.image("cabeca", "arquivo/img/cabeca.png");
    this.load.image("vida", "arquivo/img/vida.png");
    this.load.spritesheet("char", 'arquivo/img/dude3.png', {
        frameWidth: 32,
        frameHeight: 48
    });
    // EFEITOS DE SOM
    this.load.audio("hit", "arquivo/som/hit.ogg");
    this.load.audio("vidaSom", "arquivo/som/pickup.ogg");
    this.load.audio("ping", "arquivo/som/ping.ogg");
    this.load.audio("pulo", "arquivo/som/pulo.ogg");
    this.load.audio("fim", "arquivo/som/shot.ogg");
    this.load.audio("intro", "arquivo/som/intro5.ogg");
}

function create() {
    musicaBackground = this.sound.add("intro");
    musicaBackground.play({
        loop: true
    });
    // ATRIBUINDOS OS VALORES DOS EFEITOS DE SOM
    ping = this.sound.add("ping");
    hit = this.sound.add("hit");
    pulo = this.sound.add("pulo");
    fim = this.sound.add("fim");
    vidaSom = this.sound.add("vidaSom");

    this.add.image(700, 400, "galaxy"); // Sprite do fundo (background)
    this.add.image(995, 47, "cabeca");

    plat1 = this.physics.add.staticGroup();
    plat2 = this.physics.add.staticGroup();
    plat3 = this.physics.add.staticGroup();

    // Plataformas
    plat3.create(600, 720, "plat3").setScale(2).refreshBody();
    plat1.create(130, 550, 'plat1');
    plat2.create(550, 450, 'plat2');
    plat1.create(850, 500, 'plat1');
    plat1.create(330, 200, 'plat1');
    plat1.create(250, 325, 'plat1');
    plat1.create(720, 275, 'plat1');
    plat1.create(790, 100, 'plat1');
    plat1.create(-100, 100, 'plat1');
    plat1.create(1195, 600, 'plat1');
    
     // Pontos
    pontosString = this.add.text(16, 16, "Score: 0", {
        fontSize: "32px",
        fill: "#40E0D0",
        fontFamily: "Arial",
        fontStyle: "bold",
    });
    pontosString.setStroke("#000000", 16);

    vidaString = this.add.text(1030, 10, "x 3", {
        fontSize: "45px",
        fill: "#40E0D0",
        fontFamily: "Arial",
        fontStyle: "bold"
    });
    vidaString.setStroke("#000000", 16);

    pauseString = this.add.text(255, 250, "", {
        fontSize: "50px",
        fill: "#40E0D0",
        fontFamily: "Arial",
        fontStyle: "bold",
        align: "center"
    });
    pauseString.setStroke("#000000", 16);

    string = this.add.text(80, 200, "", {
        fontSize: "50px",
        fill: "#40E0D0",
        fontFamily: "Arial",
        fontStyle: "bold",
        align: "center"
    });
    string.setStroke("#000000", 16);

    /* CONFIGURAÇÕES DO PERSONAGEM
    parâmetros onde o personagem vai "NASCER", coordenadas(X,Y,"nome do objeto") */
    jogador = this.physics.add.sprite(100, 650, 'dude');

    /* PROPRIEDADES FÍSICAS DO PERSONAGEM
       set.bounce pula levemente quando o 
       personagem colide com o chão e/ou plataforma */
    jogador.setBounce(0);
    jogador.setCollideWorldBounds(true);

    // PARÂMETROS DE ANIMAÇÃO DO PERSONAGEM
    this.anims.create({
        // ANIMAÇÃO PARA ESQUERDA
        key: 'left',
        frames: this.anims.generateFrameNumbers("char", {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });
    // ANIMAÇÃO QUANDO O PERSONAGEM ESTÁ PARADO E PULANDO
    this.anims.create({
        key: 'turn',
        frames: [{
            key: "char",
            frame: 4
        }],
        frameRate: 20
    });

    // ANIMAÇÃO PARA DIREITA
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers("char", {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    // TECLAS USADAS (INPUTS)
    teclasDirecionais = this.input.keyboard.createCursorKeys();

    /*Phaser.Input.Keyboard.KeyCodes.TECLA_USADA
    propriedade do PHASER 3 para pegar o código da tecla*/
    teclaA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    teclaD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    teclaPause = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    teclaResume = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    teclaEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    /*console.log(Phaser.Input.Keyboard.KeyCodes.A);
    console.log(Phaser.Input.Keyboard.KeyCodes.D);
    console.log(Phaser.Input.Keyboard.KeyCodes.SPACE);
    console.log(Phaser.Input.Keyboard.KeyCodes.ENTER);
    console.log(Phaser.Input.Keyboard.KeyCodes.P)
    console.log(Phaser.Input.Keyboard.KeyCodes.R)*/

    // PROPRIEDADES FÍSICAS DOS OBJETOS
    estrelas = this.physics.add.group({
        key: "estrela", // key criada na "FUNCTION CREATE"
        repeat: 15, // 1+15 = 16
        setXY: {
            x: 12, // coordenada das estrelas de X
            y: 0, //  coordenada das estrelas de Y
            stepX: 73 //espaçamento estre as estrelas
        }
    });

    estrelas.children.iterate(function (child) {
        // faz os objetos pularem
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.2));

    });
    diamantes = this.physics.add.group();
    vidas = this.physics.add.group();
    bombas = this.physics.add.group();

    /* PARÂMETROS DE COLISÕES
    jogador com plataformas */
    this.physics.add.collider(jogador, plat1);
    this.physics.add.collider(jogador, plat2);
    this.physics.add.collider(jogador, plat3);

    //estrelas com plataformas
    this.physics.add.collider(estrelas, plat1);
    this.physics.add.collider(estrelas, plat2);
    this.physics.add.collider(estrelas, plat3);

    // bombas com plataformas
    this.physics.add.collider(bombas, plat1);
    this.physics.add.collider(bombas, plat2);
    this.physics.add.collider(bombas, plat3);

    //diamantes com plataformas
    this.physics.add.collider(diamantes, plat1);
    this.physics.add.collider(diamantes, plat2);
    this.physics.add.collider(diamantes, plat3);

    //vidas com plataformas
    this.physics.add.collider(vidas, plat1);
    this.physics.add.collider(vidas, plat2);
    this.physics.add.collider(vidas, plat3);

    /* verifica se o jogador se soprepõe (OVERLAP)
    aos objetos (ESTRELAS, INIMIGO, DIAMANTE, VIDA) e chama a função desejada*/
    this.physics.add.overlap(jogador, estrelas, pegarEstrela, null, this);
    this.physics.add.overlap(jogador, bombas, encostarBomba, null, this);
    this.physics.add.overlap(jogador, diamantes, pegarDiamante, null, this);
    this.physics.add.overlap(jogador, vidas, pegarVida, null, this);
} // FUNÇÃO CRETATE ACABA AQUI

function resetar() {
    if (quantidadeVida <= 0) {
        if (teclaEnter.isDown) {
            location.reload(true);
        }
    }
}

function update() {
    // VERIFICA  SE AS TECLAS ESTÃO SENDO PRECIONADAS
    if (teclasDirecionais.left.isDown || teclaA.isDown) {
        jogador.setVelocityX(-200); // velocidade do personagem esquerda
        jogador.anims.play("left", true);

    } else if (teclasDirecionais.right.isDown || teclaD.isDown) {
        jogador.setVelocityX(200); // velocidade do personagem direita
        jogador.anims.play("right", true);

    } else {
        // "turn" é a key para o posição parado e pulando
        jogador.setVelocityX(0);
        jogador.anims.play("turn");
    }

    if (teclaEspaco.isDown && jogador.body.touching.down) {
        jogador.setVelocityY(-400); // gravidade do pulo
        pulo.play();
    }

    if (teclaPause.isDown) {
        musicaBackground.pause();
        pulo.mute = true;
        this.physics.pause();
        pauseString.setText("PAUSE\nAperte R para continuar");
    }

    if (teclaResume.isDown) {
        this.physics.resume();
        musicaBackground.resume();
        pulo.mute = false;
        pauseString.setText();
    }

    if (gameOver) {
        resetar();
    }
}

function pegarEstrela(jogador, estrela) {
    estrela.disableBody(true, true);

    // atualizando o valor dos pontos
    pontos++;
    pontosString.setText("Score: " + pontos);
    ping.play();

    /* váriavel para armazenar uma posição ALEATÓRIA no eixo "X" ENTRE 
    os pixels denominados, fazendo um cálculo COM A POSIÇÃO DO JOGADOR, 
    para o objeto não ser criado aproximado do mesmo*/
    var x = (jogador.x < 600) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    if (pontos % 12 == 0) {
        var diamante = diamantes.create(x, 100, "diamante");
        diamante.setCollideWorldBounds(true);
        diamante.allowGravity = true;
        // faz o diamante pular
        diamante.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    }

    /*if (estrelas.countActive(true) === 0) {
        /* countActive, verifica quantas estrelas ainda
        não foram coletadas 
        estrelas.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);
        });
    }*/
}

function pegarDiamante(jogador, diamante) {
    diamante.disableBody(true, true);
    pontos += 100;
    pontosString.setText("Score: " + pontos);
    contDiamante++;
    ping.play();
    //console.log(contDiamante);

    if (contDiamante % 5 == 0) {
        var vida = vidas.create(x, 100, "vida");
        vida.setCollideWorldBounds(true);
        vida.allowGravity = true;
        vida.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    }
    
    if (diamantes.countActive(true) === 0) {
        /* countActive, verifica quantas estrelas ainda
        não foram coletadas */
        estrelas.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);
        });
    }
    

    var x = (jogador.x < 800) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomba = bombas.create(x, 16, "bomba");
    bomba.setBounce(1);
    bomba.setCollideWorldBounds(true);

    /*velocidade das bombas "ENTRE(Math.Between) X," 
     último parâmetro velocidade em Y*/
    bomba.setVelocity(Phaser.Math.Between(-200, 200), 150);
    // Permitir gravidade true/false
    bomba.allowGravity = false;
  
    }


function pegarVida(jogador, vida) {
    vida.disableBody(true, true);
    quantidadeVida++;
    vidaSom.play();
    vidaString.setText("x " + quantidadeVida);
    //console.log(quantidadeVida);
}

function encostarBomba(jogador, bomba) {
    bomba.disableBody(true, true);
    quantidadeVida--;
    hit.play();
    vidaString.setText("x " + quantidadeVida);
    //console.log(quantidadeVida);

    if (quantidadeVida <= 0) {
        musicaBackground.stop();
        pulo.mute = true;
        fim.play();
        gameOver = true;
        this.physics.pause();
        string.setText("GAME OVER\n" +
            "Você marcou " + pontos + " pontos\n\nAperte ENTER para jogar novamente");
        jogador.setTint(0xff0000);
    }
}
