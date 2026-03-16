import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getPriceCategories,
  createPriceCategory,
  updatePriceCategory,
  deletePriceCategory,
  getPricePlans,
  createPricePlan,
  updatePricePlan,
  deletePricePlan,
  getPriceItems,
  getAdditionalServices,
  createAdditionalService,
  updateAdditionalService,
  deleteAdditionalService,
  getPriceDiscounts,
  createPriceDiscount,
  updatePriceDiscount,
  deletePriceDiscount,
  getPublicPrices
} from '../controllers/pricesControllerNew';

const router = express.Router();

// =================== ПУБЛИЧНЫЕ РОУТЫ ===================
// GET /api/admin/prices/public - получить все активные цены для публичной страницы
router.get('/public', getPublicPrices);

// =================== АДМИНСКИЕ РОУТЫ ===================
// Все админские роуты требуют аутентификации и админских прав
router.use(authenticateToken);
router.use(requireAdmin);

// КАТЕГОРИИ ЦЕН
router.get('/categories', getPriceCategories);
router.post('/categories', createPriceCategory);
router.put('/categories/:id', updatePriceCategory);
router.delete('/categories/:id', deletePriceCategory);

// ТАРИФНЫЕ ПЛАНЫ
router.get('/plans', getPricePlans);
router.post('/plans', createPricePlan);
router.put('/plans/:id', updatePricePlan);
router.delete('/plans/:id', deletePricePlan);

// ЦЕНЫ (PRICE_ITEMS)
router.get('/items', getPriceItems);

// ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ
router.get('/services', getAdditionalServices);
router.post('/services', createAdditionalService);
router.put('/services/:id', updateAdditionalService);
router.delete('/services/:id', deleteAdditionalService);

// СКИДКИ
router.get('/discounts', getPriceDiscounts);
router.post('/discounts', createPriceDiscount);
router.put('/discounts/:id', updatePriceDiscount);
router.delete('/discounts/:id', deletePriceDiscount);

export default router;
