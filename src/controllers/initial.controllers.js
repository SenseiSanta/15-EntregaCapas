import {getMessages, getProducts, getUsers, getUserById, saveInfoUser} from '../services/inicial.service.js'
import { logger } from '../utils/logger.js';
import {registerEmailConfirmation as adminEmail} from '../utils/registerSendEmail.js';

const internalError = 'Error en el servidor, intente nuevamente'

/* =============== Passport =============== */
import passport from 'passport';
import { Strategy } from 'passport-local'
import path, { dirname } from 'path';
const LocalStrategy = Strategy;

passport.use(new LocalStrategy(
async function(username, password, done) {
    let usuario = await getUsers()
    let existeUsuario = usuario.find(usuario => usuario.username == username)

        if (!existeUsuario) {
            return done(null, false)
        } else {
            const match = await verifyPassword(existeUsuario, password)
            if (!match) {
                return done(null, false)
            }
            return done(null, existeUsuario)
        }
    }
));

passport.serializeUser((usuario, done)=>{
    done(null, usuario.username)
})

passport.deserializeUser(async (username, done)=> {
    let usuarios = await getUsers()
    let existeUsuario = usuarios.find(usuario => usuario.username == username)
    done(null, existeUsuario)
})

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

/* =============== Encriptacion =============== */
import bcrypt from 'bcrypt'

async function hashPassGenerator (password) {
    const hashPassword = await bcrypt.hash(password, 10)
    return hashPassword
}

async function verifyPassword(user, pass) {
    const match = await bcrypt.compare(pass, user.password);
    return match
}


/* =============== CONTROLADORES =============== */

//Obtener datos necesarios para la sesion de usuario
export async function getMainInfo(req, res) {
    try {
        const username = req.user.username;
        const phone = req.user.phone;
        const age = req.user.age;
        const image = req.user.image;
        const email = req.user.email;
        const address = req.user.address;
        const admin = req.user.admin;
        const messages = await getMessages()
        const products = await getProducts()
        res.status(200).render('vista', {products, messages, username, phone, age, image, email, address, admin})
    } catch (error) {
        logger.error(error)
        res.status(500).send(internalError)
    }
}

//Renderizado de la pagina de logueo
export async function loginPage(req, res) {
    try {
        res.status(200).render('login')
    } catch (error) {
        logger.error(error)
        res.status(500).send(internalError)
    }
}

//Renderizado de la pagina del error de logueo
export async function loginPageError(req, res) {
    try {
        res.status(200).render('login-error')
    } catch (error) {
        logger.error(error)
        res.status(500).send(internalError)
    }
}

//Renderizado de la pagina del REGISTRO
export async function registerPage(req, res) {
    try {
        res.status(200).render('register')
    } catch (error) {
        logger.error(error)
        res.status(500).send(internalError)
    }
}

//Procesamiento de las credenciales de REGISTRO
export async function registerCredentials(req, res) {
    try {
        const { usuario, password, phone, age, address, email } = req.body;
        let infoUser = {
        username: usuario,
        password: await hashPassGenerator(password),
        phone: phone,
        age: age,
        address: address,
        email: email,
        image: req.file.filename,
        cart: [],
        admin: false
        }
        if (usuario || password) {
            let user = await getUserById(usuario)
            if (user == undefined) {
                let guardarDatos = await saveInfoUser(infoUser)
                logger.info(`${infoUser.username} registrado con exito`)
                //send confimation to admin
                adminEmail(infoUser)
                res.status(201).redirect('/login')
            } else {
                const errorRegister = 'El usuario que intenta registar ya existe, intente con otro nombre'
                res.status(200).render('register', {errorRegister})
            }
        } else {
            res.status(200).render('register')
        }
    } catch (error) {
        logger.error(error)
        res.status(500).send(internalError)
    }
}

//Renderizado de la pagina del CARRITO
export async function cartPage(req, res) {
    try {
        const username = req.user.username;
        res.status(200).render('carrito', {username})
    } catch (error) {
        logger.error(error)
        res.status(500).send(internalError)
    }
}


export async function logout(req, res) {
    try {
        req.session.destroy((error) => {
            if (error) {
                throw new Error (error);
            } else {
                logger.info('logout ok');
                res.status(200).redirect('/login');
            }
        });
    } catch (error) {
        logger.error(error)
        res.status(500).send(internalError)
    }
}
