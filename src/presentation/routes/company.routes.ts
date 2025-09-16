import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

export function createCompanyRouter(
  companyController: CompanyController,
): Router {
  const router = Router();
  router.use(authenticateToken);
  router.use(authorizeRoles('company'));

  // Company profile management routes
  router.post('/profile', companyController.createCompanyProfile);
  router.put('/profile', companyController.updateCompanyProfile);
  router.get('/profile', companyController.getCompanyProfile);
  router.get('/profile/:profileId', companyController.getCompanyProfileById);
  router.get('/dashboard', companyController.getCompanyDashboard);

  // File upload routes
  router.post('/upload/logo', uploadSingle('logo'), companyController.uploadLogo);
  router.post('/upload/business-license', uploadSingle('business_license'), companyController.uploadBusinessLicense);
  router.delete('/upload/delete', companyController.deleteImage);

  return router;
}
