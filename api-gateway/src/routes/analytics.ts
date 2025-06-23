import { Router } from 'express';
import analyticsController from '../controllers/analyticsController';

const router = Router();

// Historical analytics
router.get('/historical', analyticsController.getHistoricalAnalytics.bind(analyticsController));
router.get('/historical/summary', analyticsController.getHistoricalSummary.bind(analyticsController));
router.get('/historical/trends', analyticsController.getHistoricalTrends.bind(analyticsController));

// Real-time analytics
router.get('/realtime', analyticsController.getRealtimeAnalytics.bind(analyticsController));
router.get('/realtime/overview', analyticsController.getRealtimeOverview.bind(analyticsController));
router.get('/realtime/stream', analyticsController.getRealtimeStream.bind(analyticsController));

// Route-specific analytics
router.get('/routes/:routeId', analyticsController.getRouteAnalytics.bind(analyticsController));
router.get('/routes/:routeId/performance', analyticsController.getRoutePerformance.bind(analyticsController));

// User analytics
router.get('/users', analyticsController.getUserAnalytics.bind(analyticsController));
router.get('/users/:userId', analyticsController.getUserDetails.bind(analyticsController));

// Error analytics
router.get('/errors', analyticsController.getErrorAnalytics.bind(analyticsController));
router.get('/errors/summary', analyticsController.getErrorSummary.bind(analyticsController));

// Performance analytics
router.get('/performance', analyticsController.getPerformanceAnalytics.bind(analyticsController));
router.get('/performance/slowest-routes', analyticsController.getSlowestRoutes.bind(analyticsController));

export default router; 