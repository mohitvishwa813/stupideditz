import { DbService } from '../src/services/dbService.js';
import { INITIAL_BUNDLE_PROMO } from '../src/data/initialData.js';

async function seedPromo() {
  console.log('Seeding bundle promo to Turso DB...');
  try {
    await DbService.saveBundlePromoToDb(INITIAL_BUNDLE_PROMO);
    console.log('Successfully saved bundle promo!');
  } catch (err) {
    console.error('Error saving:', err);
  }
}

seedPromo();
