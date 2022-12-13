/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerInitial = express.Router();
import { fork } from 'child_process';
import os from 'os';
import { PORT } from '../../server.js'
import { fileURLToPath } from "url";
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { logger } from '../utils/logger.js';
import { upload } from '../../server.js';

/* ================== Mocks ================== */
import { productoMock } from '../mocks/producto.mock.js';

/* ============= Creacion de fork ============ */
const forkProcess = fork('./src/utils/apiRandomNumber.js')

/* ================ Passport ================== */
import passport from 'passport';

routerInitial.use(passport.initialize());
routerInitial.use(passport.session());

/* ============= Middlewares ============= */
    /*----- Compresion -----*/
import compression from 'compression';

    /*---- Autenticacion ----*/
function auth (req, res, next) {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.status(401).redirect('/login')
    }
};

/* ============= Routing y metodos ============= */
import { getMainInfo, loginPage, loginPageError, registerCredentials, registerPage, cartPage, logout } from '../controllers/initial.controllers.js';

//Ruta principal -> Home
routerInitial.get('/', compression(), auth, getMainInfo);

//Ruta del render de LOGIN
routerInitial.get('/login', loginPage);

//Ruta del render del error en el LOGUEO
routerInitial.get('/login-error', loginPageError);

//Ruta del render de REGISTRO
routerInitial.get('/register', registerPage);

//Autenticacion de las credenciales del LOGUEO
routerInitial.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login-error'}));

//Autenticacion de las credenciales del REGISTRO
routerInitial.post('/register', registerCredentials);

//Ruta del render del CARRITO
routerInitial.get('/carrito', auth, cartPage)

//Ruta para finalizar la sesion -> LOGOUT
routerInitial.get('/logout', logout);

routerInitial.get('/api/productos-test', auth, async (req, res) => {
    const cajaRandom = new productoMock();
    let productos = cajaRandom.generarDatos()
    res.status(200).render('productos-test', {productos})
})

routerInitial.get('/info', compression(), async (req, res) => {
    const processArgs = process.argv.slice(2);
    const processMemory = process.memoryUsage().rss
    const processDirectory = process.cwd()
    const CPU_CORES = os.cpus().length;
    const puerto = PORT;
    res.status(200).render('info', {process, processArgs, processMemory, processDirectory, CPU_CORES, puerto})
})

routerInitial.get('/api/randoms', async (req, res) => {
    const { cantidad } = req.query

    forkProcess.send(cantidad)
/*     forkProcess.on("message", msg =>{
        console.log(msg)
    }) */
    res.status(200).render('apiRandoms')
})


/* =========== Exportacion de modulo =========== */
export default routerInitial;