import { Router } from 'express';
import kycController from '../controllers/kyc.controller';

const router = Router();

// Initiate KYC process
router.get('/initiate', kycController.initiateKyc);

// Handle DigiLocker callback
router.get('/callback', kycController.handleCallback);

// Get KYC status
router.get('/status/:kycId', kycController.getKycStatus);

// Verify KYC
router.post('/verify/:kycId', kycController.verifyKyc);

export default router; 