import { Request, Response } from 'express';
import Kyc, { KycAttributes } from '../models/Kyc';
import digilockerService from '../services/digilocker.service';

// Ensure TypeScript picks up our custom type definitions
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      [key: string]: any;
    };
  }
}

class KycController {
  async initiateKyc(req: Request, res: Response) {
    try {
      const authUrl = digilockerService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initiate KYC process' });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Invalid authorization code' });
      }

      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const accessToken = await digilockerService.getAccessToken(code);
      const aadhaarDetails = await digilockerService.fetchAadhaarDetails(accessToken);

      // Create KYC record
      const kyc = await Kyc.create({
        userId: req.user.id,
        aadhaarNumber: aadhaarDetails.aadhaar_number,
        name: aadhaarDetails.name,
        dateOfBirth: new Date(aadhaarDetails.date_of_birth),
        gender: aadhaarDetails.gender,
        address: aadhaarDetails.address,
        digilockerId: aadhaarDetails.digilocker_id,
        status: 'pending' as const,
      });

      res.json({ message: 'KYC process initiated successfully', kycId: kyc.id });
    } catch (error) {
      console.error('KYC callback error:', error);
      res.status(500).json({ error: 'Failed to process KYC callback' });
    }
  }

  async getKycStatus(req: Request, res: Response) {
    try {
      const { kycId } = req.params;
      const kyc = await Kyc.findByPk(kycId);

      if (!kyc) {
        return res.status(404).json({ error: 'KYC record not found' });
      }

      res.json({ status: kyc.status });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch KYC status' });
    }
  }

  async verifyKyc(req: Request, res: Response) {
    try {
      const { kycId } = req.params;
      const kyc = await Kyc.findByPk(kycId);

      if (!kyc) {
        return res.status(404).json({ error: 'KYC record not found' });
      }

      // Update KYC status
      await kyc.update({
        status: 'verified',
        verificationDate: new Date(),
      });

      res.json({ message: 'KYC verified successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify KYC' });
    }
  }
}

export default new KycController(); 