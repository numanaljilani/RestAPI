import express from 'express';
import { loginController , registerController , userController , refreshController , productController} from '../controllers';
import auth from '../middleware/auth';
import admin from '../middleware/admin';


const router = express.Router();


// Routes 
router.post('/register', registerController.register)
router.post('/login', loginController.login)
router.post('/logout', loginController.logout)
router.post('/refresh', refreshController.refresh)
router.get('/me',auth ,  userController.me)

// router.post('/product/cart-items', productController.getProduct);

router.post('/product', [ auth , admin ] ,productController.store);
router.put('/product/:id', [ auth , admin ] ,productController.update);
router.delete('/product/:id', [ auth , admin ] ,productController.destroy);
router.get('/product',productController.index);
router.get('/product/:id',productController.show);




export default router;