import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class DigiLockerService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly apiUrl: string;

  constructor() {
    this.clientId = process.env.DIGILOCKER_CLIENT_ID || '';
    this.clientSecret = process.env.DIGILOCKER_CLIENT_SECRET || '';
    this.redirectUri = process.env.DIGILOCKER_REDIRECT_URI || '';
    this.apiUrl = process.env.DIGILOCKER_API_URL || '';
  }

  getAuthUrl(): string {
    return `${this.apiUrl}/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&state=xyz`;
  }

  async getAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post(`${this.apiUrl}/token`, {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get access token from DigiLocker');
    }
  }

  async fetchAadhaarDetails(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/aadhaar`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch Aadhaar details from DigiLocker');
    }
  }

  async verifyAadhaar(aadhaarNumber: string, accessToken: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/verify`,
        {
          aadhaar_number: aadhaarNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.verified;
    } catch (error) {
      throw new Error('Failed to verify Aadhaar with DigiLocker');
    }
  }
}

export default new DigiLockerService(); 