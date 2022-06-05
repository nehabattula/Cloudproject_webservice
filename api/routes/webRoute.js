import express from 'express'; //importing expressJS framework
import * as webController from '../controllers/webController.js'; //importing web Controller in routes
import * as imageController from '../controllers/UserImage.js';
//This endpoint routes the request further to the controller.
const router = express.Router();
router
    .route('/healthz')
    .get(webController.httpResponse) //endpoint routed : http://localhost:3001/healthz

router    
    .route('/v1/user')
    .post(webController.createUser) //endpoint router: http://localhost:3001/v1/user

router
    .route('/v1/user/self')        //endpoint router: http://localhost:3001/v1/user/self
    .put(webController.updateUser)
    .get(webController.getUser)

router
    .route('/v1/user/self/pic')
    .post(imageController.createOrUpdatePicture)
    .delete(imageController.deletePicture)
    .get(imageController.getPicture)
router
    .route('/v1/verifyEmail')
    .get(webController.verifyEmail)
    
export default router;
